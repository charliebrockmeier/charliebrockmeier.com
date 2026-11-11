#!/usr/bin/env python3
"""Download the public data behind "The Brockmeier Model" and write scripts/model/inputs.json.

    python3 -I scripts/model/fetch.py            # use cached downloads where present
    python3 -I scripts/model/fetch.py --refresh  # download everything again

Needs two pip packages for the spreadsheet formats: xlrd (.xls) and openpyxl (.xlsx).
Raw downloads go to scripts/model/.cache/ (gitignored). The parsed result, inputs.json,
is small and committed, so the model (scripts/model/build.mjs, plain Node) re-runs
without the network.

One source refuses plain HTTP clients (the SSA life table); scripts/model/fetch-browser.mjs
fetches that page with headless Chromium into the same cache. Run it first on a fresh
machine.

Every source is public. Nothing here comes from the author's employer, or from any index
or fund built on its data: U.S. stocks are CRSP (Ken French), international stocks are
French's Bloomberg-sourced series, valuations are S&P indexes, bonds are U.S. Treasury
curves, Bloomberg and ICE BofA indexes, real estate is FTSE Nareit.
"""
import datetime as dt
import html
import io
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
import zipfile

import openpyxl
import xlrd

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '.cache')
REFRESH = '--refresh' in sys.argv
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
os.makedirs(CACHE, exist_ok=True)


def get(name, url, pause=0.6):
    """Download url to the cache (once) and return the local path."""
    path = os.path.join(CACHE, name)
    if os.path.exists(path) and os.path.getsize(path) > 0 and not REFRESH:
        return path
    last = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': '*/*'})
            with urllib.request.urlopen(req, timeout=90) as r:
                data = r.read()
            with open(path, 'wb') as f:
                f.write(data)
            time.sleep(pause)
            return path
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(2 + 3 * attempt)
    # urllib sometimes trips on proxies that curl handles.
    r = subprocess.run(['curl', '-sS', '-L', '-m', '120', '-A', UA, '-o', path, url], capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(path) or os.path.getsize(path) == 0:
        raise RuntimeError(f'Could not download {url}: {last} / {r.stderr.strip()}')
    return path


def text(path, enc='utf-8'):
    with open(path, encoding=enc, errors='replace') as f:
        return f.read()


def ym(d):
    return f'{d.year:04d}-{d.month:02d}'


# ---------------------------------------------------------------- Treasury curves
TREASURY = 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/{y}/all?type={t}&field_tdr_date_value={y}&page&_format=csv'


def treasury(kind, first_year, last_year):
    """All daily rows for one Treasury curve as {date: {column: value}}."""
    rows = {}
    for y in range(first_year, last_year + 1):
        path = get(f'treasury_{kind}_{y}.csv', TREASURY.format(y=y, t=kind))
        lines = text(path).strip().splitlines()
        head = [h.strip().strip('"') for h in lines[0].split(',')]
        for line in lines[1:]:
            cells = [c.strip().strip('"') for c in line.split(',')]
            if len(cells) < 2 or '/' not in cells[0]:
                continue
            m, d, yy = cells[0].split('/')
            date = dt.date(int(yy), int(m), int(d))
            rows[date] = {h: float(c) for h, c in zip(head[1:], cells[1:]) if c not in ('', 'N/A')}
    return rows


def month_ends(rows, cols):
    """Last observation of each month for the given columns."""
    out = {}
    for date in sorted(rows):
        out[ym(date)] = (date, rows[date])
    months = sorted(out)
    return {
        'months': months,
        'dates': [out[m][0].isoformat() for m in months],
        **{c: [out[m][1].get(c) for m in months] for c in cols},
    }


# ---------------------------------------------------------------- Ken French
def french(name, url, col='Mkt-RF'):
    path = get(name, url)
    with zipfile.ZipFile(path) as z:
        body = z.read(z.namelist()[0]).decode('latin-1')
    lines = body.splitlines()
    source = lines[0].strip()
    out = {}
    head = None
    for line in lines:
        cells = [c.strip() for c in line.split(',')]
        if head is None:
            if col in cells:
                head = cells
            continue
        if not re.fullmatch(r'\d{6}', cells[0] or ''):
            if out:
                break  # the annual block follows the monthly one
            continue
        row = dict(zip(head, cells))
        out[f'{cells[0][:4]}-{cells[0][4:]}'] = (float(row[col]), float(row['RF']))
    return source, out


# ---------------------------------------------------------------- SSGA
def ssga_nav(ticker):
    """Month-end NAV history from the fund sponsor's published workbook."""
    path = get(f'ssga_navhist_{ticker}.xlsx', f'https://www.ssga.com/us/en/intermediary/etfs/library-content/products/fund-data/etfs/us/navhist-us-en-{ticker}.xlsx')
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    last = {}
    for r in wb.worksheets[0].iter_rows(values_only=True):
        if not r or not isinstance(r[0], str) or not isinstance(r[1], (int, float)):
            continue
        try:
            d = dt.datetime.strptime(r[0].strip(), '%d-%b-%Y').date()
        except ValueError:
            continue
        k = ym(d)
        if k not in last or d > last[k][0]:
            last[k] = (d, float(r[1]))
    months = sorted(last)
    return {'months': months, 'nav': [round(last[m][1], 6) for m in months], 'lastDate': last[months[-1]][0].isoformat()}


def ssga_page(slug):
    """Index and fund characteristics shown on the sponsor's public fund page."""
    path = get(f'ssga_page_{slug[-4:]}.html', f'https://www.ssga.com/us/en/intermediary/etfs/{slug}')
    t = text(path)
    flat = html.unescape(re.sub(r'\s+', ' ', re.sub(r'<script.*?</script>|<style.*?</style>', '', t, flags=re.S)))
    flat = re.sub(r'(\|\s*)+', ' | ', re.sub(r'<[^>]+>', '|', flat)).replace('﻿', '')
    out = {'url': f'https://www.ssga.com/us/en/intermediary/etfs/{slug}'}
    m = re.search(r'"Benchmark","value":"([^"]+)"', flat)
    out['benchmark'] = m.group(1) if m else None
    m = re.search(r'Index Statistics\s*\| as of ([A-Za-z]{3} \d{2} \d{4})', flat) or re.search(r'as of ([A-Za-z]{3} \d{2} \d{4})', flat)
    out['asOf'] = dt.datetime.strptime(m.group(1), '%b %d %Y').date().isoformat() if m else None

    def num(label, pattern=r'([\d.,]+)'):
        # The value sits right after the label once the glossary copy is skipped.
        mm = re.search(re.escape(label) + r'\s*\| ' + pattern, flat)
        return float(mm.group(1).replace(',', '')) if mm else None

    out['pe'] = num('Price/Earnings ')
    out['peFy1'] = num('Price/Earnings Ratio FY1 ')
    mm = re.search(r'Index Dividend Yield \| The weighted average[^|]*\| ([\d.]+)%', flat)
    out['indexDividendYield'] = float(mm.group(1)) if mm else None
    out['ytw'] = num('Average Yield To Worst ', r'([\d.]+)%')
    out['oas'] = None
    out['oad'] = None
    # Fund Characteristics come first on the page, Index Characteristics second.
    oas = re.findall(r'Option Adjusted Spread\s*\| ([\d.]+)', flat)
    oad = re.findall(r'Option Adjusted Duration\s*\| ([\d.]+) years', flat)
    ytw = re.findall(r'Average Yield To Worst\s*\| ([\d.]+)%', flat)
    if oas:
        out['oasFund'], out['oas'] = float(oas[0]), float(oas[-1])
    if oad:
        out['oadFund'], out['oad'] = float(oad[0]), float(oad[-1])
    if ytw:
        out['ytwFund'], out['ytw'] = float(ytw[0]), float(ytw[-1])
    return out


# ---------------------------------------------------------------- multpl (S&P 500 ratios)
def multpl(slug):
    path = get(f'multpl_{slug}.html', f'https://www.multpl.com/{slug}/table/by-month')
    t = text(path)
    rows = re.findall(r'<tr[^>]*>\s*<td[^>]*>(.*?)</td>\s*<td[^>]*>(.*?)</td>', t, flags=re.S)
    out = []
    for a, b in rows:
        a = re.sub(r'<[^>]+>|\s+', ' ', a).strip()
        b = html.unescape(re.sub(r'<[^>]+>|\s+', ' ', b)).strip()
        m = re.search(r'-?[\d.]+', b.replace(',', ''))
        if m:
            out.append((dt.datetime.strptime(a, '%b %d, %Y').date().isoformat(), float(m.group(0)), 'estimate' in b.lower() or '†' in b))
    return out


# ---------------------------------------------------------------- main
def main():
    out = {'generated': dt.date.today().isoformat(), 'notes': {}}

    # Treasury par curves. Real curve starts 2003; nominal from 1990.
    this_year = dt.date.today().year
    nominal = treasury('daily_treasury_yield_curve', 1990, this_year)
    real = treasury('daily_treasury_real_yield_curve', 2003, this_year)
    bills = treasury('daily_treasury_bill_rates', this_year, this_year)
    last_real = max(real)
    last_nom = max(nominal)
    last_bill = max(bills)
    out['treasury'] = {
        'source': 'U.S. Department of the Treasury, Daily Treasury Par Yield Curve Rates, Par Real Yield Curve Rates and Bill Rates',
        'real': {'date': last_real.isoformat(), **real[last_real]},
        'nominal': {'date': last_nom.isoformat(), **nominal[last_nom]},
        'bills': {'date': last_bill.isoformat(), **{k: v for k, v in bills[last_bill].items() if 'COUPON' in k}},
        'nominalMonthEnd': month_ends(nominal, ['3 Mo', '1 Yr', '2 Yr', '5 Yr', '7 Yr', '10 Yr', '20 Yr', '30 Yr']),
        'realMonthEnd': month_ends(real, ['5 YR', '7 YR', '10 YR', '20 YR', '30 YR']),
    }

    # Ken French: U.S. market (CRSP), developed ex U.S. and emerging (Bloomberg).
    base = 'https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/'
    src_us, us = french('ff_us.zip', base + 'F-F_Research_Data_Factors_CSV.zip')
    src_dev, dev = french('ff_devxus.zip', base + 'Developed_ex_US_3_Factors_CSV.zip')
    src_em, em = french('ff_em.zip', base + 'Emerging_5_Factors_CSV.zip')
    months = sorted(us)
    out['french'] = {
        'source': {'us': src_us, 'devExUs': src_dev, 'em': src_em},
        'months': months,
        'rf': [us[m][1] for m in months],
        'usMktRf': [us[m][0] for m in months],
        'devExUsMktRf': [dev[m][0] if m in dev else None for m in months],
        'emMktRf': [em[m][0] if m in em else None for m in months],
    }

    # FTSE Nareit All Equity REITs: monthly total and price return, dividend yield.
    wb = xlrd.open_workbook(get('nareit_monthly.xls', 'https://www.reit.com/sites/default/files/returns/MonthlyHistoricalReturns.xls'))
    sh = wb.sheet_by_name('Index Data')
    head = sh.row_values(5)
    c0 = head.index('All Equity REITs')
    nm, tr, pr, pidx, dy = [], [], [], [], []
    for i in range(9, sh.nrows):
        row = sh.row_values(i)
        if not isinstance(row[0], float):
            continue
        d = xlrd.xldate_as_datetime(row[0], wb.datemode).date()
        nm.append(ym(d))
        tr.append(row[c0] if row[c0] != '' else None)
        pr.append(row[c0 + 2] if row[c0 + 2] != '' else None)
        pidx.append(row[c0 + 3])
        dy.append(row[c0 + 5] if row[c0 + 5] != '' else None)
    out['nareit'] = {'source': sh.row_values(0)[0] + ', ' + sh.row_values(2)[0], 'series': 'All Equity REITs', 'months': nm, 'totalReturn': tr, 'priceReturn': pr, 'priceIndex': pidx, 'dividendYield': dy}

    # Fund sponsor NAV histories: gold bullion (LBMA price), high yield and investment grade credit.
    out['nav'] = {
        'gold': {'fund': 'SPDR Gold Shares (holds bullion; NAV follows the LBMA Gold Price PM)', **ssga_nav('gld')},
        'hy': {'fund': 'SPDR Bloomberg High Yield Bond ETF (Bloomberg High Yield Very Liquid Index)', **ssga_nav('jnk')},
        'ig': {'fund': 'SPDR Portfolio Corporate Bond ETF (Bloomberg U.S. Corporate Bond Index)', **ssga_nav('spbo')},
    }

    # Valuation and yield statistics for the S&P and bond indexes, from the sponsor's fund pages.
    out['indexStats'] = {
        'us': ssga_page('spdr-portfolio-sp-1500-composite-stock-market-etf-sptm'),
        'sp500': ssga_page('spdr-sp-500-etf-trust-spy'),
        'devExUs': ssga_page('spdr-portfolio-developed-world-ex-us-etf-spdw'),
        'em': ssga_page('spdr-portfolio-emerging-markets-etf-spem'),
        'ig': ssga_page('spdr-portfolio-corporate-bond-etf-spbo'),
        'hy': ssga_page('spdr-portfolio-high-yield-bond-etf-sphy'),
    }

    # S&P 500 ratios from multpl.com (Shiller CAPE, trailing P/E, earnings yield, dividend yield).
    out['multpl'] = {}
    for key, slug in [('cape', 'shiller-pe'), ('pe', 's-p-500-pe-ratio'), ('earningsYield', 's-p-500-earnings-yield'), ('dividendYield', 's-p-500-dividend-yield')]:
        rows = multpl(slug)
        out['multpl'][key] = {'date': rows[0][0], 'value': rows[0][1], 'estimate': rows[0][2], 'url': f'https://www.multpl.com/{slug}'}
    cape_rows = multpl('shiller-pe')
    out['multpl']['capeHistory'] = [[d, v] for d, v, _ in cape_rows if d.endswith('-01') or d == cape_rows[0][0]][:1900]

    # Damodaran: implied equity risk premium by month, and annual returns since 1928.
    wb = openpyxl.load_workbook(get('damodaran_erp.xlsx', 'https://pages.stern.nyu.edu/~adamodar/pc/implprem/ERPbymonth.xlsx'), read_only=True, data_only=True)
    rows = [r for r in wb['Historical ERP'].iter_rows(values_only=True)]
    head = [str(c).strip() if c else '' for c in rows[0]]
    data = [r for r in rows[1:] if isinstance(r[0], dt.datetime)]
    last = dict(zip(head, data[-1]))
    out['damodaranErp'] = {
        'date': last['Start of month'].date().isoformat(),
        'sp500': last['S&P 500'],
        'tbond': last['T.Bond Rate'],
        'erpT12m': last['ERP (T12m)'],
        'erpSustainable': last['ERP (T12 m with sustainable payout)'],
        'erpNormalized': last['ERP (Normalized)'],
        'erpNetCashYield': last['ERP (Net Cash Yield)'],
        'expectedReturn': last['Expected Return'],
        'cashFlowT12m': last['CF (Trailing 12 month)'],
        'history': [[r[0].date().isoformat(), r[head.index('ERP (T12m)')], r[head.index('T.Bond Rate')]] for r in data],
    }
    wb = xlrd.open_workbook(get('damodaran_histret.xls', 'https://pages.stern.nyu.edu/~adamodar/pc/datasets/histretSP.xls'))
    sh = wb.sheet_by_name('Returns by year')
    hrow = next(i for i in range(sh.nrows) if sh.row_values(i)[0] == 'Year')
    names = [str(c).strip() for c in sh.row_values(hrow)]
    col = {k: names.index(v) for k, v in {'stocks': 'S&P 500 (includes dividends)', 'bills': '3-month T.Bill', 'bonds': 'US T. Bond (10-year)', 'baa': 'Baa Corporate Bond', 'realEstate': 'Real Estate', 'gold': 'Gold*'}.items()}
    infl = next(i for i, n in enumerate(names) if n.lower().startswith('inflation'))
    hist = {'years': [], 'inflation': [], **{k: [] for k in col}}
    for i in range(hrow + 1, sh.nrows):
        row = sh.row_values(i)
        if not isinstance(row[0], float) or row[0] < 1900:
            break
        hist['years'].append(int(row[0]))
        hist['inflation'].append(row[infl])
        for k, c in col.items():
            hist[k].append(row[c])
    out['damodaranHist'] = hist

    # Shiller: monthly S&P composite price, dividends, earnings, CPI since 1871.
    wb = xlrd.open_workbook(get('shiller_ie_data.xls', 'https://img1.wsimg.com/blobby/go/e5e77e0b-59d1-44d9-ab25-4763ac982e53/downloads/ie_data.xls'))
    sh = wb.sheet_by_name('Data')
    sm, sp, sd, se, scpi, strp = [], [], [], [], [], []
    for i in range(8, sh.nrows):
        row = sh.row_values(i)
        if not isinstance(row[0], float):
            continue
        y = int(row[0])
        mth = int(round((row[0] - y) * 100))
        sm.append(f'{y:04d}-{mth:02d}')
        sp.append(row[1] if isinstance(row[1], float) else None)
        sd.append(row[2] if isinstance(row[2], float) else None)
        se.append(row[3] if isinstance(row[3], float) else None)
        scpi.append(row[4] if isinstance(row[4], float) else None)
        strp.append(row[9] if isinstance(row[9], float) else None)
    out['shiller'] = {'months': sm, 'price': sp, 'dividend': sd, 'earnings': se, 'cpi': scpi, 'realTotalReturnPrice': strp}

    # CPI-U, not seasonally adjusted, from the BLS public API (ten years per call).
    cpi = {}
    for a, b in [(2007, 2016), (2017, this_year)]:
        j = json.loads(text(get(f'bls_cpi_{a}_{b}.json', f'https://api.bls.gov/publicAPI/v2/timeseries/data/CUUR0000SA0?startyear={a}&endyear={b}')))
        for row in j['Results']['series'][0]['data']:
            if row['period'].startswith('M') and row['period'] != 'M13' and row['value'] not in ('-', ''):
                cpi[f"{row['year']}-{row['period'][1:]}"] = float(row['value'])
    out['cpi'] = {'source': 'BLS CPI-U, all items, not seasonally adjusted (CUUR0000SA0)', 'months': sorted(cpi), 'index': [cpi[m] for m in sorted(cpi)]}

    # Census CPS ASEC, table PINC-03: earnings of full-time, year-round workers by age.
    pinc = {}
    for code in range(3, 10):
        try:
            path = get(f'census_pinc03_1_{code}_2_1.xlsx', f'https://www2.census.gov/programs-surveys/cps/tables/pinc-03/2026/pinc03_1_{code}_2_1.xlsx')
        except RuntimeError:
            continue
        try:
            rows = [r for r in openpyxl.load_workbook(path, read_only=True, data_only=True).worksheets[0].iter_rows(values_only=True)]
        except zipfile.BadZipFile:  # the table has no file with this code
            os.remove(path)
            continue
        title = rows[1][0]
        labels = [str(r[0]).strip() for r in rows[:12] if r[0]]
        age = next((l for l in labels if re.match(r'\d\d (to \d\d )?Years', l)), None)
        work = next((l for l in labels if 'Full-Time' in l), None)
        m = re.match(r'(\d\d) to (\d\d) Years', age or '')
        if not work or not (m or (age or '').startswith('65 Years')):
            continue
        label = f'{m.group(1)}-{m.group(2)}' if m else '65+'
        if label == '25-64':
            continue
        entry = {'file': os.path.basename(path), 'labels': [age, work]}
        for r in rows:
            k = str(r[0] or '').strip().lower()
            if k.startswith('median earnings') or k == 'median':
                entry.setdefault('median', r[1])
                entry.setdefault('medianBachelorsPlus', r[7])
            if k.startswith('mean earnings') or k == 'mean':
                entry.setdefault('mean', r[1])
            if k == '....total':
                entry['workers000'] = r[1]
        pinc[label] = entry
    out['census'] = {'title': title, 'byAge': pinc}

    # Federal Reserve Survey of Consumer Finances 2025: family income and net worth by age.
    wb = openpyxl.load_workbook(get('scf2025_tables.xlsx', 'https://www.federalreserve.gov/econres/files/scf2025_tables_public_real_historical.xlsx'), read_only=True, data_only=True)
    scf = {}
    for sheet, key in [('Table 1 01-25', 'income'), ('Table 4', 'netWorth')]:
        rows = [r for r in wb[sheet].iter_rows(values_only=True)]
        hdr = next(r for r in rows if r and r[0] and str(r[0]).startswith('Family characteristic'))
        ycol = max(i for i, c in enumerate(hdr) if c == 2025)
        block = {'title': str(rows[0][0]).strip(), 'units': str(rows[1][0]).strip()}
        for r in rows:
            name = str(r[0] or '').strip()
            if name in ('All families', 'Less than 35', '35–44', '45–54', '55–64', '65–74', '75 or more'):
                block[name] = {'median': r[ycol], 'mean': r[ycol + 1]}
        scf[key] = block
    out['scf'] = scf

    # Target-date funds: issuer-reported holdings by vintage, as republished by StockAnalysis.
    def holdings(ticker):
        t = text(get(f'sa_holdings_{ticker}.html', f'https://stockanalysis.com/quote/mutf/{ticker}/holdings/', pause=1.5))
        flat = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', re.sub(r'<script.*?</script>|<style.*?</style>', ' ', t, flags=re.S))))
        as_of = re.search(r'Holdings List As of ([A-Za-z]{3} \d{1,2}, \d{4})', flat).group(1)
        body = flat[flat.index('% Weight Shares'):]
        body = body[:body.index('As of')]
        rows = re.findall(r'\d+ (\S+) (.+?) (-?[\d.]+)% [\d,]+', body)
        return {'ticker': ticker, 'asOf': dt.datetime.strptime(as_of, '%b %d, %Y').date().isoformat(), 'url': f'https://stockanalysis.com/quote/mutf/{ticker}/holdings/', 'holdings': [[sym, name.strip(), float(w)] for sym, name, w in rows]}

    vintages = {'2070': 'VSVNX', '2065': 'VLXVX', '2060': 'VTTSX', '2055': 'VFFVX', '2050': 'VFIFX', '2045': 'VTIVX', '2040': 'VFORX', '2035': 'VTTHX', '2030': 'VTHRX', '2025': 'VTTVX', '2020': 'VTWNX', 'Income': 'VTINX'}
    out['targetDate'] = {'series': 'Vanguard Target Retirement Funds', 'byVintage': {v: holdings(tk) for v, tk in vintages.items()}, 'schwab2065': holdings('SWYOX')}

    # Last sale of one listed closed-end fund, for the "My own portfolio" section.
    q = json.loads(text(get('nasdaq_rvii.json', 'https://api.nasdaq.com/api/quote/RVII/info?assetclass=stocks')))['data']
    out['quotes'] = {'RVII': {'last': q['primaryData']['lastSalePrice'], 'date': q['primaryData']['lastTradeTimestamp'], 'url': 'https://www.nasdaq.com/market-activity/stocks/rvii'}}

    # Month-end closing prices for the listed holdings named in "My own portfolio"
    # (Nasdaq's public quote API; ten years of daily history; price only, no dividends).
    prices = {}
    today = dt.date.today()
    for ticker, cls in [('GOOGL', 'stocks'), ('NOW', 'stocks'), ('SMH', 'etf'), ('GGLL', 'etf'), ('AVUV', 'etf'), ('SLV', 'etf')]:
        url = f'https://api.nasdaq.com/api/quote/{ticker}/historical?assetclass={cls}&fromdate={today.year - 10}-{today.month:02d}-{today.day:02d}&limit=9999&todate={today.isoformat()}'
        rows = json.loads(text(get(f'nasdaq_hist_{ticker}.json', url, pause=1.0)))['data']['tradesTable']['rows']
        last = {}
        for r in rows:
            d = dt.datetime.strptime(r['date'], '%m/%d/%Y').date()
            k = ym(d)
            if k not in last or d > last[k][0]:
                last[k] = (d, float(r['close'].replace('$', '').replace(',', '')))
        ms = sorted(last)
        prices[ticker] = {'months': ms, 'close': [last[m][1] for m in ms], 'lastDate': last[ms[-1]][0].isoformat()}
    out['prices'] = {'source': 'Nasdaq historical quotes (api.nasdaq.com), month-end closes, not adjusted for dividends', 'series': prices}

    # SSA period life table (fetched by fetch-browser.mjs; the site blocks plain clients).
    ssa_path = os.path.join(CACHE, 'ssa_table4c6.html')
    if os.path.exists(ssa_path):
        t = text(ssa_path)
        year = re.search(r'Period Life Table, (\d{4})', re.sub(r'<[^>]+>', ' ', t)).group(1)
        life = []
        for r in re.findall(r'<tr[^>]*>(.*?)</tr>', t, flags=re.S):
            cells = [re.sub(r'<[^>]+>|\s+|,', '', c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, flags=re.S)]
            if len(cells) >= 7 and cells[0].isdigit():
                life.append([int(cells[0]), float(cells[1]), float(cells[4])])
        out['ssa'] = {'source': f'Social Security Administration, Actuarial Life Table, period life table {year}', 'year': int(year), 'age': [r[0] for r in life], 'qMale': [r[1] for r in life], 'qFemale': [r[2] for r in life]}
    else:
        out['notes']['ssa'] = 'SSA life table not in cache; run scripts/model/fetch-browser.mjs first.'

    with open(os.path.join(HERE, 'inputs.json'), 'w') as f:
        json.dump(out, f, separators=(',', ':'))
    size = os.path.getsize(os.path.join(HERE, 'inputs.json'))
    print(f'Wrote scripts/model/inputs.json ({size / 1024:.0f} KB)')
    print('Real curve', out['treasury']['real'])
    print('Nominal curve', out['treasury']['nominal'])
    for k, v in out['indexStats'].items():
        print(k, {a: b for a, b in v.items() if a != 'url'})
    print({k: (v['date'], v['value']) for k, v in out['multpl'].items() if isinstance(v, dict)})
    print({k: v for k, v in out['damodaranErp'].items() if k != 'history'})
    print('French through', months[-1], '| Nareit through', nm[-1], '| CPI through', out['cpi']['months'][-1])
    print('Census', out['census']['byAge'])
    print('SCF', json.dumps(out['scf'])[:900])
    for v, h in out['targetDate']['byVintage'].items():
        print(v, h['asOf'], h['holdings'])
    print('Schwab 2065', out['targetDate']['schwab2065'])
    print(out['quotes'])
    print({k: (v['months'][0], v['months'][-1], v['close'][-1]) for k, v in out['prices']['series'].items()})


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Rebuild src/data/paper2026-data.json, the public market data behind the paper's
own-arithmetic charts. Standard library only.

    npm run paper:data

Inputs, both public and free:
  * Kenneth R. French Data Library, Fama/French 3 Factors (monthly): the CRSP
    value-weighted U.S. stock market return in excess of bills, and the one-month
    Treasury bill return.
  * U.S. Treasury daily par real yield curve (TIPS).

What it computes:
  1. The marking experiment. Take the U.S. stock market, lever it 1.3 times with
     Treasury bills, and value it two ways each quarter: at the market, and the way an
     appraiser would, as the geometric average of the last k quarter-end values.
     Same assets, same cash, two sets of risk statistics.
  2. Average Treasury bill returns over the horizons Cambridge Associates reports, so
     the paper can adjust the buyout index for market beta.
  3. The latest real yields, and those at the end of 2025.
"""
import csv
import io
import json
import math
import statistics
import sys
import urllib.request
import zipfile
from pathlib import Path

FRENCH = 'https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/F-F_Research_Data_Factors_CSV.zip'
TREASURY = (
    'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/'
    '{year}/all?type=daily_treasury_real_yield_curve&field_tdr_date_value={year}&page&_format=csv'
)
OUT = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'paper2026-data.json'

LEVERAGE = 1.3  # market beta of buyout investments in Franzoni, Nowak and Phalippou (2012)
WINDOW = 4  # quarters in the appraisal average; halves volatility, as Anson (2024) finds for small buyouts
START = (2000, 1)  # first quarter reported
END = (2026, 3)  # last quarter reported; pinned so a rerun reproduces the paper's numbers
AS_OF = '11/09/2026'  # Treasury curve date quoted in the paper
LAGS_FROM = (1998, 1)  # history needed for windows up to eight quarters


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def french_monthly():
    """[(yyyymm, market excess return, bill return)] as decimals."""
    z = zipfile.ZipFile(io.BytesIO(get(FRENCH)))
    text = z.read(z.namelist()[0]).decode('latin1')
    out = []
    for line in text.splitlines():
        cells = [c.strip() for c in line.split(',')]
        if len(cells) >= 5 and len(cells[0]) == 6 and cells[0].isdigit():
            out.append((int(cells[0]), float(cells[1]) / 100, float(cells[4]) / 100))
        elif out and not line.strip():
            break  # the annual table follows the first blank line after the monthly one
    return out


def quarterly(months):
    """{(year, q): (market, levered, bills)} total returns for complete quarters."""
    acc = {}
    for ym, mkt_rf, rf in months:
        y, m = divmod(ym, 100)
        k = (y, (m - 1) // 3 + 1)
        a = acc.setdefault(k, [1.0, 1.0, 1.0, 0])
        a[0] *= 1 + mkt_rf + rf
        a[1] *= 1 + LEVERAGE * mkt_rf + rf
        a[2] *= 1 + rf
        a[3] += 1
    return {k: (a[0] - 1, a[1] - 1, a[2] - 1) for k, a in acc.items() if a[3] == 3}


def stats(ret, mkt, bills):
    """Risk statistics from quarterly returns."""
    n = len(ret)
    vol = statistics.stdev(ret) * 2
    mm, mr = statistics.fmean(mkt), statistics.fmean(ret)
    cov = sum((a - mr) * (b - mm) for a, b in zip(ret, mkt)) / (n - 1)
    var_m = statistics.variance(mkt)
    excess = [a - b for a, b in zip(ret, bills)]
    level, peak, dd = 1.0, 1.0, 0.0
    for r in ret:
        level *= 1 + r
        peak = max(peak, level)
        dd = min(dd, level / peak - 1)
    ac = sum((ret[i] - mr) * (ret[i - 1] - mr) for i in range(1, n)) / sum((r - mr) ** 2 for r in ret)
    return {
        'vol': round(vol * 100, 1),
        'beta': round(cov / var_m, 2),
        'corr': round(cov / (statistics.stdev(ret) * statistics.stdev(mkt)), 2),
        'sharpe': round(statistics.fmean(excess) * 4 / vol, 2),
        'maxDrawdown': round(dd * 100, 1),
        'worstQuarter': round(min(ret) * 100, 1),
        'autocorr': round(ac, 2),
        'annualReturn': round((level ** (4 / n) - 1) * 100, 1),
    }


def appraise(levels, k):
    """Appraised value: geometric mean of the last k quarter-end values."""
    logs = [math.log(v) for v in levels]
    return [math.exp(statistics.fmean(logs[i - k + 1 : i + 1])) for i in range(k - 1, len(logs))]


def returns(levels):
    return [b / a - 1 for a, b in zip(levels, levels[1:])]


def worst_fall(levels, labels, lo, hi):
    """Largest peak-to-trough fall in quarter-end values between two labels."""
    i0, i1 = labels.index(lo), labels.index(hi)
    peak, dd = levels[i0], 0.0
    for v in levels[i0 : i1 + 1]:
        peak = max(peak, v)
        dd = min(dd, v / peak - 1)
    return round(dd * 100, 1)


def bill_average(months, first, last):
    """Annualized compound bill return, first and last as yyyymm inclusive."""
    rs = [rf for ym, _, rf in months if first <= ym <= last]
    total = math.prod(1 + r for r in rs)
    return round((total ** (12 / len(rs)) - 1) * 100, 2)


def real_curve(year, want=None):
    rows = list(csv.DictReader(io.StringIO(get(TREASURY.format(year=year)).decode('utf8'))))
    # Newest first. `want` is mm/dd/yyyy; default is the newest row.
    row = next((r for r in rows if want is None or r['Date'] == want), None)
    if row is None:
        raise SystemExit(f'No Treasury real yield curve for {want}')
    return {'date': row['Date'], **{k.replace(' YR', 'y'): float(v) for k, v in row.items() if k != 'Date' and v}}


def main():
    months = french_monthly()
    q = quarterly(months)
    keys = sorted(k for k in q if LAGS_FROM <= k <= END)
    label = lambda k: f'{k[0]}Q{k[1]}'
    mkt_r = [q[k][0] for k in keys]
    lev_r = [q[k][1] for k in keys]
    bill_r = [q[k][2] for k in keys]
    # Quarter-end values, starting from 1 before the first quarter of history.
    lev_v = [1.0]
    mkt_v = [1.0]
    for a, b in zip(lev_r, mkt_r):
        lev_v.append(lev_v[-1] * (1 + a))
        mkt_v.append(mkt_v[-1] * (1 + b))
    first = keys.index(START)  # index into returns; the value before it is lev_v[first]

    def window(k):
        app = appraise(lev_v, k)  # app[j] is the value at lev_v index j + k - 1
        vals = app[first - (k - 1) :]  # from the quarter-end before START
        return vals, returns(vals)

    m = mkt_r[first:]
    b = bill_r[first:]
    by_window = []
    for k in range(1, 9):
        _, r = window(k)
        by_window.append({'k': k, **stats(r, m, b)})

    vals4, r4 = window(WINDOW)
    base_m = mkt_v[first]
    base_l = lev_v[first]
    labels = [label(keys[first - 1])] + [label(k) for k in keys[first:]]
    series = {
        'labels': labels,
        'market': [round(v / base_m * 100, 1) for v in mkt_v[first:]],
        'levered': [round(v / base_l * 100, 1) for v in lev_v[first:]],
        # Same base as the levered line, so the gap between them is the appraisal lag.
        'appraised': [round(v / base_l * 100, 1) for v in vals4],
    }
    episodes = []
    for name, lo, hi in [('2007–09', '2007Q3', '2009Q4'), ('2020', '2019Q4', '2020Q4'), ('2022', '2021Q4', '2023Q4')]:
        episodes.append(
            {
                'name': name,
                'market': worst_fall(series['market'], labels, lo, hi),
                'levered': worst_fall(series['levered'], labels, lo, hi),
                'appraised': worst_fall(series['appraised'], labels, lo, hi),
            }
        )

    last = END[0] * 100 + END[1] * 3
    horizons = {str(y): bill_average(months, (2026 - y) * 100 + 1, 202512) for y in (10, 15, 20, 25)}

    data = {
        'note': 'Generated by scripts/paper-data.py from public data. Do not edit by hand.',
        'french': {'through': last, 'source': FRENCH},
        'marking': {
            'leverage': LEVERAGE,
            'window': WINDOW,
            'from': label(START),
            'to': label(keys[-1]),
            'quarters': len(m),
            'market': stats(m, m, b),
            'levered': stats(lev_r[first:], m, b),
            'appraised': stats(r4, m, b),
            'byWindow': by_window,
            'episodes': episodes,
            'series': series,
        },
        'bills': {'horizonsToDec2025': horizons},
        'realYields': {'latest': real_curve(2026, AS_OF), 'end2025': real_curve(2025, '12/31/2025')},
    }
    OUT.write_text(json.dumps(data, indent=1) + '\n')
    mk = data['marking']
    print(f"French data through {last}; {mk['quarters']} quarters {mk['from']} to {mk['to']}.")
    for name in ('market', 'levered', 'appraised'):
        print(f'  {name:9s}', mk[name])
    print('  bills', horizons)
    print('  real yields', data['realYields'])


if __name__ == '__main__':
    sys.exit(main())

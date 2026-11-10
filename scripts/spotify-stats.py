#!/usr/bin/env python3
"""Rebuild src/data/spotify.json from a Spotify "Account data" export.

    python3 -I scripts/spotify-stats.py "/path/to/Spotify Account Data"

Reads ONLY StreamingHistory_music_*.json and Wrapped*.json. The export also holds
personal files (address, identifiers, messages, payments, inferences): this script
never opens them, and they must never be committed. Covers the last 12 full months
in the history, in Eastern time. White-noise "artists" are left out of the music and
reported separately as boxFanHours.
"""
import collections
import datetime
import glob
import json
import os
import sys
from zoneinfo import ZoneInfo

NOISE = {'Big Fan'}
NY = ZoneInfo('America/New_York')
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'spotify.json')


def main(folder):
    files = sorted(glob.glob(os.path.join(folder, 'StreamingHistory_music_*.json')))
    if not files:
        sys.exit(f'No StreamingHistory_music_*.json in {folder}')
    rows = [r for f in files for r in json.load(open(f, encoding='utf-8'))]
    when = lambda r: datetime.datetime.strptime(r['endTime'], '%Y-%m-%d %H:%M').replace(tzinfo=datetime.timezone.utc).astimezone(NY)

    last = max(when(r) for r in rows)
    end = datetime.datetime(last.year + (last.month == 12), last.month % 12 + 1, 1, tzinfo=NY)
    start = datetime.datetime(end.year - 1, end.month, 1, tzinfo=NY)
    year = [r for r in rows if start <= when(r) < end]
    noise = [r for r in year if r['artistName'] in NOISE]
    music = [r for r in year if r['artistName'] not in NOISE]
    hours = lambda ms: ms / 3.6e6

    artists, tracks = collections.Counter(), collections.Counter()
    by_hour, by_month, by_weekday = collections.Counter(), collections.Counter(), collections.Counter()
    for r in music:
        t = when(r)
        artists[r['artistName']] += r['msPlayed']
        if r['msPlayed'] >= 30000:  # Spotify counts a play at 30 seconds
            tracks[(r['trackName'], r['artistName'])] += 1
        by_hour[t.hour] += r['msPlayed']
        by_month[t.strftime('%Y-%m')] += r['msPlayed']
        by_weekday[t.weekday()] += r['msPlayed']

    days = sorted({when(r).date() for r in music})
    best = run = 1
    for a, b in zip(days, days[1:]):
        run = run + 1 if (b - a).days == 1 else 1
        best = max(best, run)

    out = {
        'window': {'from': start.strftime('%Y-%m'), 'to': (end - datetime.timedelta(days=1)).strftime('%Y-%m')},
        'hours': round(hours(sum(r['msPlayed'] for r in music))),
        'plays': sum(1 for r in music if r['msPlayed'] >= 30000),
        'artists': len(artists),
        'tracks': len({(r['trackName'], r['artistName']) for r in music}),
        'days': len(days),
        'bestStreak': best,
        'topArtists': [{'name': a, 'hours': round(hours(ms), 1)} for a, ms in artists.most_common(6)],
        'topTracks': [{'name': n, 'artist': a, 'plays': c} for (n, a), c in tracks.most_common(5)],
        'byHour': [round(hours(by_hour[h]), 1) for h in range(24)],
        'byMonth': [{'m': k, 'hours': round(hours(v), 1)} for k, v in sorted(by_month.items())],
        'byWeekday': [round(hours(by_weekday[i]), 1) for i in range(7)],
        'boxFanHours': round(hours(sum(r['msPlayed'] for r in noise))),
    }

    wrapped = sorted(glob.glob(os.path.join(folder, 'Wrapped*.json')))
    if wrapped:
        w = json.load(open(wrapped[-1], encoding='utf-8'))
        out['wrapped' + os.path.basename(wrapped[-1])[7:11]] = {
            'minutes': round(w['yearlyMetrics']['totalMsListened'] / 60000),
            'artists': w['topArtists']['numUniqueArtists'],
            'tracks': w['topTracks']['numUniqueTracks'],
            'genres': w['topGenres']['totalNumGenres'],
            'listeningAge': w['listeningAge']['listeningAge'],
            'club': w['clubs']['userClub'],
            'clubRole': w['clubs']['role'],
            'topFanPercent': round(w['topArtists']['topNPercentileFan'] * 100, 2),
        }

    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=1, ensure_ascii=False)
        f.write('\n')
    print(f"{out['window']['from']} to {out['window']['to']}: {out['hours']} hours -> src/data/spotify.json")


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])

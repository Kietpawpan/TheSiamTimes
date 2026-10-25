#!/usr/bin/env python3
"""Fetch green/environmental tech headlines from Google News RSS and write
them as JSON for techReviews.html.

Runs in GitHub Actions (see .github/workflows/update-tech-news.yml) so the
page can load news from its own site instead of relying on public CORS
proxies. Uses only the Python standard library.

Usage: python3 scripts/fetch_tech_news.py [output.json]
"""
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

# One query per phrase gets more coverage than one combined query, since
# Google News returns at most 100 items per request.
QUERIES = [
    '"green technology" when:7d',
    '"environmental technology" when:7d',
    '"clean tech" OR cleantech when:7d',
    '"climate tech" when:7d',
]
MAX_ITEMS = 200


def rss_url(query):
    return ('https://news.google.com/rss/search?q=' + urllib.parse.quote(query)
            + '&hl=en-US&gl=US&ceid=US:en')


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (techReviews news fetcher)'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def parse(xml_bytes):
    items = []
    for node in ET.fromstring(xml_bytes).iter('item'):
        title = (node.findtext('title') or '').strip()
        source = (node.findtext('source') or '').strip()
        # Google News appends " - Publisher" to every headline.
        if source and title.endswith(' - ' + source):
            title = title[:-len(' - ' + source)].strip()
        try:
            published = parsedate_to_datetime(node.findtext('pubDate') or '')
            published = published.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        except (TypeError, ValueError):
            published = None
        if title:
            items.append({
                'title': title,
                'link': (node.findtext('link') or '').strip(),
                'source': source,
                'pubDate': published,
            })
    return items


def dedupe_key(title):
    return re.sub(r'[^a-z0-9]+', ' ', title.lower()).strip()


def main():
    out_path = sys.argv[1] if len(sys.argv) > 1 else 'techReviews.json'
    seen, items, failures = set(), [], 0
    for query in QUERIES:
        try:
            batch = parse(fetch(rss_url(query)))
        except Exception as exc:  # keep going if one query fails
            failures += 1
            print(f'warning: query {query!r} failed: {exc}', file=sys.stderr)
            continue
        for item in batch:
            key = dedupe_key(item['title'])
            if key not in seen:
                seen.add(key)
                items.append(item)

    if failures == len(QUERIES) or not items:
        # Leave the previous file in place rather than publishing an empty feed.
        sys.exit('error: no articles fetched; keeping existing file')

    items.sort(key=lambda i: i['pubDate'] or '', reverse=True)
    data = {
        'generated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'source': 'Google News',
        'items': items[:MAX_ITEMS],
    }
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print(f'wrote {len(data["items"])} articles to {out_path}')


if __name__ == '__main__':
    main()

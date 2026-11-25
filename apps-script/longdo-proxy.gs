/**
 * Longdo Map relay for thesiamtimes.com (fireRadar.html, hotspotRadar.html, incident.html)
 *
 * The pages used to call Longdo with the API key written in their code, so anyone could copy it
 * and use up the free allowance. Now they call this Apps Script instead. The key lives only in
 * this script's settings, and the relay can do just two things: look up the place name for a
 * point in Thailand, and search for one place by name.
 *
 * Setup (do these in order, so the site never loses address lookups):
 *   1. In the Longdo Map API console, create a NEW key. The old key is public (it is in the
 *      site's code and git history), so it must be replaced, not reused.
 *   2. script.google.com > New project > paste this whole file > Save.
 *   3. Project Settings (gear icon) > Script properties > Add:
 *        LONGDO_KEY  = the new key
 *        DAILY_LIMIT = most Longdo calls allowed per day (optional, default 3000;
 *                      set it below your free allowance)
 *   4. Deploy > New deployment > type "Web app"
 *        Execute as: Me      Who has access: Anyone
 *      Copy the Web app URL (ends in /exec) and put it in LONGDO_PROXY_URL in the three pages.
 *   5. After the updated pages are live, delete the old key in the Longdo console.
 *
 * To change this code later: Deploy > Manage deployments > edit (pencil) > Version: New version.
 * That keeps the same URL, so the pages don't need updating.
 *
 * Calls:
 *   ?action=address&lat=13.75&lon=100.5   -> Longdo address JSON (subdistrict, district, province, ...)
 *   ?action=search&keyword=...            -> Longdo search JSON, first result only
 * Errors come back as {"error": "..."}; the pages already treat that like "no data".
 */

var ADDRESS_URL = 'https://api.longdo.com/map/services/address';
var SEARCH_URL = 'https://search.longdo.com/mapsearch/json/search';
var CACHE_SECONDS = 21600;        // 6 hours, the longest Apps Script can cache
var DEFAULT_DAILY_LIMIT = 3000;

function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action === 'address') return address_(p);
    if (p.action === 'search') return search_(p);
    return json_({ error: 'unknown action' });
  } catch (err) {
    return json_({ error: 'relay error' });
  }
}

function address_(p) {
  var lat = Number(p.lat), lon = Number(p.lon);
  // Thailand and a margin around it; the pages never ask about anywhere else
  if (!isFinite(lat) || !isFinite(lon) || lat < 4 || lat > 22 || lon < 96 || lon > 107) {
    return json_({ error: 'bad coordinates' });
  }
  // 4 decimals is about 10 m: repeat lookups of the same point share one cached answer
  var la = lat.toFixed(4), lo = lon.toFixed(4);
  return cachedFetch_('a:' + la + ',' + lo, ADDRESS_URL + '?lon=' + lo + '&lat=' + la);
}

function search_(p) {
  var kw = String(p.keyword || '').trim().slice(0, 100);
  if (!kw) return json_({ error: 'empty keyword' });
  return cachedFetch_('s:' + kw, SEARCH_URL + '?keyword=' + encodeURIComponent(kw) + '&limit=1');
}

function cachedFetch_(cacheKey, url) {
  var cache = CacheService.getScriptCache();
  var hit = cache.get(cacheKey);
  if (hit) return text_(hit);

  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('LONGDO_KEY');
  if (!key) return json_({ error: 'LONGDO_KEY is not set' });
  if (!takeQuota_(props)) return json_({ error: 'daily limit reached' });

  var res = UrlFetchApp.fetch(url + '&key=' + encodeURIComponent(key), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return json_({ error: 'longdo ' + res.getResponseCode() });
  var body = res.getContentText();
  try { JSON.parse(body); } catch (err) { return json_({ error: 'longdo sent non-JSON' }); }
  try { cache.put(cacheKey, body, CACHE_SECONDS); } catch (err) { /* too big to cache: still answer */ }
  return text_(body);
}

// Counts calls that reach Longdo per day (Bangkok time) and refuses once DAILY_LIMIT is reached.
// Kept in script properties, not the cache, because cache entries expire after 6 hours.
function takeQuota_(props) {
  var limit = Number(props.getProperty('DAILY_LIMIT')) || DEFAULT_DAILY_LIMIT;
  var day = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return false;
  try {
    var q = {};
    try { q = JSON.parse(props.getProperty('QUOTA') || '{}'); } catch (err) { q = {}; }
    var used = q.day === day ? Number(q.used) || 0 : 0;
    if (used >= limit) return false;
    props.setProperty('QUOTA', JSON.stringify({ day: day, used: used + 1 }));
    return true;
  } finally {
    lock.releaseLock();
  }
}

function json_(obj) { return text_(JSON.stringify(obj)); }
function text_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON); }

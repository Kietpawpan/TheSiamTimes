/**
 * แจ้งเตือนทาง LINE เมื่อพบจุดความร้อนในรัศมี 500 เมตรรอบสถานที่กำจัดขยะ (ใช้คู่กับ fireRadar.html)
 *
 * สคริปต์ทำงานเองทุก 30 นาทีบนเซิร์ฟเวอร์ Google ไม่ต้องมีใครเปิดหน้าเว็บ:
 *   1. ดึงจุดความร้อนจากระบบส่วนกลางชุดเดียวกับ fireRadar.html (NASA FIRMS, VIIRS: NOAA-20 และ NOAA-21)
 *   2. ดึงรายชื่อสถานที่กำจัดขยะ สคพ. 1–16 (ไฟล์ JSON บนเว็บ + Google Sheet ชุดเดียวกับหน้าเว็บ)
 *   3. หาจุดความร้อนที่ห่างจากสถานที่กำจัดขยะไม่เกิน 500 ม. (เกณฑ์เดียวกับหน้าเว็บ)
 *   4. ส่งข้อความผ่าน LINE Messaging API (LINE Notify ปิดบริการแล้วตั้งแต่ 31 มี.ค. 2568)
 *      รวมทุกแห่งที่พบในรอบเดียวเป็นการส่งครั้งเดียว และไม่แจ้งจุดความร้อนเดิมซ้ำ
 *
 * คู่มือฉบับเต็มพร้อมวิธีแก้ปัญหาที่พบบ่อย: KM/line-landfill-fire-alert.md
 *
 * ==================== วิธีติดตั้ง ====================
 * ก. บัญชี LINE Official Account
 *   1. สร้างบัญชีที่ https://manager.line.biz (แผนฟรีส่งได้ 300 ข้อความ/เดือน ดู "โควตา" ด้านล่าง)
 *   2. LINE Official Account Manager > Settings > Messaging API > Enable Messaging API (สร้าง Provider ตามที่ระบบถาม)
 *   3. https://developers.line.biz/console > เลือก channel ของบัญชีนี้ > แท็บ Messaging API
 *      > Channel access token (long-lived) > Issue แล้วคัดลอกเก็บไว้
 *   4. ถ้าจะส่งเข้ากลุ่ม LINE: LINE OA Manager > Settings > Account settings
 *      > เปิด "Allow account to join groups and multi-person chats"
 *
 * ข. ติดตั้งสคริปต์
 *   5. https://script.google.com > New project > วางโค้ดไฟล์นี้ทั้งไฟล์ > Save
 *   6. Project Settings (รูปเฟือง) > Script properties > Add:
 *        LINE_CHANNEL_ACCESS_TOKEN  token จากข้อ 3
 *      ไม่ใส่ก็ได้:
 *        LINE_TO              รหัสผู้รับ คั่นด้วยจุลภาค: กลุ่ม (ขึ้นต้น C) หรือบุคคล (ขึ้นต้น U) หาได้จากส่วน ค.
 *                             ไม่ใส่ = ส่งถึงทุกคนที่เพิ่มบัญชีนี้เป็นเพื่อน (broadcast)
 *        ALERT_EPOS           สคพ. ที่ต้องการแจ้ง เช่น 11 หรือ 11,12 (ไม่ใส่ = ทั้ง 16 สคพ.)
 *        ALERT_SATELLITES     N20 หรือ N21 หรือ N20,N21 (ไม่ใส่ = ทุกดวง)
 *        ALERT_MAX_AGE_HOURS  แจ้งเฉพาะจุดที่ดาวเทียมตรวจพบภายในกี่ชั่วโมง (ค่าเริ่มต้น 24)
 *   7. เลือกฟังก์ชัน checkSetup > Run > อนุญาตสิทธิ์ > ดู Execution log (ไม่ส่งข้อความ ไม่ใช้โควตา)
 *   8. Run previewAlert: แสดงข้อความที่จะส่งจากข้อมูลขณะนี้ใน log (ไม่ส่ง LINE และไม่บันทึกว่าแจ้งแล้ว)
 *   9. Run sendTestMessage: ส่งข้อความทดสอบ 1 ครั้ง (ใช้โควตา 1 ข้อความต่อผู้รับ 1 คน)
 *  10. Run installTriggers ครั้งเดียว ให้ตรวจเองทุก 30 นาที (เลิกใช้: Run removeTriggers)
 *      รอบแรกจะแจ้งจุดที่พบใน 24 ชม. ที่ผ่านมาทั้งหมด จากนั้นแจ้งเฉพาะจุดใหม่
 *
 * ค. หารหัสกลุ่ม (เฉพาะกรณีส่งเข้ากลุ่มหรือส่งถึงบางคน)
 *  11. Deploy > New deployment > Web app · Execute as: Me · Who has access: Anyone > คัดลอก URL ที่ลงท้าย /exec
 *  12. LINE Developers console > แท็บ Messaging API > Webhook URL ใส่ URL จากข้อ 11 > เปิด Use webhook
 *      (ปุ่ม Verify อาจขึ้น error เพราะ Apps Script ตอบกลับแบบ redirect ไม่เป็นไร ข้อความยังมาถึงสคริปต์)
 *      แนะนำปิด Auto-response ใน LINE OA Manager > Settings > Response settings ไม่ให้บอทตอบอัตโนมัติในกลุ่ม
 *  13. เชิญบัญชี LINE OA เข้ากลุ่ม บอทจะตอบรหัสกลุ่มในแชท (หรือพิมพ์ "รหัสกลุ่ม" ในกลุ่มภายหลัง
 *      ส่วนแชทส่วนตัวกับบอท พิมพ์ "รหัส" จะได้รหัสบุคคล) นำรหัสไปใส่ LINE_TO การตอบนี้ไม่ใช้โควตา
 *
 * โควตา: LINE นับ 1 ข้อความต่อผู้รับ 1 คน เช่น ส่งเข้ากลุ่มที่มีสมาชิก 10 คน = 10 ข้อความ
 *   สคริปต์รวมทุกแห่งที่พบในรอบเดียวเป็นการส่งครั้งเดียว (ยาวได้ถึง 5 กล่องข้อความโดยนับโควตาเท่าเดิม)
 *   แผนฟรี 300 ข้อความ/เดือน พอสำหรับราว 30 รอบแจ้งเตือนต่อเดือนถ้าส่งเข้ากลุ่ม 10 คน
 *   ฤดูเผา (ม.ค.–เม.ย.) อาจไม่พอ ดูยอดคงเหลือได้จาก checkSetup ถ้าโควตาหมด LINE จะปฏิเสธ
 *   สคริปต์จะไม่ถือว่าแจ้งแล้ว และลองใหม่รอบถัดไป (จุดที่เก่ากว่า ALERT_MAX_AGE_HOURS จะไม่แจ้ง)
 *
 * แก้โค้ดภายหลัง: วางโค้ดใหม่ > Save ทริกเกอร์ใช้โค้ดใหม่ทันที
 *   ถ้าใช้ webhook (ส่วน ค.) ต้อง Deploy > Manage deployments > แก้ (รูปดินสอ) > Version: New version ด้วย (URL คงเดิม)
 */

// ============================================================
// 0. ค่าตั้งต้น
// ============================================================
// แหล่งข้อมูลชุดเดียวกับ fireRadar.html (gasWebappUrl, landfillStaticFile, landfillGasUrl)
var HOTSPOT_FEED_URL = 'https://script.google.com/macros/s/AKfycbyJfWRJFtBwsIZecPHZYJda69wXoWdmp1fINaU8-qagZdI7sc8TvB5FzKpGqosbxaUf/exec?action=hotspots';
var LANDFILL_JSON_URLS = [
  'https://thesiamtimes.com/landfill_sites_epo1-16.json',
  'https://raw.githubusercontent.com/Kietpawpan/hotspot/refs/heads/main/landfill_sites_epo1-16.json'
];
var LANDFILL_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwWI0NvtyToeNBq5Y0Yu6VCKiJh27JDSDBZTJ0IbQ1mGsErkJfFdzYdkiVAw72GGWKZ/exec';
var FIRE_RADAR_URL = 'https://thesiamtimes.com/fireRadar.html';

var RISK_RADIUS_M = 500;          // เท่ากับ RISK_RADIUS_KM ใน fireRadar.html
var EARTH_RADIUS_M = 6371008.8;   // ค่าเดียวกับ turf.distance ที่หน้าเว็บใช้
var GRID_DEG = 0.01;              // ช่องละ ~1.1 กม. (> 500 ม.) ตรวจเฉพาะช่องรอบ ๆ แทนการเทียบทุกคู่
var DEFAULT_MAX_AGE_HOURS = 24;
var SENT_EXTRA_KEEP_HOURS = 24;   // จำจุดที่แจ้งแล้วนานกว่าช่วงที่ตรวจอีก 1 วัน กันแจ้งซ้ำ
var SENT_PREFIX = 'SENT_HOTSPOTS_';
var SENT_CHUNK_CHARS = 8000;      // Script property เก็บได้ค่าละ 9 KB จึงแบ่งเป็นหลายค่า

var LINE_API = 'https://api.line.me/v2/bot';
var LINE_TEXT_LIMIT = 4800;       // LINE รับกล่องข้อความละไม่เกิน 5,000 ตัวอักษร
var LINE_MAX_MESSAGES = 5;        // ส่งได้ครั้งละ 5 กล่อง นับโควตาเท่ากับส่ง 1 กล่อง

// ค่า satellite จาก NASA FIRMS (ตารางเดียวกับ fireRadar.html)
var SATELLITE_NAMES = { N20: 'NOAA-20', J1: 'NOAA-20', N21: 'NOAA-21', J2: 'NOAA-21', N: 'Suomi NPP', NPP: 'Suomi NPP', SNPP: 'Suomi NPP' };
var TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function props_() {
  return PropertiesService.getScriptProperties();
}

function settings_() {
  var p = props_();
  var list = function (key) {
    return String(p.getProperty(key) || '').split(/[\s,]+/).filter(Boolean);
  };
  var maxAge = Number(p.getProperty('ALERT_MAX_AGE_HOURS'));
  return {
    token: String(p.getProperty('LINE_CHANNEL_ACCESS_TOKEN') || '').trim(),
    to: list('LINE_TO'),
    epos: list('ALERT_EPOS').map(epoOf_).filter(Boolean),        // ว่าง (หรือ all) = ทุก สคพ.
    sats: list('ALERT_SATELLITES').map(satelliteName_).filter(Boolean), // ว่าง = ทุกดวง
    maxAgeHours: maxAge > 0 ? maxAge : DEFAULT_MAX_AGE_HOURS
  };
}

// ============================================================
// 1. ตรวจและแจ้งเตือน (ทริกเกอร์เรียกทุก 30 นาที)
// ============================================================
function checkLandfillFireRisk() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) {
    console.log('รอบก่อนหน้ายังทำงานอยู่ ข้ามรอบนี้');
    return;
  }
  try {
    var cfg = settings_();
    if (!cfg.token) throw new Error('ยังไม่ได้ใส่ LINE_CHANNEL_ACCESS_TOKEN ใน Script properties');

    var sent = loadSent_();
    var found = findNewRisks_(cfg, sent);
    console.log(runSummary_(found));
    if (!found.sites.length) {
      saveSent_(sent, cfg.maxAgeHours); // ล้างรายการเก่าที่หมดอายุ
      return;
    }

    var result = sendLine_(cfg, buildMessages_(found));
    if (!result.ok) throw new Error('ส่ง LINE ไม่สำเร็จ: ' + result.errors.join(' | '));
    if (result.errors.length) console.error('ส่งไม่ถึงผู้รับบางราย: ' + result.errors.join(' | '));

    var nowH = hoursNow_();
    found.newKeys.forEach(function (k) { sent[k] = nowH; });
    saveSent_(sent, cfg.maxAgeHours);
    console.log('ส่งแจ้งเตือนแล้ว ' + found.sites.length + ' แห่ง ถึงผู้รับ ' + result.okCount + ' ราย');
  } finally {
    lock.releaseLock();
  }
}

// หาจุดความร้อนที่ยังไม่เคยแจ้ง ซึ่งอยู่ในรัศมี 500 ม. จากสถานที่กำจัดขยะ แล้วจัดกลุ่มตามสถานที่
function findNewRisks_(cfg, sent) {
  var feed = loadHotspots_();
  var sites = loadLandfills_().filter(function (s) {
    return !cfg.epos.length || cfg.epos.indexOf(s.epo) >= 0;
  });

  var grid = {};
  sites.forEach(function (s) {
    var k = cellKey_(Math.floor(s.lat / GRID_DEG), Math.floor(s.lon / GRID_DEG));
    (grid[k] = grid[k] || []).push(s);
  });

  var cutoff = Date.now() - cfg.maxAgeHours * 3600 * 1000;
  var bySite = {};
  var seen = {};
  var newKeys = [];
  var alreadySent = 0;

  feed.points.forEach(function (pt) {
    var lat = parseFloat(pt.lat);
    var lon = parseFloat(pt.lon);
    if (!isFinite(lat) || !isFinite(lon)) return;
    var sat = satelliteName_(pt.satellite);
    if (cfg.sats.length && cfg.sats.indexOf(sat) < 0) return;
    var t = acqTime_(pt.date, pt.time);
    if (!t || t < cutoff) return;

    var near = nearbySites_(grid, lat, lon);
    if (!near.length) return;

    var key = hotspotKey_(pt, lat, lon);
    if (seen[key]) return;
    seen[key] = true;
    if (sent[key]) { alreadySent++; return; }
    newKeys.push(key);

    near.forEach(function (n) {
      var e = bySite[n.site.key] || (bySite[n.site.key] = { site: n.site, hotspots: [] });
      e.hotspots.push({ lat: lat, lon: lon, dist: n.dist, time: t, sat: sat });
    });
  });

  var list = Object.keys(bySite).map(function (k) {
    var e = bySite[k];
    e.nearest = Math.min.apply(null, e.hotspots.map(function (h) { return h.dist; }));
    e.latest = e.hotspots.reduce(function (a, h) { return h.time > a.time ? h : a; });
    return e;
  });
  list.sort(function (a, b) {
    return (Number(a.site.epo) || 99) - (Number(b.site.epo) || 99) ||
      a.site.province.localeCompare(b.site.province, 'th') ||
      a.nearest - b.nearest;
  });

  return {
    sites: list,
    newKeys: newKeys,
    alreadySent: alreadySent,
    hotspotCount: feed.points.length,
    feedUpdated: feed.updated,
    siteCount: sites.length
  };
}

function nearbySites_(grid, lat, lon) {
  var ci = Math.floor(lat / GRID_DEG);
  var cj = Math.floor(lon / GRID_DEG);
  var out = [];
  for (var di = -1; di <= 1; di++) {
    for (var dj = -1; dj <= 1; dj++) {
      (grid[cellKey_(ci + di, cj + dj)] || []).forEach(function (s) {
        var d = distanceM_(lat, lon, s.lat, s.lon);
        if (d <= RISK_RADIUS_M) out.push({ site: s, dist: d });
      });
    }
  }
  return out;
}

function cellKey_(i, j) {
  return i + ':' + j;
}

function distanceM_(lat1, lon1, lat2, lon2) {
  var rad = Math.PI / 180;
  var dLat = (lat2 - lat1) * rad;
  var dLon = (lon2 - lon1) * rad;
  var a = Math.pow(Math.sin(dLat / 2), 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.pow(Math.sin(dLon / 2), 2);
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function hotspotKey_(pt, lat, lon) {
  return [satelliteName_(pt.satellite) || '-', pt.date, String(pt.time).padStart(4, '0'), lat.toFixed(4), lon.toFixed(4)].join('|');
}

// วันที่ YYYY-MM-DD และเวลา HHMM ของ FIRMS เป็นเวลา UTC
function acqTime_(date, time) {
  var d = String(date || '').split('-').map(Number);
  var hm = String(time || '').padStart(4, '0');
  if (d.length !== 3 || d.some(isNaN)) return null;
  var t = Date.UTC(d[0], d[1] - 1, d[2], Number(hm.slice(0, 2)), Number(hm.slice(2, 4)));
  return isNaN(t) ? null : t;
}

function satelliteName_(code) {
  var k = String(code || '').trim().toUpperCase();
  return k ? (SATELLITE_NAMES[k] || k) : null;
}

function epoOf_(v) {
  var m = String(v || '').match(/\d+/);
  return m ? String(Number(m[0])) : null;
}

function runSummary_(found) {
  return 'จุดความร้อนในระบบ ' + found.hotspotCount + ' จุด (ซิงก์ ' + (found.feedUpdated || '-') + ')' +
    ' · สถานที่กำจัดขยะที่เฝ้าระวัง ' + found.siteCount + ' แห่ง' +
    ' · พบใหม่ใกล้ ' + found.sites.length + ' แห่ง (' + found.newKeys.length + ' จุด)' +
    ' · แจ้งไปแล้วก่อนหน้า ' + found.alreadySent + ' จุด';
}

// ============================================================
// 2. โหลดข้อมูล
// ============================================================
function fetchJson_(url) {
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: { 'Cache-Control': 'no-cache' } });
  if (res.getResponseCode() !== 200) throw new Error('HTTP ' + res.getResponseCode() + ' จาก ' + url.split('?')[0]);
  return JSON.parse(res.getContentText());
}

function loadHotspots_() {
  var data = fetchJson_(HOTSPOT_FEED_URL);
  if (data && data.error) throw new Error('ระบบจุดความร้อนส่วนกลางแจ้งข้อผิดพลาด: ' + data.error);
  return { points: Array.isArray(data.points) ? data.points : [], updated: data.updated || null };
}

// ไฟล์ JSON มี 2 รูปแบบ: อาร์เรย์ของแถว หรือ { columns, rows }
function tableRows_(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.columns) && Array.isArray(data.rows)) {
    return data.rows.map(function (r) {
      var o = {};
      data.columns.forEach(function (c, i) { o[c] = r[i]; });
      return o;
    });
  }
  return [];
}

// รวมไฟล์ JSON (ทั้ง 16 สคพ.) กับ Google Sheet ทีละสถานที่: แถวใน Sheet แทนแถวในไฟล์ที่เป็นสถานที่เดียวกัน
// (จังหวัด + site ID หรือชื่อสถานที่ถ้าไม่มี ID) สถานที่ที่มีเฉพาะในไฟล์ยังเฝ้าระวังต่อ
function loadLandfills_() {
  var staticRows = [];
  for (var i = 0; i < LANDFILL_JSON_URLS.length && !staticRows.length; i++) {
    try {
      staticRows = tableRows_(fetchJson_(LANDFILL_JSON_URLS[i]));
    } catch (err) {
      console.warn('โหลดไฟล์สถานที่กำจัดขยะไม่สำเร็จ ' + LANDFILL_JSON_URLS[i] + ': ' + err);
    }
  }
  var sheetRows = [];
  try {
    sheetRows = tableRows_(fetchJson_(LANDFILL_SHEET_URL));
  } catch (err) {
    console.warn('โหลดสถานที่กำจัดขยะจาก Google Sheet ไม่สำเร็จ: ' + err);
  }
  if (!staticRows.length && !sheetRows.length) throw new Error('โหลดรายชื่อสถานที่กำจัดขยะไม่สำเร็จทั้งไฟล์และ Sheet');

  // จังหวัด → สคพ. จากไฟล์ทั้งประเทศ (ใช้แทนคอลัมน์ สคพ. ของแต่ละแถว ให้ตรงกับที่หน้าเว็บจัดจังหวัด)
  var provinceEpo = {};
  staticRows.forEach(function (r) {
    var p = text_(r['จังหวัด']);
    var e = epoOf_(r['สคพ.']);
    if (p && e && !provinceEpo[p]) provinceEpo[p] = e;
  });

  var byKey = {};
  var order = [];
  staticRows.concat(sheetRows).forEach(function (r) {
    var s = toSite_(r, provinceEpo);
    if (!s) return;
    if (!byKey[s.key]) order.push(s.key);
    byKey[s.key] = s;
  });
  return order.map(function (k) { return byKey[k]; });
}

function toSite_(r, provinceEpo) {
  var lat = parseFloat(r['ละติจูด']);
  var lon = parseFloat(r['ลองจิจูด']);
  if (!isFinite(lat) || !isFinite(lon)) return null;
  var province = text_(r['จังหวัด']);
  var name = text_(r['ชื่อสถานที่']) || 'ไม่ระบุชื่อ';
  var id = text_(r['site ID']);
  return {
    key: province + '|' + (id ? 'id:' + id : 'name:' + name),
    name: name,
    operator: text_(r['ชื่อผู้ดำเนินการ']),
    province: province,
    epo: provinceEpo[province] || epoOf_(r['สคพ.']) || '',
    status: text_(r['สถานะการดำเนินงานในปัจจุบัน']),
    lat: lat,
    lon: lon
  };
}

function text_(v) {
  return String(v === null || v === undefined ? '' : v).replace(/\s+/g, ' ').trim();
}

// ============================================================
// 3. ข้อความ LINE
// ============================================================
function buildMessages_(found) {
  var hotspotTotal = found.newKeys.length;
  var header = '🔥 พบจุดความร้อนใกล้สถานที่กำจัดขยะ\n' +
    'ในรัศมี 500 ม. · ' + found.sites.length + ' แห่ง · จุดความร้อนใหม่ ' + hotspotTotal + ' จุด';

  var epos = {};
  found.sites.forEach(function (e) { epos[e.site.epo || '?'] = true; });
  var epoList = Object.keys(epos);
  var mapUrl = FIRE_RADAR_URL + '?epo=' + (epoList.length === 1 && epoList[0] !== '?' ? epoList[0] : 'all') + '&sat=all';
  var footer = 'ℹ️ จุดความร้อนจากดาวเทียม NASA FIRMS (VIIRS) ตำแหน่งคลาดเคลื่อนได้ราว 375 ม. ควรตรวจสอบในพื้นที่\n' +
    '🗺️ ' + mapUrl;

  var blocks = found.sites.map(function (e, i) { return siteBlock_(e, i + 1); });

  // แบ่งเป็นกล่องข้อความ กล่องละไม่เกิน LINE_TEXT_LIMIT ตัวอักษร ไม่เกิน LINE_MAX_MESSAGES กล่อง
  var messages = [];
  var cur = header;
  var shown = 0;
  for (var i = 0; i < blocks.length; i++) {
    var rest = blocks.length - i;
    var isLastBox = messages.length === LINE_MAX_MESSAGES - 1;
    // กล่องสุดท้ายเผื่อที่ให้ท้ายข้อความ และบรรทัด "และอีก N แห่ง" ถ้ายังมีเหลือ
    var reserve = isLastBox ? footer.length + 80 : 0;
    if ((cur + '\n\n' + blocks[i]).length + reserve <= LINE_TEXT_LIMIT) {
      cur += '\n\n' + blocks[i];
      shown++;
      continue;
    }
    if (isLastBox) {
      cur += '\n\n…และอีก ' + rest + ' แห่ง ดูทั้งหมดบนแผนที่';
      break;
    }
    messages.push(cur);
    cur = blocks[i];
    shown++;
  }
  if ((cur + '\n\n' + footer).length <= LINE_TEXT_LIMIT) {
    cur += '\n\n' + footer;
    messages.push(cur);
  } else {
    messages.push(cur);
    if (messages.length < LINE_MAX_MESSAGES) messages.push(footer);
  }
  return messages;
}

function siteBlock_(e, n) {
  var s = e.site;
  var lines = ['📍 ' + n + ') ' + s.name];
  var where = [];
  if (s.operator && s.name.indexOf(s.operator) < 0) where.push(s.operator);
  if (s.province) where.push('จ.' + s.province + (s.epo ? ' (สคพ.' + s.epo + ')' : ''));
  if (where.length) lines.push(where.join(' · '));
  var sats = {};
  e.hotspots.forEach(function (h) { if (h.sat) sats[h.sat] = true; });
  lines.push('🔥 ' + e.hotspots.length + ' จุด · ใกล้สุด ' + Math.round(e.nearest) + ' ม. · ล่าสุด ' +
    thaiTime_(e.latest.time) + (Object.keys(sats).length ? ' (' + Object.keys(sats).join(', ') + ')' : ''));
  if (s.status && s.status !== 'เปิดดำเนินงาน') lines.push('สถานะ: ' + s.status);
  lines.push('https://www.google.com/maps?q=' + s.lat + ',' + s.lon);
  return lines.join('\n');
}

function thaiTime_(ms) {
  var d = new Date(ms + 7 * 3600 * 1000);
  var pad = function (x) { return String(x).padStart(2, '0'); };
  return d.getUTCDate() + ' ' + TH_MONTHS[d.getUTCMonth()] + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ' น.';
}

// ============================================================
// 4. LINE Messaging API
// ============================================================
// ส่งถึงทุกรหัสใน LINE_TO (push) หรือถึงเพื่อนทุกคนของบัญชี (broadcast) ถ้าไม่ได้ระบุ
function sendLine_(cfg, texts) {
  var messages = texts.map(function (t) { return { type: 'text', text: t }; });
  var targets = cfg.to.length ? cfg.to : [null];
  var okCount = 0;
  var errors = [];
  targets.forEach(function (to) {
    var res = to
      ? lineFetch_(cfg.token, '/message/push', { to: to, messages: messages })
      : lineFetch_(cfg.token, '/message/broadcast', { messages: messages });
    if (res.code === 200) okCount++;
    else errors.push((to || 'broadcast') + ': ' + lineError_(res));
  });
  return { ok: okCount > 0, okCount: okCount, errors: errors };
}

function lineFetch_(token, path, body) {
  var opt = { method: body ? 'post' : 'get', headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true };
  if (body) {
    opt.contentType = 'application/json';
    opt.payload = JSON.stringify(body);
  }
  var res = UrlFetchApp.fetch(LINE_API + path, opt);
  var text = res.getContentText();
  var json = null;
  try { json = JSON.parse(text); } catch (err) { /* บางคำตอบไม่ใช่ JSON */ }
  return { code: res.getResponseCode(), json: json, text: text };
}

function lineError_(res) {
  var msg = res.json && res.json.message ? res.json.message : String(res.text || '').slice(0, 200);
  var hint = res.code === 401 ? ' (token ไม่ถูกต้องหรือหมดอายุ)'
    : res.code === 429 ? ' (โควตาข้อความเดือนนี้หมด หรือส่งถี่เกินไป)'
    : res.code === 400 ? ' (รหัสผู้รับไม่ถูกต้อง หรือบอทไม่ได้อยู่ในกลุ่ม/ไม่ได้เป็นเพื่อน)'
    : '';
  return 'HTTP ' + res.code + ' ' + msg + hint;
}

function reply_(token, replyToken, text) {
  var res = lineFetch_(token, '/message/reply', { replyToken: replyToken, messages: [{ type: 'text', text: text }] });
  if (res.code !== 200) console.error('ตอบกลับ LINE ไม่สำเร็จ: ' + lineError_(res));
}

// Webhook จาก LINE (ส่วน ค. ในวิธีติดตั้ง): บอกรหัสกลุ่ม/บุคคลสำหรับใส่ LINE_TO เท่านั้น
// Apps Script อ่าน header X-Line-Signature ไม่ได้ จึงไม่เปลี่ยนการตั้งค่าใด ๆ จากคำขอนี้ แค่ตอบกลับด้วย replyToken
function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var token = settings_().token;
    if (token) (body.events || []).forEach(function (ev) { handleLineEvent_(token, ev); });
  } catch (err) {
    console.error('doPost: ' + err);
  }
  return ContentService.createTextOutput('OK');
}

function handleLineEvent_(token, ev) {
  var src = ev.source || {};
  var id = src.groupId || src.roomId || src.userId;
  if (!ev.replyToken || !id) return;
  var askedId = ev.type === 'message' && ev.message && ev.message.type === 'text' &&
    /^(รหัส|รหัสกลุ่ม|group ?id|id)$/i.test(String(ev.message.text || '').trim());
  if (ev.type !== 'join' && !askedId) return;

  var who = src.groupId ? 'กลุ่มนี้' : src.roomId ? 'ห้องแชทนี้' : 'คุณ';
  var subscribed = settings_().to.indexOf(id) >= 0;
  reply_(token, ev.replyToken,
    'ระบบแจ้งเตือนจุดความร้อนใกล้สถานที่กำจัดขยะ\nรหัสของ' + who + ':\n' + id + '\n\n' +
    (subscribed ? '✅ ' + who + 'รับการแจ้งเตือนอยู่แล้ว' : 'ให้ผู้ดูแลระบบนำรหัสนี้ไปใส่ใน LINE_TO เพื่อเริ่มรับการแจ้งเตือน'));
}

// ============================================================
// 5. บันทึกจุดที่แจ้งแล้ว (กันแจ้งซ้ำ)
// ============================================================
function hoursNow_() {
  return Math.floor(Date.now() / 3600000);
}

function loadSent_() {
  var all = props_().getProperties();
  var map = {};
  Object.keys(all).forEach(function (k) {
    if (k.indexOf(SENT_PREFIX) !== 0) return;
    try { Object.assign(map, JSON.parse(all[k])); } catch (err) { /* ข้ามค่าที่เสีย */ }
  });
  return map;
}

function saveSent_(map, maxAgeHours) {
  var p = props_();
  var oldest = hoursNow_() - maxAgeHours - SENT_EXTRA_KEEP_HOURS;
  var chunks = [];
  var cur = {};
  var size = 2;
  Object.keys(map).forEach(function (k) {
    if (map[k] < oldest) return;
    var add = k.length + 12;
    if (size + add > SENT_CHUNK_CHARS && Object.keys(cur).length) {
      chunks.push(cur);
      cur = {};
      size = 2;
    }
    cur[k] = map[k];
    size += add;
  });
  if (Object.keys(cur).length) chunks.push(cur);

  var updates = {};
  chunks.forEach(function (c, i) { updates[SENT_PREFIX + i] = JSON.stringify(c); });
  var before = p.getProperties();
  if (chunks.length) p.setProperties(updates);
  Object.keys(before).forEach(function (k) {
    if (k.indexOf(SENT_PREFIX) === 0 && !Object.prototype.hasOwnProperty.call(updates, k)) p.deleteProperty(k);
  });
}

// ============================================================
// 6. ฟังก์ชันสำหรับกด Run ในหน้า Apps Script
// ============================================================
// ตรวจการตั้งค่า token ผู้รับ โควตา และแหล่งข้อมูล (ไม่ส่งข้อความ ไม่ใช้โควตา)
function checkSetup() {
  var cfg = settings_();
  var out = [];
  var ok = function (label, msg) { out.push('OK   ' + label + ': ' + msg); };
  var bad = function (label, msg) { out.push('ผิดพลาด ' + label + ': ' + msg); };

  if (!cfg.token) {
    bad('LINE token', 'ยังไม่ได้ใส่ LINE_CHANNEL_ACCESS_TOKEN');
  } else {
    var info = lineFetch_(cfg.token, '/info');
    if (info.code !== 200) {
      bad('LINE token', lineError_(info));
    } else {
      ok('LINE token', 'บัญชี ' + info.json.displayName + ' (' + (info.json.basicId || '-') + ')');
      var quota = lineFetch_(cfg.token, '/message/quota');
      var used = lineFetch_(cfg.token, '/message/quota/consumption');
      if (quota.code === 200 && used.code === 200) {
        ok('โควตาเดือนนี้', quota.json.type === 'limited'
          ? 'ใช้ไป ' + used.json.totalUsage + ' จาก ' + quota.json.value + ' ข้อความ'
          : 'ไม่จำกัด (ใช้ไป ' + used.json.totalUsage + ')');
      } else {
        bad('โควตาเดือนนี้', lineError_(quota.code !== 200 ? quota : used));
      }
      if (!cfg.to.length) ok('ผู้รับ', 'ไม่ได้ใส่ LINE_TO จะส่งถึงทุกคนที่เพิ่มบัญชีนี้เป็นเพื่อน (นับโควตาตามจำนวนเพื่อน)');
      cfg.to.forEach(function (id) { describeRecipient_(cfg.token, id, ok, bad); });
    }
  }

  try {
    var found = findNewRisks_(cfg, loadSent_());
    ok('ข้อมูล', runSummary_(found));
  } catch (err) {
    bad('ข้อมูล', String(err.message || err));
  }
  ok('ขอบเขต', 'สคพ. ' + (cfg.epos.length ? cfg.epos.join(', ') : 'ทั้งหมด') +
    ' · ดาวเทียม ' + (cfg.sats.length ? cfg.sats.join(', ') : 'ทุกดวง') + ' · จุดที่ตรวจพบภายใน ' + cfg.maxAgeHours + ' ชม.');

  var hasTrigger = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'checkLandfillFireRisk'; });
  (hasTrigger ? ok : bad)('ทริกเกอร์', hasTrigger ? 'ตรวจเองทุก 30 นาที' : 'ยังไม่ได้ตั้ง (Run installTriggers)');
  console.log(out.join('\n'));
}

function describeRecipient_(token, id, ok, bad) {
  var kind = id.charAt(0);
  if (kind === 'C' || kind === 'R') {
    var base = kind === 'C' ? '/group/' : '/room/';
    var count = lineFetch_(token, base + id + '/members/count');
    if (count.code !== 200) return bad('ผู้รับ ' + id, lineError_(count));
    var name = '';
    if (kind === 'C') {
      var summary = lineFetch_(token, '/group/' + id + '/summary');
      if (summary.code === 200) name = 'กลุ่ม "' + summary.json.groupName + '" ';
    }
    ok('ผู้รับ ' + id, (name || (kind === 'C' ? 'กลุ่ม ' : 'ห้องแชท ')) + 'สมาชิก ' + count.json.count +
      ' คน (แจ้งเตือน 1 ครั้งใช้โควตา ' + count.json.count + ' ข้อความ)');
  } else if (kind === 'U') {
    var profile = lineFetch_(token, '/profile/' + id);
    if (profile.code !== 200) return bad('ผู้รับ ' + id, lineError_(profile) + ' ผู้รับต้องเพิ่มบัญชีนี้เป็นเพื่อนก่อน');
    ok('ผู้รับ ' + id, profile.json.displayName);
  } else {
    bad('ผู้รับ ' + id, 'รหัสต้องขึ้นต้นด้วย C (กลุ่ม) R (ห้องแชท) หรือ U (บุคคล)');
  }
}

// แสดงข้อความที่จะส่งจากข้อมูลขณะนี้ (ไม่ส่ง LINE และไม่บันทึกว่าแจ้งแล้ว)
function previewAlert() {
  var cfg = settings_();
  var found = findNewRisks_(cfg, loadSent_());
  console.log(runSummary_(found));
  if (!found.sites.length) {
    console.log('ไม่มีจุดความร้อนใหม่ในรัศมี 500 ม. จากสถานที่กำจัดขยะ จึงไม่มีข้อความที่จะส่ง');
    return;
  }
  buildMessages_(found).forEach(function (t, i, all) {
    console.log('----- กล่องข้อความ ' + (i + 1) + '/' + all.length + ' (' + t.length + ' ตัวอักษร) -----\n' + t);
  });
}

// ส่งข้อความทดสอบ 1 ครั้ง (ใช้โควตา 1 ข้อความต่อผู้รับ 1 คน)
function sendTestMessage() {
  var cfg = settings_();
  if (!cfg.token) throw new Error('ยังไม่ได้ใส่ LINE_CHANNEL_ACCESS_TOKEN ใน Script properties');
  var result = sendLine_(cfg, ['✅ ทดสอบระบบแจ้งเตือนจุดความร้อนใกล้สถานที่กำจัดขยะ (รัศมี 500 ม.)\n' +
    'ถ้าเห็นข้อความนี้ แปลว่าการแจ้งเตือนจะส่งมาที่นี่\n🗺️ ' + FIRE_RADAR_URL]);
  console.log(result.ok ? 'ส่งแล้ว ' + result.okCount + ' ราย' : 'ส่งไม่สำเร็จ');
  if (result.errors.length) console.error(result.errors.join('\n'));
}

// ตั้งให้ตรวจเองทุก 30 นาที (Run ครั้งเดียว รันซ้ำได้ ไม่สร้างซ้อน)
function installTriggers() {
  removeTriggers();
  ScriptApp.newTrigger('checkLandfillFireRisk').timeBased().everyMinutes(30).create();
  console.log('ตั้งทริกเกอร์แล้ว: ตรวจทุก 30 นาที');
}

function removeTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'checkLandfillFireRisk') ScriptApp.deleteTrigger(t);
  });
}

// ล้างรายการจุดที่แจ้งแล้ว (รอบถัดไปจะแจ้งจุดใน ALERT_MAX_AGE_HOURS ที่ผ่านมาอีกครั้ง)
function resetSentHistory() {
  var p = props_();
  Object.keys(p.getProperties()).forEach(function (k) {
    if (k.indexOf(SENT_PREFIX) === 0) p.deleteProperty(k);
  });
  console.log('ล้างรายการจุดที่แจ้งแล้ว');
}

/**
 * Backend ศูนย์ควบคุมสถานการณ์ PM2.5 สคพ.11 (PM2570.html) — ฉบับสมบูรณ์ ใช้ Claude API แทน Gemini
 *
 * สคริปต์เดียวทำทุกอย่างที่หน้าเว็บต้องการ:
 *   GET  (ไม่มี action)          ข้อมูลรายวันจากชีต "ข้อมูลรายวัน"
 *   GET  ?action=live_pm25       ค่า PM2.5 รายชั่วโมงล่าสุดจาก Air4Thai
 *   GET  ?action=hotspots        จุดความร้อน 24 ชม. (จำนวน 4 จังหวัด + พิกัดทุกจุดในกรอบ + สถานะการซิงก์)
 *   GET  ?action=force_sync_nasa ดึงจุดความร้อนจาก NASA ทันที (เว้นอย่างน้อย 5 นาทีต่อครั้ง)
 *   GET  ?action=water_stations | waste_sites | pig_farms   GeoJSON สำหรับแผนที่
 *   POST {password, mode, contextData}                       ผู้ช่วย AI (Claude) ตอบ {result, model} หรือ {error}
 * ทริกเกอร์อัตโนมัติ: ซิงก์ NASA 07.15 และ 17.00 น. · บันทึกค่าฝุ่นรอบ 07.00 น. ลงชีต 07.20–08.30 น.
 *
 * สิ่งที่เปลี่ยนจากสคริปต์เดิม:
 *   - จุดความร้อนใช้ดาวเทียม NOAA-20 (VIIRS_NOAA20_NRT) แทน Suomi NPP ซึ่งไฟล์ข้อมูลของ NASA ว่างเปล่า
 *   - ถ้า NASA ตอบผิดปกติ จะไม่ล้างชีต Hotspot_Map (เดิมล้างเหลือ 0 จุดโดยไม่แจ้ง) และบันทึกสถานะไว้ให้หน้าเว็บเห็น
 *   - ผู้ช่วย AI ใช้ Claude แยก 2 แบบตามปุ่ม: ข้อความ LINE ถึง ทสจ. และบันทึกวิเคราะห์ถึง ผอ.
 *   - รหัสไฟล์/ชีตภายนอกย้ายไปไว้ใน Script properties (โค้ดนี้จึงเก็บใน GitHub ได้โดยไม่เปิดเผยรหัส)
 *
 * ==================== วิธีติดตั้ง ====================
 *   1. เปิด Google Sheets ที่มีชีต "ข้อมูลรายวัน" > เมนู ส่วนขยาย (Extensions) > Apps Script
 *      (สร้างจากในชีต สคริปต์จะผูกกับชีตนี้ ถ้าสร้างที่ script.google.com ต้องใส่ SPREADSHEET_ID ด้านล่าง)
 *   2. ลบโค้ดตัวอย่าง วางโค้ดไฟล์นี้ทั้งไฟล์ > Save
 *   3. Project Settings (รูปเฟือง) > Script properties > Add:
 *        NASA_API_KEY            MAP_KEY ของ NASA FIRMS (ค่าเดียวกับสคริปต์เดิม)
 *        ANTHROPIC_API_KEY       API key ของ Claude จาก https://platform.claude.com (ต้องมีเครดิต)
 *        AI_PASSWORD             รหัสผ่านปุ่ม AI (ใช้รหัสเดิมได้)
 *        DIR_NAME                ชื่อ ผอ. ลงท้ายข้อความ LINE (ค่าเดียวกับสคริปต์เดิม)
 *        DIR_POSITION            ตำแหน่ง ผอ. (ค่าเดียวกับสคริปต์เดิม)
 *        GEOJSON_FILE_ID         รหัสไฟล์ GeoJSON ขอบเขตจังหวัดใน Google Drive (fileId ในสคริปต์เดิม)
 *        SOURCES_SPREADSHEET_ID  รหัสชีตแหล่งกำเนิด/สถานีน้ำ/บ่อขยะ (ssId ในสคริปต์เดิม)
 *      ไม่ใส่ก็ได้:
 *        SPREADSHEET_ID          เฉพาะกรณีสคริปต์ไม่ได้สร้างจากในชีต
 *        DAILY_LIMIT             จำนวนครั้งที่เรียก Claude ได้ต่อวัน (ค่าเริ่มต้น 60)
 *        CLAUDE_MODEL            ค่าเริ่มต้น claude-opus-5-5
 *   4. เลือกฟังก์ชัน checkSetup > Run > อนุญาตสิทธิ์ > ดู Execution log ว่าทุกข้อขึ้น OK (ไม่เสียค่า Claude)
 *   5. Run ฟังก์ชัน syncNasaNow ครั้งหนึ่ง ให้ชีต Hotspot_Map มีข้อมูลจาก NOAA-20
 *   6. Run ฟังก์ชัน testClaude (เรียก Claude 1 ครั้ง) ถ้าเห็นข้อความภาษาไทยแปลว่าใช้งานได้
 *   7. Run ฟังก์ชัน installTriggers ครั้งเดียว (ตั้งทริกเกอร์ประจำวัน)
 *   8. Deploy > New deployment > type "Web app" · Execute as: Me · Who has access: Anyone
 *      คัดลอก Web app URL (ลงท้าย /exec) ไปใส่ NEW_BACKEND_URL ใน js/maps11v70.js
 *   9. เมื่อหน้าเว็บใช้ตัวใหม่ได้แล้ว ไปที่โปรเจกต์เดิม > Triggers (รูปนาฬิกา) ลบทริกเกอร์ทั้งหมด
 *      กันสองโปรเจกต์เขียนชีตเดียวกัน (ถ้าโปรเจกต์ใหม่ผูกกับชีตเดิม)
 *   กรณีวางโค้ดนี้ทับโปรเจกต์เดิม: ข้ามข้อ 7 และ 9 (ทริกเกอร์เดิมเรียกฟังก์ชันชื่อเดียวกัน ใช้ต่อได้เลย)
 *      และในข้อ 8 ให้แก้ deployment เดิมเป็น New version แทนการสร้างใหม่ URL จะคงเดิม
 *
 * แก้โค้ดภายหลัง: Deploy > Manage deployments > แก้ (รูปดินสอ) > Version: New version (URL คงเดิม)
 * ค่า Claude โดยประมาณ ครั้งละ 0.03–0.10 ดอลลาร์ ดูโทเคนที่ใช้จริงได้ที่เมนู Executions
 */

// ============================================================
// 0. ค่าตั้งต้น
// ============================================================
var SHEET_NAME = 'ข้อมูลรายวัน';
var HOTSPOT_SHEET = 'Hotspot_Map';          // ชีตเก็บพิกัดจุดความร้อนสำหรับแผนที่และการนับ
var AIR4THAI_URL = 'http://air4thai.pcd.go.th/services/getNewAQI_JSON.php?region=5';

var STATIONS = {
  '47t': 'นครราชสีมา',
  '108t': 'ชัยภูมิ',
  '101t': 'บุรีรัมย์',
  '111t': 'สุรินทร์'
};
var TARGET_PROVINCES = ['นครราชสีมา', 'ชัยภูมิ', 'บุรีรัมย์', 'สุรินทร์'];
// ชื่อที่อาจพบใน properties ของไฟล์ GeoJSON (ไทยหรืออังกฤษ)
var PROVINCE_ALIASES = {
  'นครราชสีมา': ['นครราชสีมา', 'Nakhon Ratchasima'],
  'ชัยภูมิ': ['ชัยภูมิ', 'Chaiyaphum'],
  'บุรีรัมย์': ['บุรีรัมย์', 'Buri Ram', 'Buriram'],
  'สุรินทร์': ['สุรินทร์', 'Surin']
};

// NASA FIRMS: ดาวเทียม NOAA-20 ระบบ VIIRS (ไฟล์ของ Suomi NPP ว่างเปล่าตั้งแต่ปลาย พ.ย. 2569)
var FIRMS_SOURCE = 'VIIRS_NOAA20_NRT';
var HOTSPOT_BBOX = '100.0,13.0,105.0,17.5';   // สคพ.11 จังหวัดข้างเคียง และแนวชายแดนกัมพูชา
var FORCE_SYNC_MIN_GAP_MS = 5 * 60 * 1000;

var NO_CACHE_FETCH = {
  headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' },
  muteHttpExceptions: true
};

function props_() {
  return PropertiesService.getScriptProperties();
}

function getSpreadsheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  var id = props_().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('สคริปต์ไม่ได้ผูกกับชีต และไม่ได้ตั้ง SPREADSHEET_ID');
  return SpreadsheetApp.openById(id);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// 1. PM2.5 แบบ Real-time จาก Air4Thai
// ============================================================
function getLivePM25Data() {
  var livePM25 = {};
  try {
    var response = UrlFetchApp.fetch(AIR4THAI_URL + '&t=' + new Date().getTime(), NO_CACHE_FETCH);
    var jsonData = JSON.parse(response.getContentText());
    jsonData.stations.forEach(function (station) {
      var prov = STATIONS[station.stationID];
      if (prov) livePM25[prov] = station.AQILast.PM25.value;
    });
  } catch (e) {
    console.error('ดึงค่าฝุ่น Air4Thai ไม่สำเร็จ: ' + e);
  }
  TARGET_PROVINCES.forEach(function (prov) {
    if (!livePM25[prov]) livePM25[prov] = 'Error';
  });
  return livePM25;
}

// ============================================================
// 2. GeoJSON ขอบเขตจังหวัดจาก Google Drive
// ============================================================
function getGeoJsonFromDrive() {
  var fileId = props_().getProperty('GEOJSON_FILE_ID');
  if (!fileId) throw new Error('ยังไม่ได้ตั้ง GEOJSON_FILE_ID ใน Script properties');
  return JSON.parse(DriveApp.getFileById(fileId).getBlob().getDataAsString());
}

function provinceBoundaries_(geojson) {
  var boundaries = [];
  geojson.features.forEach(function (feature) {
    var propStr = JSON.stringify(feature.properties || {});
    for (var prov in PROVINCE_ALIASES) {
      var hit = PROVINCE_ALIASES[prov].some(function (alias) { return propStr.indexOf(alias) !== -1; });
      if (hit) {
        boundaries.push({ name: prov, geometry: feature.geometry });
        break;
      }
    }
  });
  return boundaries;
}

// ============================================================
// 3. ดึงจุดความร้อนจาก NASA FIRMS แล้วเก็บลงชีต Hotspot_Map
// ============================================================
// เก็บทุกจุดในกรอบ HOTSPOT_BBOX ช่วง 24 ชม. ล่าสุด จุดใน 4 จังหวัดมีชื่อจังหวัด จุดอื่นเว้นว่าง (หน้าเว็บจัดกลุ่มต่อเอง)
// ถ้าล้มเหลวจะ throw: ชีตเดิมไม่ถูกล้าง, สถานะถูกบันทึก, และ Google ส่งอีเมลแจ้งเจ้าของเมื่อทริกเกอร์ล้มเหลว
function fetchAndCacheNasaHotspots() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('มีการซิงก์จุดความร้อนค้างอยู่');
  var nasaApiKey = props_().getProperty('NASA_API_KEY');
  try {
    if (!nasaApiKey) throw new Error('ไม่พบ NASA_API_KEY ใน Script properties');

    var nasaUrl = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv/' + nasaApiKey + '/' + FIRMS_SOURCE + '/' + HOTSPOT_BBOX + '/2';
    var csvResponse = UrlFetchApp.fetch(nasaUrl, NO_CACHE_FETCH);
    var csvText = csvResponse.getContentText();
    if (csvResponse.getResponseCode() !== 200 || csvText.indexOf('latitude') === -1) {
      throw new Error('NASA FIRMS ตอบกลับผิดปกติ (HTTP ' + csvResponse.getResponseCode() + '): ' + csvText.slice(0, 200));
    }

    var boundaries = provinceBoundaries_(getGeoJsonFromDrive());
    if (boundaries.length < TARGET_PROVINCES.length) {
      throw new Error('พบขอบเขตจังหวัดใน GeoJSON เพียง ' + boundaries.length + ' จาก 4 จังหวัด');
    }

    var lines = csvText.trim().split('\n');
    var headers = lines[0].split(',');
    var latIdx = headers.indexOf('latitude');
    var lonIdx = headers.indexOf('longitude');
    var dateIdx = headers.indexOf('acq_date');
    var timeIdx = headers.indexOf('acq_time');
    var confIdx = headers.indexOf('confidence');
    var satIdx = headers.indexOf('satellite');
    var cutoffTime = new Date().getTime() - 24 * 60 * 60 * 1000;

    var pointsToSave = [['Lat', 'Lon', 'Province', 'Date', 'Time', 'Confidence', 'Satellite']];
    for (var j = 1; j < lines.length; j++) {
      var values = lines[j].split(',');
      if (values.length < headers.length) continue;
      var lat = parseFloat(values[latIdx]);
      var lon = parseFloat(values[lonIdx]);
      var dateParts = values[dateIdx].split('-');
      var timeStr = ('0000' + values[timeIdx]).slice(-4);
      var acq = Date.UTC(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]),
        Number(timeStr.substring(0, 2)), Number(timeStr.substring(2, 4)));
      if (acq < cutoffTime) continue;

      var provName = '';
      for (var b = 0; b < boundaries.length; b++) {
        if (isPointInGeometry([lon, lat], boundaries[b].geometry)) {
          provName = boundaries[b].name;
          break;
        }
      }
      pointsToSave.push([lat, lon, provName, "'" + values[dateIdx], "'" + timeStr,
        confIdx !== -1 ? values[confIdx] : 'n', satIdx !== -1 ? values[satIdx] : '']);
    }

    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(HOTSPOT_SHEET) || ss.insertSheet(HOTSPOT_SHEET);
    sheet.clearContents();
    sheet.getRange(1, 1, pointsToSave.length, 7).setValues(pointsToSave);

    recordSync_({ ok: true, points: pointsToSave.length - 1 });
    return pointsToSave.length - 1;
  } catch (error) {
    // ข้อความ error ของ UrlFetchApp อาจมี URL ที่มี NASA key ติดมา และสถานะนี้เปิดให้ทุกคนอ่านได้ จึงลบ key ออก
    var msg = String(error.message || error);
    if (nasaApiKey) msg = msg.split(nasaApiKey).join('***');
    console.error('ซิงก์จุดความร้อนไม่สำเร็จ: ' + msg);
    recordSync_({ ok: false, error: msg });
    throw new Error(msg);
  } finally {
    lock.releaseLock();
  }
}

// สถานะการซิงก์ล่าสุด ส่งไปกับ ?action=hotspots ให้หน้าเว็บและ AI รู้ว่าข้อมูลสดแค่ไหน
function recordSync_(info) {
  var p = props_();
  var s = {};
  try { s = JSON.parse(p.getProperty('HOTSPOT_SYNC') || '{}'); } catch (e) { s = {}; }
  var now = new Date().toISOString();
  s.source = FIRMS_SOURCE;
  if (info.ok) {
    s.lastSuccessAt = now;
    s.points = info.points;
  } else {
    s.lastErrorAt = now;
    s.lastError = info.error.slice(0, 300);
  }
  p.setProperty('HOTSPOT_SYNC', JSON.stringify(s));
}

// ซิงก์จุดความร้อนสำเร็จแล้วหลัง 07.00 น. ของวันนี้ (เวลาไทย) หรือยัง
function morningSyncDone_() {
  var s = readSyncStatus_();
  if (!s.lastSuccessAt) return false;
  var fmt = 'yyyy-MM-dd HH:mm';
  var last = Utilities.formatDate(new Date(s.lastSuccessAt), 'Asia/Bangkok', fmt);
  return last >= Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd') + ' 07:00';
}

function readSyncStatus_() {
  try { return JSON.parse(props_().getProperty('HOTSPOT_SYNC') || '{}'); } catch (e) { return {}; }
}

// ============================================================
// 4. อ่านจุดความร้อนจากชีต
// ============================================================
function readCachedHotspots_() {
  var counts = { 'นครราชสีมา': 0, 'ชัยภูมิ': 0, 'บุรีรัมย์': 0, 'สุรินทร์': 0 };
  var points = [];
  var sheet = getSpreadsheet_().getSheetByName(HOTSPOT_SHEET);
  if (sheet) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var prov = data[i][2];
      if (prov && counts[prov] !== undefined) counts[prov]++;
      points.push({
        lat: data[i][0],
        lon: data[i][1],
        prov: prov,
        date: String(data[i][3]),
        time: String(data[i][4]).padStart(4, '0'),
        confidence: data[i][5],
        satellite: data[i][6]
      });
    }
  }
  return { counts: counts, points: points, sync: readSyncStatus_() };
}

function getCachedHotspots() {
  return json_(readCachedHotspots_());
}

// ============================================================
// 5. บันทึกค่าฝุ่นรอบ 07.00 น. ลงตารางหลัก (ทริกเกอร์ช่วงเช้า)
// ============================================================
// คอลัมน์: 0 วันที่ | 1 จังหวัด | 2 PM2.5 วันนี้ | 3 จุดความร้อน | 4–7 ย้อนหลัง 1–4 วัน
//          8 วันเกินมาตรฐานปีฐาน | 9 วันเกินมาตรฐานปีเป้าหมาย | 10 จุดความร้อนสะสมปีฐาน | 11 จุดความร้อนสะสมปีเป้าหมาย
function updateDailyPM25() {
  var sheet = getSpreadsheet_().getSheetByName(SHEET_NAME);
  if (!sheet) return;

  var response = UrlFetchApp.fetch(AIR4THAI_URL + '&t=' + new Date().getTime(), NO_CACHE_FETCH);
  var jsonData = JSON.parse(response.getContentText());
  var newPMData = {};
  jsonData.stations.forEach(function (station) {
    var prov = STATIONS[station.stationID];
    if (prov && station.AQILast.time === '07:00') newPMData[prov] = station.AQILast.PM25.value;
  });

  // ใช้ยอดจุดความร้อนจากการซิงก์ 07.15 น. ถ้ารอบเช้ายังไม่สำเร็จ ลองซิงก์อีกครั้ง
  // ถ้ายังไม่ได้ จะไม่ใช้ยอดเก่ามาบวกสะสม (บันทึก "-" ไว้แทน)
  var hotspotFresh = morningSyncDone_();
  if (!hotspotFresh) {
    try { fetchAndCacheNasaHotspots(); hotspotFresh = true; } catch (e) { console.error('ซิงก์ซ้ำไม่สำเร็จ: ' + e.message); }
  }
  var hotspotData = readCachedHotspots_().counts;

  var today = new Date();
  var todayStr = Utilities.formatDate(today, 'GMT+7', 'dd/MM/yyyy');
  var dataRange = sheet.getRange(2, 1, 4, 12);
  var data = dataRange.getValues();

  for (var i = 0; i < data.length; i++) {
    var lastUpdateDate = data[i][0] instanceof Date ? Utilities.formatDate(data[i][0], 'GMT+7', 'dd/MM/yyyy') : data[i][0];
    var province = data[i][1];
    var newPM25Value = newPMData[province];
    var newHotspotValue = !hotspotFresh ? '-' : (hotspotData[province] !== undefined ? parseInt(hotspotData[province], 10) : 0);

    if (lastUpdateDate === todayStr) {
      // วันนี้บันทึกแล้ว: เติมเฉพาะค่าที่ยังเป็น "-" (รอบ 07.00 น. ยังไม่ออกตอนรันครั้งก่อน)
      if (data[i][2] === '-' && newPM25Value !== undefined) {
        data[i][2] = newPM25Value;
        if (parseFloat(newPM25Value) > 37.5) data[i][9] = (parseInt(data[i][9], 10) || 0) + 1;
      }
      data[i][3] = newHotspotValue;
    } else {
      // วันใหม่: เลื่อนค่าย้อนหลัง แล้วบันทึกค่าวันนี้
      data[i][0] = today;
      data[i][7] = data[i][6];
      data[i][6] = data[i][5];
      data[i][5] = data[i][4];
      data[i][4] = data[i][2];
      data[i][2] = newPM25Value !== undefined ? newPM25Value : '-';
      if (newPM25Value !== undefined && parseFloat(newPM25Value) > 37.5) {
        data[i][9] = (parseInt(data[i][9], 10) || 0) + 1;
      }
      data[i][3] = newHotspotValue;
      data[i][11] = (parseInt(data[i][11], 10) || 0) + (parseInt(newHotspotValue, 10) || 0);
    }
  }
  dataRange.setValues(data);
}

// ============================================================
// 6. คำนวณจุดอยู่ในขอบเขต (point in polygon)
// ============================================================
function isPointInGeometry(point, geometry) {
  if (geometry.type === 'Polygon') return isPointInPolygon(point, geometry.coordinates);
  if (geometry.type === 'MultiPolygon') {
    for (var i = 0; i < geometry.coordinates.length; i++) {
      if (isPointInPolygon(point, geometry.coordinates[i])) return true;
    }
  }
  return false;
}

function isPointInPolygon(point, polygon) {
  if (!isPointInRing(point, polygon[0])) return false;
  for (var i = 1; i < polygon.length; i++) {
    if (isPointInRing(point, polygon[i])) return false; // อยู่ในรูโหว่
  }
  return true;
}

function isPointInRing(point, ring) {
  var inside = false;
  var x = point[0], y = point[1];
  for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

// ============================================================
// 7. API Endpoints
// ============================================================
function doOptions(e) {
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : '';
  try {
    if (action === 'hotspots') return getCachedHotspots();
    if (action === 'live_pm25') return json_(getLivePM25Data());
    if (action === 'water_stations') return getWaterStationsJson();
    if (action === 'waste_sites') return getWasteSitesJson();
    if (action === 'pig_farms') return getPigFarmsJson();
    if (action === 'force_sync_nasa') return forceSyncNasa_();

    var sheet = getSpreadsheet_().getSheetByName(SHEET_NAME);
    return json_(sheet.getDataRange().getValues());
  } catch (err) {
    console.error('doGet ' + action + ': ' + err);
    return json_({ error: String(err.message || err) });
  }
}

function forceSyncNasa_() {
  var s = readSyncStatus_();
  if (s.lastSuccessAt && new Date().getTime() - new Date(s.lastSuccessAt).getTime() < FORCE_SYNC_MIN_GAP_MS) {
    return json_({ success: true, message: 'เพิ่งซิงก์ไปเมื่อไม่ถึง 5 นาทีก่อน ใช้ข้อมูลชุดนั้น', sync: s });
  }
  try {
    var n = fetchAndCacheNasaHotspots();
    return json_({ success: true, message: 'อัปเดตข้อมูล NASA สำเร็จ (' + n + ' จุดในกรอบค้นหา)', sync: readSyncStatus_() });
  } catch (err) {
    return json_({ error: String(err.message || err), sync: readSyncStatus_() });
  }
}

function doPost(e) {
  try {
    var req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    return json_(handleAi_(req));
  } catch (err) {
    console.error('doPost: ' + err);
    return json_({ error: 'คำขอไม่ถูกต้อง' });
  }
}

// ============================================================
// 8. ผู้ช่วย AI (Claude API)
// ============================================================
var CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
var CLAUDE_API_VERSION = '2026-10-21';
var DEFAULT_CLAUDE_MODEL = 'claude-opus-5-5';
var DEFAULT_DAILY_LIMIT = 60;
var AI_CACHE_SECONDS = 600;          // กดซ้ำด้วยข้อมูลชุดเดิมภายใน 10 นาที ได้คำตอบเดิม ไม่เสียเงินซ้ำ
var MAX_CONTEXT_CHARS = 30000;

// effort = ความลึกในการคิดของ Claude ยิ่งสูงยิ่งละเอียดแต่ช้าและแพงขึ้น
// UrlFetchApp รอคำตอบได้ประมาณ 60 วินาที ถ้าหมดเวลา สคริปต์จะลองใหม่ด้วย effort "low" ให้อัตโนมัติ
var AI_MODES = {
  // ปุ่ม "ร่างข้อความลงกลุ่ม LINE": ข้อความถึง ทสจ. 4 จังหวัด รูปแบบเดียวกับที่ใช้กับ Gemini เดิม
  line_draft: {
    effort: 'low',
    maxTokens: 6000,
    task: function (p) {
      var name = p.getProperty('DIR_NAME');
      var position = p.getProperty('DIR_POSITION');
      var signature = (name || position)
        ? ' แล้วเว้น 1 บรรทัด ตามด้วยชื่อและตำแหน่งตามนี้ทุกตัวอักษร:\n' + [name, position].filter(Boolean).join('\n')
        : '';
      return [
        'ร่างข้อความส่งเข้ากลุ่ม LINE ถึงผู้ประสานงาน ทสจ. 4 จังหวัด เพื่อแจ้งสถานการณ์สิ่งแวดล้อมประจำวันและเสนอมาตรการที่เหมาะสม',
        'เขียนในนามของ ' + (position || 'ผู้อำนวยการ สคพ.11') + ' แทนตนเองว่า "สคพ.11" ไม่ใช้หางเสียง น้ำเสียงหนักแน่น เด็ดขาด เชิงรุก และให้เกียรติผู้ร่วมงาน ความยาวพอเหมาะกับการอ่านบนมือถือ',
        '',
        '1. ขึ้นต้นว่า "เรียน ท่านผู้ประสานงาน ทสจ. 4 จังหวัด นครราชสีมา ชัยภูมิ บุรีรัมย์ สุรินทร์"',
        '2. ส่วนแรกหัวข้อ "รายงานสถานการณ์ประจำวัน" รายงานทีละจังหวัดตามแม่แบบนี้ แทนที่เฉพาะข้อความในวงเล็บเหลี่ยม ห้ามเปลี่ยนโครงสร้าง สัญลักษณ์ หรือการขึ้นบรรทัด และเว้น 1 บรรทัดระหว่างจังหวัด',
        '* จังหวัด[ชื่อจังหวัด]',
        'ฝุ่น PM₂.₅ ปัจจุบัน [ค่า Real-time ล่าสุด] มคก./ลบ.ม. [อีโมจิ] · รอบ 07.00 น. [ค่ารอบ 07.00 น.] (สถานะ: [ข้อความโควต้า])',
        'สภาพอากาศ: [สภาพอากาศ] | อุณหภูมิ: [อุณหภูมิ] °C | ความเร็วลม: [ความเร็วลม] | โอกาสเกิดฝน: [โอกาสเกิดฝน]',
        'เพดานการระบายอากาศ (BLH): [ค่า BLH]',
        'จุดความร้อน 24 ชม.: [จำนวน] จุด',
        '   - อีโมจิตามค่า Real-time: 0–15.0 😊 · 15.1–25.0 🙂 · 25.1–37.5 😐 · 37.6–75.0 ⚠️ · 75.1 ขึ้นไป 🚨 ถ้าไม่มีค่า Real-time ให้ใช้ค่ารอบ 07.00 น. แทนทั้งตัวเลขและอีโมจิ',
        '   - ข้อความโควต้า: คัดลอกจากข้อมูลตรงตัว ("เหลือโควต้า N วัน" / "⚠️ หมดโควต้าแล้ว" / "🚨 เกินโควต้า N วัน") ห้ามใช้คำว่า "สะสมโควต้า"',
        '   - ค่าที่ไม่มีให้เขียนว่า "ไม่มีข้อมูล"',
        '3. ส่วนที่สองหัวข้อ "📌 ข้อเสนอแนะทางวิชาการ:" (ห้ามใช้คำว่า "ข้อสั่งการ") สรุปเป็นข้อรวม 3–4 ข้อ เน้นประเด็นวิกฤตหรือภาพรวมที่สำคัญ ไม่ต้องแยกครบทุกจังหวัดถ้าสถานการณ์ปกติ',
        '   - ต้องมี 1 ข้อที่เชื่อมจุดความร้อนวันนี้ (ใน 4 จังหวัดและรอบพื้นที่) กับจุดความร้อนสะสม โควต้าวันฝุ่น และเป้าหมายลดการเผาของปีเป้าหมาย',
        '   - ต้องมี 1 ข้อเรื่องแนวโน้ม 24–48 ชั่วโมงจากพยากรณ์ VR และฝน ระบุจังหวัดและวันที่เสี่ยง ถ้าพยากรณ์ดีให้บอกสั้น ๆ',
        '   - จุดความร้อนในพื้นที่หนาแน่น ใช้ประโยค "ขอแจ้งให้ ทสจ. จัดชุดลาดตระเวนระงับเหตุทันที โดยเฉพาะการเผานาข้าวและอ้อย"',
        '   - จุดความร้อนนอกประเทศหรือจังหวัดข้างเคียงหนาแน่นและอยู่ทางทิศเดียวกับที่ลมพัดมา ใช้ประโยค "ขอแจ้งให้ ทสจ. เฝ้าระวังผลกระทบตามแนวชายแดนและทิศทางลมอย่างใกล้ชิด"',
        '   - ทุกครั้งที่ขอให้ดำเนินการ ขึ้นต้นด้วย "ขอแจ้งให้ ทสจ."',
        '4. ลงท้ายว่า "จึงเรียนมาเพื่อโปรดทราบ"' + signature,
        '',
        'รูปแบบตัวอักษร: ห้ามใช้เครื่องหมายจุลภาค ห้ามใส่จุดท้ายประโยค ยกเว้นคำว่า ทสจ. หัวข้อใหม่ใช้เลขตามด้วยจุด เช่น 1. ห้ามใช้ ** ในข้อความนี้'
      ].join('\n');
    }
  },
  // ปุ่ม "วิเคราะห์และขอคำแนะนำเชิงลึก": บันทึกวิเคราะห์เสนอ ผอ.สคพ.11
  free_advice: {
    effort: 'medium',
    maxTokens: 12000,
    task: function () {
      return [
        'เขียนบันทึกวิเคราะห์สถานการณ์เสนอ ผอ.สคพ.11 ยาวประมาณ 300–500 คำ ภาษาราชการกระชับ ไม่ใช้สรรพนามแทนตัวเอง ขึ้นต้นด้วย "เรียน ผอ.สคพ.11" แล้วแบ่งหัวข้อตามนี้',
        '**1. สถานการณ์ปัจจุบัน** ค่าฝุ่น จุดความร้อน (ใน 4 จังหวัดและรอบพื้นที่) และการระบายอากาศของวันนี้ ระบุจังหวัดที่ค่าสูงสุดหรือมีแนวโน้มเพิ่มขึ้น',
        '**2. แนวโน้ม 24–48 ชั่วโมง** อิงข้อมูลพยากรณ์ ระบุจังหวัดและช่วงเวลาที่เสี่ยงฝุ่นสะสมที่สุด พร้อมระดับความมั่นใจ (สูง/ปานกลาง/ต่ำ) และเหตุผลสั้น ๆ',
        '**3. จังหวัดที่ควรจับตา** เฉพาะจังหวัดที่ข้อมูลชี้ เช่น โควต้าวันเกินมาตรฐานเหลือน้อย ค่าฝุ่นเพิ่มขึ้นต่อเนื่อง หรือจุดความร้อนเพิ่มขึ้น ถ้าไม่มีให้บอกว่าไม่มี',
        '**4. ข้อเสนอแนะ** 3–5 ข้อ เรียงตามความสำคัญ แต่ละข้อระบุผู้ดำเนินการและกรอบเวลา และโยงกับเป้าหมายของปีเป้าหมายเมื่อเกี่ยวข้อง',
        '**5. ข้อจำกัดของข้อมูล** 1–2 บรรทัด เฉพาะข้อมูลที่ขาดหรือผิดปกติในรอบนี้'
      ].join('\n');
    }
  }
};

// ข้อเท็จจริงที่ Claude ต้องใช้ทุกครั้ง แก้ที่นี่ที่เดียวเมื่อมาตรฐาน นโยบาย หรือเป้าหมายเปลี่ยน
// (ปีฐาน/ปีเป้าหมายของจำนวนวันเกินมาตรฐาน หน้าเว็บส่งมาในข้อมูล แก้ที่ js/maps11v70.js)
var AI_SYSTEM_PROMPT = [
  'คุณเป็นผู้ช่วยนักวิเคราะห์ของศูนย์ควบคุมสถานการณ์ PM₂.₅ สำนักงานสิ่งแวดล้อมและควบคุมมลพิษที่ 11 (สคพ.11) จังหวัดนครราชสีมา พื้นที่รับผิดชอบ 4 จังหวัด ได้แก่ นครราชสีมา ชัยภูมิ บุรีรัมย์ และสุรินทร์',
  'ผู้อ่านคือผู้อำนวยการ สคพ.11 เจ้าหน้าที่ และผู้ประสานงานสำนักงานทรัพยากรธรรมชาติและสิ่งแวดล้อมจังหวัด (ทสจ.) ซึ่งเชี่ยวชาญงานคุณภาพอากาศอยู่แล้ว ไม่ต้องอธิบายความรู้พื้นฐาน',
  'แต่ละครั้งคุณจะได้รับข้อมูลล่าสุดจากหน้าเว็บของศูนย์ฯ ในแท็ก <data> พร้อมวันและเวลาที่ประมวลผล ให้วิเคราะห์จากข้อมูลชุดนั้นเป็นหลัก',
  '',
  'ข้อเท็จจริงอ้างอิง (ใช้ค่าเหล่านี้แทนสิ่งที่คุณจำมา):',
  '- มาตรฐาน PM₂.₅ ของประเทศไทย: ค่าเฉลี่ย 24 ชั่วโมงไม่เกิน 37.5 มคก./ลบ.ม. และค่าเฉลี่ยรายปีไม่เกิน 15 มคก./ลบ.ม. ใช้บังคับตั้งแต่ 1 มิถุนายน 2566 ค่าเดิม 50 และ 25 มคก./ลบ.ม. ยกเลิกแล้ว ห้ามอ้างเป็นมาตรฐานปัจจุบัน',
  '- ระดับคุณภาพอากาศที่ศูนย์ฯ ใช้: 0–15.0 ดีมาก (ฟ้า) · 15.1–25.0 ดี (เขียว) · 25.1–37.5 ปานกลาง (เหลือง) · 37.6–75.0 เริ่มมีผลกระทบต่อสุขภาพ (ส้ม) · 75.1 ขึ้นไป มีผลกระทบต่อสุขภาพ (แดง)',
  '- ค่า "รอบ 07.00 น." คือค่าที่ศูนย์ฯ ใช้รายงานประจำวันและนับวันเกินมาตรฐาน ค่า "Real-time" เป็นค่ารายชั่วโมงล่าสุด ใช้ดูทิศทางระหว่างวันเท่านั้น อย่าใช้ค่ารายชั่วโมงตัดสินว่าเกินมาตรฐาน 24 ชั่วโมงหรือไม่',
  '- อัตราการระบายอากาศ (VR) = เพดานการระบายอากาศ (BLH, เมตร) × ความเร็วลมที่ระดับ 10 เมตร (เมตร/วินาที) หน่วย ตร.ม./วินาที เกณฑ์ของกรมอุตุนิยมวิทยา: ต่ำกว่า 2,000 แย่ (ฝุ่นสะสมตัว) · 2,000–3,999 ปานกลาง · 4,000–7,999 ดี · 8,000 ขึ้นไป ดีมาก',
  '- BLH ต่ำลงเองทุกคืนถึงเช้าตรู่ ค่า VR ช่วงเช้า (06–09 น.) จึงบอกโอกาสฝุ่นสะสมตอนเช้าได้ดีกว่าค่าสูงสุดตอนบ่าย ค่า BLH หรือ VR ของชั่วโมงปัจจุบันขึ้นกับเวลาที่ดึงข้อมูล ให้ดูเวลาประกอบเสมอ',
  '- เป้าหมายจำนวนวันเกินมาตรฐาน: แต่ละจังหวัดต้องมีวันที่ PM₂.₅ เกินมาตรฐานในปีเป้าหมายน้อยกว่าปีฐานอย่างน้อย 5% (ปีและตัวเลขอยู่ในข้อมูล) "โควต้า" คือจำนวนวันที่ยังเกินได้อีกโดยไม่พลาดเป้า จังหวัดที่ปีฐานมีวันเกินน้อย โควต้าก็น้อยตามสัดส่วน',
  '- จุดความร้อนมาจาก NASA FIRMS (ดาวเทียมระบบ VIIRS) ระบบซิงก์วันละ 2 รอบ ข้อมูลมีจำนวนใน 4 จังหวัด และสรุปจุดรอบพื้นที่ (จังหวัดข้างเคียง นอกประเทศ และทิศที่ตั้งเทียบกับใจกลางพื้นที่) ใช้คู่กับทิศที่ลมพัดมาเพื่อประเมินโอกาสที่ควันจะเข้าพื้นที่ได้ แต่ห้ามยืนยันว่าควันพัดเข้ามาแล้ว ถ้าข้อมูลบอกว่าทั้งกรอบค้นหาไม่มีจุดความร้อนเลย หรือการซิงก์ล่าสุดล้มเหลว ให้รายงานพร้อมหมายเหตุว่าข้อมูลดาวเทียมอาจไม่ครบ อย่ายืนยันว่าไม่มีการเผา',
  '- ศูนย์ฯ ใช้เครื่องมือเหล่านี้อยู่แล้ว อย่าเสนอให้เริ่มใช้ราวกับยังไม่มี: PM₂.₅ รายชั่วโมงจาก Air4Thai, จุดความร้อน NASA FIRMS และ GISTDA ย้อนหลัง 30 วันพร้อมแผนที่, กราฟพยากรณ์ VR ของกรมอุตุนิยมวิทยา, แบบจำลอง Windy (ECMWF), เรดาร์ตรวจอากาศพิมาย',
  '',
  // นโยบายนี้ยกมาจากพรอมต์ Gemini เดิม แก้ทุกปีตามมาตรการระดับชาติฉบับใหม่
  'นโยบายและเป้าหมายปี 2570 (มาตรการระดับชาติ ภาคตะวันออกเฉียงเหนือ):',
  '- ลดพื้นที่เผาไหม้เกษตร (เน้นนาข้าวและอ้อย) ไม่น้อยกว่า 10% และลดวันที่ฝุ่นเกินมาตรฐาน 5%',
  '- สาเหตุหลักที่ต้องเฝ้าระวัง: การเผาในพื้นที่เกษตร โดยเฉพาะนาข้าวและอ้อยโรงงาน',
  '- มาตรการเร่งด่วน: ควบคุมอ้อยไฟไหม้เข้าโรงงานไม่เกิน 15% และตัดสิทธิ์ความช่วยเหลือจากภาครัฐหากพบการลักลอบเผา',
  '- ให้เชื่อมโยงสถานการณ์รายวันเข้ากับเป้าหมายเหล่านี้',
  '',
  'ปฏิทินฤดูกาลทั่วไปของอีสานตอนล่าง (เป็นบริบทประกอบ ไม่ใช่ข้อมูลตรวจวัด):',
  '- ต.ค.–ธ.ค. เก็บเกี่ยวข้าวนาปี มีการเผาฟางและตอซัง ลมมรสุมตะวันออกเฉียงเหนือเริ่มพัดปกคลุม อากาศเย็นและแห้งลง',
  '- ธ.ค.–เม.ย. ฤดูหีบอ้อย การเผาอ้อยก่อนตัดเป็นแหล่งฝุ่นสำคัญของพื้นที่',
  '- ม.ค.–มี.ค. มักเป็นช่วงที่ฝุ่นสะสมสูงสุด เมื่อความกดอากาศสูงแผ่ลงมา ลมอ่อน และมีชั้นอากาศผกผันช่วงเช้า',
  '- ก.พ.–เม.ย. ไฟป่าและการเผาเตรียมพื้นที่เพาะปลูก รวมถึงการเผาในประเทศเพื่อนบ้าน ซึ่งส่งผลเมื่อลมพัดมาจากทิศนั้น',
  '',
  'การอธิบายปัจจัยสภาพอากาศ (เลือกเฉพาะปัจจัยที่เด่นชัดที่สุดและตรงเงื่อนไขในข้อมูลจริง):',
  '- BLH สูงหรือ VR ดี แต่ค่ารอบ 07.00 น. ยังเกินมาตรฐาน: เป็นความหน่วงของค่าเฉลี่ย 24 ชั่วโมงที่สะสมมาตั้งแต่กลางคืนที่อากาศปิด ถ้าลมผิวพื้นอ่อนให้ระบุว่าลมไม่พอพัดพาฝุ่นออกไป',
  '- ความชื้นสัมพัทธ์เกิน 75% และลมต่ำกว่า 10 กม./ชม.: ฝุ่นดูดความชื้นและพองตัว และต้องระวังฝุ่นละอองทุติยภูมิ (Secondary PM₂.₅) ที่ทำให้ค่าพุ่งสูงเร็ว',
  '- มีโอกาสเกิดฝน: ฝนช่วยชะล้างฝุ่นละอองและบรรเทาสถานการณ์',
  '- หลัง 16.00 น. ค่า Real-time สูงกว่ารอบ 07.00 น.: ฝุ่นสะสมจนระบายไม่ทัน เมื่อกลางคืนเพดานอากาศปิด เช้าพรุ่งนี้อาจแย่ลง ควรให้ ทสจ. เตรียมประชาสัมพันธ์กลุ่มเสี่ยงล่วงหน้า',
  '- ก่อน 09.00 น. อากาศเย็นและ BLH ต่ำ: อุณหภูมิผกผัน (Temperature Inversion) กดฝุ่นควันไว้ใกล้ผิวดินคล้ายฝาชีครอบ ควรงดกิจกรรมกลางแจ้งจนแดดช่วงสายเปิดเพดานการระบายอากาศ',
  '- พยากรณ์ VR ช่วงเช้าของพรุ่งนี้หรือมะรืนอยู่ระดับแย่ หรือ BLH กลางคืนต่ำมาก: เตือนล่วงหน้าโดยระบุจังหวัดและวัน',
  '',
  'หลักการเขียน:',
  '- ตัวเลขทุกตัวต้องมาจากข้อมูลที่ได้รับหรือคำนวณจากข้อมูลนั้นโดยตรง ห้ามคิดขึ้นเอง ค่าใดเป็น N/A หรือ "-" ให้บอกว่าไม่มีข้อมูล',
  '- แยกให้ชัดว่าส่วนใดเป็นค่าตรวจวัด ส่วนใดเป็นค่าพยากรณ์ และส่วนใดเป็นการประเมิน',
  '- ประเมินความเสี่ยง 24–48 ชั่วโมงจากข้อมูลพยากรณ์ที่ให้มา (VR, BLH, ลม, ฝน) ร่วมกับแนวโน้มค่าฝุ่นย้อนหลังและจุดความร้อน อย่าคาดการณ์จากความรู้ทั่วไปอย่างเดียว',
  '- ให้น้ำหนักตามสถานการณ์จริง ถ้าค่าฝุ่นต่ำและพยากรณ์การระบายอากาศดี ให้บอกตรง ๆ ว่าสถานการณ์ปกติ ไม่ต้องหาความเสี่ยงมาเติม ถ้าพบสัญญาณเสี่ยง ให้ชี้ว่าจังหวัดใด ช่วงเวลาใด เพราะอะไร',
  '- ข้อเสนอแนะต้องทำได้จริงในบทบาทของ สคพ.11 และ ทสจ. เช่น ประสานจังหวัด อปท. เกษตรจังหวัด โรงงานน้ำตาล หน่วยป้องกันไฟป่า และเหมาะกับระดับสถานการณ์',
  '- ใช้สำนวนและรูปแบบตามงานที่ระบุในแต่ละครั้ง ไม่กล่าวถึงตัวเองว่าเป็น AI ไม่เกริ่นนำ',
  '- ข้อความล้วนสำหรับวางใน LINE ห้ามใช้ตาราง ห้ามใช้เครื่องหมาย # ทำหัวข้อ เขียน PM₂.₅ ด้วยตัวห้อยเสมอ'
].join('\n');

var THAI_DAYS = ['', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
var THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

function handleAi_(req) {
  var p = props_();
  var password = p.getProperty('AI_PASSWORD');
  var apiKey = p.getProperty('ANTHROPIC_API_KEY');
  if (!password || !apiKey) return { error: 'ยังไม่ได้ตั้งค่า AI_PASSWORD หรือ ANTHROPIC_API_KEY ใน Script properties' };

  if (!safeEqual_(String(req.password || ''), password)) {
    Utilities.sleep(1000); // ชะลอการเดารหัสผ่าน
    return { error: 'Unauthorized' };
  }

  var mode = Object.prototype.hasOwnProperty.call(AI_MODES, req.mode) ? req.mode : 'line_draft';
  var contextData = String(req.contextData || '').trim();
  if (!contextData) return { error: 'ไม่มีข้อมูลส่งมาให้วิเคราะห์' };
  if (contextData.length > MAX_CONTEXT_CHARS) return { error: 'ข้อมูลยาวเกินกำหนด' };

  var cache = CacheService.getScriptCache();
  var cacheKey = 'ai:' + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, mode + '\n' + contextData, Utilities.Charset.UTF_8));
  var hit = cache.get(cacheKey);
  if (hit) return JSON.parse(hit);

  if (!takeAiQuota_(p)) return { error: 'วันนี้เรียกใช้ AI ครบจำนวนที่กำหนดแล้ว (DAILY_LIMIT) โปรดลองใหม่พรุ่งนี้' };

  var model = p.getProperty('CLAUDE_MODEL') || DEFAULT_CLAUDE_MODEL;
  var userText = 'วันและเวลาที่ประมวลผล: ' + thaiNow_() + ' (เวลาประเทศไทย)\n\n' +
    'งานที่ต้องทำ:\n' + AI_MODES[mode].task(p) + '\n\n<data>\n' + contextData + '\n</data>';

  var out = callClaude_(apiKey, model, mode, userText);
  if (out.result) {
    try { cache.put(cacheKey, JSON.stringify(out), AI_CACHE_SECONDS); } catch (err) { /* ใหญ่เกิน cache ก็ยังตอบได้ */ }
  }
  return out;
}

function callClaude_(apiKey, model, mode, userText) {
  var cfg = AI_MODES[mode];
  var effort = cfg.effort;
  // โมเดลรุ่นใหม่มีตัวคัดกรองความปลอดภัยที่อาจปฏิเสธคำขอ (stop_reason "refusal")
  // fallbacks "default" ให้ Anthropic ส่งต่อไปโมเดลสำรองที่เหมาะสมในคำขอเดียวกันโดยอัตโนมัติ
  var useFallback = /^claude-(opus-5|sonnet-5-5|fable-5)/.test(model);

  for (var attempt = 1; attempt <= 2; attempt++) {
    var body = {
      model: model,
      max_tokens: cfg.maxTokens,
      output_config: { effort: effort },
      system: AI_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userText }]
    };
    var headers = { 'x-api-key': apiKey, 'anthropic-version': CLAUDE_API_VERSION };
    if (useFallback) {
      body.fallbacks = 'default';
      headers['anthropic-beta'] = 'server-side-fallback-2026-07-01';
    }

    var res;
    try {
      res = UrlFetchApp.fetch(CLAUDE_API_URL, {
        method: 'post',
        contentType: 'application/json',
        headers: headers,
        payload: JSON.stringify(body),
        muteHttpExceptions: true
      });
    } catch (err) {
      console.warn('Claude fetch failed (attempt ' + attempt + ', effort ' + effort + '): ' + err);
      if (attempt === 1) {
        effort = 'low'; // ส่วนใหญ่คือหมดเวลารอ ลองใหม่ให้คิดสั้นลง
        continue;
      }
      return { error: 'Claude ตอบไม่ทันเวลาที่ Apps Script รอได้ โปรดลองใหม่อีกครั้ง' };
    }

    var code = res.getResponseCode();
    if ((code === 429 || code >= 500) && attempt === 1) {
      Utilities.sleep(3000);
      continue;
    }
    return parseClaude_(code, res.getContentText(), model);
  }
  return { error: 'เชื่อมต่อ Claude ไม่สำเร็จ' };
}

function parseClaude_(code, text, model) {
  var data;
  try { data = JSON.parse(text); } catch (err) { return { error: 'Claude ตอบกลับผิดรูปแบบ (HTTP ' + code + ')' }; }

  if (code !== 200) {
    var msg = (data && data.error && data.error.message) || '';
    console.error('Claude API ' + code + ': ' + msg);
    if (code === 401) return { error: 'ANTHROPIC_API_KEY ไม่ถูกต้อง' };
    if (code === 403) return { error: 'API key นี้ไม่มีสิทธิ์ใช้งาน: ' + msg };
    if (code === 404) return { error: 'ไม่พบโมเดล ' + model + ' (ตรวจค่า CLAUDE_MODEL)' };
    if (code === 429) return { error: 'เรียกใช้ Claude ถี่เกินโควต้าของบัญชี โปรดลองใหม่ภายหลัง' };
    if (code >= 500) return { error: 'เซิร์ฟเวอร์ Claude หนาแน่น โปรดลองใหม่อีกครั้ง' };
    return { error: 'Claude API ไม่รับคำขอ (HTTP ' + code + '): ' + msg };
  }

  console.log('model=' + data.model + ' stop=' + data.stop_reason + ' usage=' + JSON.stringify(data.usage));

  if (data.stop_reason === 'refusal') return { error: 'Claude ปฏิเสธคำขอนี้ โปรดลองใหม่อีกครั้ง' };
  var result = (data.content || [])
    .filter(function (b) { return b.type === 'text'; })
    .map(function (b) { return b.text; })
    .join('')
    .trim();
  if (!result) return { error: 'Claude ไม่ได้ส่งข้อความกลับมา' };
  if (data.stop_reason === 'max_tokens') result += '\n\n(ข้อความถูกตัดเพราะยาวเกินกำหนด)';
  return { result: result, model: data.model };
}

// นับจำนวนครั้งที่เรียก Claude ต่อวัน (เวลาไทย)
function takeAiQuota_(p) {
  var limit = Number(p.getProperty('DAILY_LIMIT')) || DEFAULT_DAILY_LIMIT;
  var day = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return false;
  try {
    var q = {};
    try { q = JSON.parse(p.getProperty('AI_QUOTA') || '{}'); } catch (err) { q = {}; }
    var used = q.day === day ? Number(q.used) || 0 : 0;
    if (used >= limit) return false;
    p.setProperty('AI_QUOTA', JSON.stringify({ day: day, used: used + 1 }));
    return true;
  } finally {
    lock.releaseLock();
  }
}

function thaiNow_() {
  var now = new Date();
  var f = function (pattern) { return Utilities.formatDate(now, 'Asia/Bangkok', pattern); };
  return 'วัน' + THAI_DAYS[Number(f('u'))] + 'ที่ ' + Number(f('d')) + ' ' + THAI_MONTHS[Number(f('M')) - 1] +
    ' ' + (Number(f('yyyy')) + 543) + ' เวลา ' + f('HH.mm') + ' น.';
}

// เทียบรหัสผ่านโดยใช้เวลาเท่ากันทุกกรณี
function safeEqual_(a, b) {
  var diff = a.length ^ b.length;
  var n = Math.max(a.length, b.length);
  for (var i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

// ============================================================
// 9. ทริกเกอร์ประจำวัน
// ============================================================
// installTriggers: รันครั้งเดียวตอนติดตั้ง ตั้งทริกเกอร์ 01.00 น. ทุกวัน ซึ่งจะสร้างทริกเกอร์ของวันนั้นให้เอง
function installTriggers() {
  createMidnightTrigger();
  setupDailyExactTrigger();
}

function setupDailyExactTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    var handler = t.getHandlerFunction();
    if (handler === 'updateDailyPM25' || handler === 'fetchAndCacheNasaHotspots') ScriptApp.deleteTrigger(t);
  });

  var now = new Date();
  function at_(h, m, handler) {
    var when = new Date();
    when.setHours(h, m, 0, 0);
    if (when > now) ScriptApp.newTrigger(handler).timeBased().at(when).create(); // ข้ามเวลาที่ผ่านไปแล้ว
  }

  // ดึงพิกัดจาก NASA มาพักไว้ในชีต
  at_(7, 15, 'fetchAndCacheNasaHotspots');
  at_(17, 0, 'fetchAndCacheNasaHotspots');
  // บันทึกค่าฝุ่นรอบ 07.00 น. (รันซ้ำเผื่อ Air4Thai ออกค่าช้า)
  at_(7, 20, 'updateDailyPM25');
  at_(7, 40, 'updateDailyPM25');
  at_(8, 0, 'updateDailyPM25');
  at_(8, 30, 'updateDailyPM25');
}

function createMidnightTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'setupDailyExactTrigger') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('setupDailyExactTrigger').timeBased().everyDays(1).atHour(1).create();
}

// ============================================================
// 10. GeoJSON สำหรับแผนที่ (บ่อขยะ สถานีน้ำ ฟาร์มสุกร)
// ============================================================
function sourcesSpreadsheet_() {
  var id = props_().getProperty('SOURCES_SPREADSHEET_ID');
  if (!id) throw new Error('ยังไม่ได้ตั้ง SOURCES_SPREADSHEET_ID ใน Script properties');
  return SpreadsheetApp.openById(id);
}

function sheetByGid_(ss, gid) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() == gid) return sheets[i];
  }
  return null;
}

function emptyFeatureCollection_() {
  return json_({ type: 'FeatureCollection', features: [] });
}

// สถานที่กำจัดขยะ (GID 386407987)
function getWasteSitesJson() {
  var sheet = sheetByGid_(sourcesSpreadsheet_(), 386407987);
  if (!sheet) return json_({ error: 'ไม่พบชีตสถานที่กำจัดขยะ (GID: 386407987)' });

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return emptyFeatureCollection_();

  var header = data[0];
  var nameIdx = header.findIndex(function (c) { return /ชื่อสถานที่|สถานที่|บ่อขยะ/i.test(c); });
  var latIdx = header.findIndex(function (c) { return /lat|latitude|ละติจูด/i.test(c); });
  var lonIdx = header.findIndex(function (c) { return /lon|longitude|ลองจิจูด/i.test(c); });
  var addressIdx = header.findIndex(function (c) { return /ที่ตั้ง/i.test(c); });
  var ownerIdx = header.findIndex(function (c) { return /ชื่อผู้ดำเนินการ/i.test(c); });
  if (latIdx === -1 || lonIdx === -1) return json_({ error: 'ไม่พบคอลัมน์พิกัด (ละติจูด/ลองจิจูด)' });

  var features = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var lat = parseFloat(row[latIdx]);
    var lon = parseFloat(row[lonIdx]);
    if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        name: nameIdx !== -1 ? row[nameIdx] : 'สถานที่กำจัดขยะ #' + i,
        address: addressIdx !== -1 ? row[addressIdx] : '-',
        owner: ownerIdx !== -1 ? row[ownerIdx] : '-',
        type: 'waste_site'
      }
    });
  }
  return json_({ type: 'FeatureCollection', features: features });
}

// สถานีตรวจวัดคุณภาพน้ำ (ชีต waterStations หรือ GID 1987920770)
function getWaterStationsJson() {
  var ss = sourcesSpreadsheet_();
  var sheet = ss.getSheetByName('waterStations') || sheetByGid_(ss, 1987920770);
  if (!sheet) return json_({ error: 'ไม่พบชีต waterStations' });

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return emptyFeatureCollection_();

  var header = data[0];
  var col = function (re) { return header.findIndex(function (c) { return re.test(c); }); };
  var latIdx = col(/ละติจูด/i), lonIdx = col(/ลองจิจูด/i), nameIdx = col(/ชื่อสถานี/i), basinIdx = col(/ลุ่มน้ำหลัก/i);
  var sourceIdx = col(/แหล่งน้ำ/i), agencyIdx = col(/ผู้รับผิดชอบ/i), statusIdx = col(/สถานะ/i), provIdx = col(/จังหวัด/i);
  var pick = function (row, idx) { return idx !== -1 ? row[idx] : '-'; };

  var features = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var lat = parseFloat(row[latIdx]);
    var lon = parseFloat(row[lonIdx]);
    if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        name: pick(row, nameIdx), basin: pick(row, basinIdx), source: pick(row, sourceIdx),
        agency: pick(row, agencyIdx), status: pick(row, statusIdx), province: pick(row, provIdx),
        lat: lat, lon: lon
      }
    });
  }
  return json_({ type: 'FeatureCollection', features: features });
}

// ฟาร์มสุกร (ชีต sources2569 เฉพาะแถวที่กลุ่มมีคำว่า "สุกร")
function getPigFarmsJson() {
  var sheet = sourcesSpreadsheet_().getSheetByName('sources2569');
  if (!sheet) return json_({ error: 'ไม่พบชีต sources2569' });

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return emptyFeatureCollection_();

  var header = data[0];
  var col = function (re) { return header.findIndex(function (c) { return re.test(c); }); };
  var nameIdx = col(/ชื่อแหล่งกำเนิดมลพิษ/i), sizeIdx = col(/ขนาด/i), latIdx = col(/ละติจูด/i);
  var lonIdx = col(/ลองจิจูด/i), groupIdx = col(/กลุ่ม/i), provIdx = col(/จังหวัด/i);

  var features = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var group = groupIdx !== -1 ? String(row[groupIdx]) : '';
    if (group.indexOf('สุกร') === -1) continue;
    var lat = parseFloat(row[latIdx]);
    var lon = parseFloat(row[lonIdx]);
    if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) continue;

    var rawSize = sizeIdx !== -1 ? row[sizeIdx] : '-';
    // ล้างจุลภาคออกให้เป็นตัวเลข หน้าเว็บนำไปคำนวณต่อ
    var size = (rawSize !== '-' && rawSize !== '') ? Number(String(rawSize).replace(/,/g, '')) : rawSize;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        name: nameIdx !== -1 ? row[nameIdx] : '-',
        size: size,
        group: group,
        province: provIdx !== -1 ? row[provIdx] : '-'
      }
    });
  }
  return json_({ type: 'FeatureCollection', features: features });
}

// ============================================================
// 11. ตรวจการติดตั้ง (กด Run ในหน้าแก้โค้ด)
// ============================================================
// ตรวจ Script properties ชีต GeoJSON และ Air4Thai โดยไม่เรียก Claude (ไม่เสียค่าใช้จ่าย)
function checkSetup() {
  var p = props_();
  var log = function (ok, msg) { console.log((ok ? 'OK   ' : 'FAIL ') + msg); };
  ['NASA_API_KEY', 'ANTHROPIC_API_KEY', 'AI_PASSWORD', 'DIR_NAME', 'DIR_POSITION', 'GEOJSON_FILE_ID', 'SOURCES_SPREADSHEET_ID']
    .forEach(function (k) { log(!!p.getProperty(k), 'Script property ' + k); });

  try {
    var ss = getSpreadsheet_();
    log(!!ss.getSheetByName(SHEET_NAME), 'ชีต "' + SHEET_NAME + '" ใน ' + ss.getName());
  } catch (e) { log(false, 'เปิดชีตหลัก: ' + e.message); }

  try {
    var b = provinceBoundaries_(getGeoJsonFromDrive());
    log(b.length >= 4, 'GeoJSON พบขอบเขต ' + b.map(function (x) { return x.name; }).join(', '));
  } catch (e) { log(false, 'GeoJSON: ' + e.message); }

  try {
    var ss2 = sourcesSpreadsheet_();
    log(true, 'ชีตแหล่งกำเนิด: ' + ss2.getName());
  } catch (e) { log(false, 'ชีตแหล่งกำเนิด: ' + e.message); }

  var live = getLivePM25Data();
  log(TARGET_PROVINCES.every(function (k) { return live[k] !== 'Error'; }), 'Air4Thai ค่าฝุ่นล่าสุด ' + JSON.stringify(live));
  console.log('สถานะซิงก์จุดความร้อนล่าสุด: ' + JSON.stringify(readSyncStatus_()));
}

// ดึงจุดความร้อนจาก NASA ทันที แล้วแสดงจำนวนต่อจังหวัด
function syncNasaNow() {
  var n = fetchAndCacheNasaHotspots();
  console.log('ได้จุดความร้อนในกรอบค้นหา ' + n + ' จุด · 4 จังหวัด: ' + JSON.stringify(readCachedHotspots_().counts));
}

// เรียก Claude 1 ครั้งด้วยข้อมูลทดสอบ (นับเป็น 1 ครั้งของ DAILY_LIMIT)
function testClaude() {
  var sample = [
    'ข้อมูลทดสอบ ไม่ใช่ค่าจริง',
    '* นครราชสีมา',
    '  - PM₂.₅ รอบ 07.00 น. วันนี้: 21.5 มคก./ลบ.ม. (ดี)',
    '  - PM₂.₅ Real-time รายชั่วโมงล่าสุด: 24 มคก./ลบ.ม.',
    '  - วันเกินมาตรฐาน: ปี 2569 รวม 29 วัน → เป้าหมายปี 2570 ไม่เกิน 27 วัน | ปี 2570 เกินแล้ว 0 วัน | เหลือโควต้า 27 วัน',
    '  - จุดความร้อน 24 ชม. ล่าสุด: 3 จุด',
    '  - พยากรณ์ พรุ่งนี้: VR ช่วงเช้า 06–09 น. 1,450 ระดับแย่ (ฝุ่นสะสมตัว) | โอกาสฝนสูงสุด 0%'
  ].join('\n');
  var out = handleAi_({ password: props_().getProperty('AI_PASSWORD'), mode: 'line_draft', contextData: sample });
  console.log(out.result || ('ERROR: ' + out.error));
}

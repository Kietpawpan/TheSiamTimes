// ฟังก์ชันสู้ไม่ถอย V2: สำหรับส่งข้อมูลให้ AI พร้อมระบบ Exponential Backoff
async function fetchAiWithBackoff(url, options = {}, maxRetries = 4) {
    let delay = 2000; // เริ่มรอที่ 2 วินาทีเพราะ AI ใช้เวลาประมวลผลนาน
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            
            // ถ้าเซิร์ฟเวอร์ไม่ว่าง (503) หรือยิงรัวเกินไป (429) ให้เตรียมลองใหม่
            if (response.status === 429 || response.status >= 500) {
                console.warn(`เซิร์ฟเวอร์ AI ไม่ว่าง (รหัส ${response.status}) กำลังลองใหม่ครั้งที่ ${i + 1}...`);
                
                // อัปเดตข้อความหน้าจอให้ผู้ใช้รู้ว่ากำลังพยายามใหม่
                const resultDiv = document.getElementById('aiResult');
                if (resultDiv) {
                    resultDiv.innerHTML = `<div class="text-center text-orange-600 animate-pulse"><i>เซิร์ฟเวอร์หนาแน่น กำลังพยายามเชื่อมต่อใหม่ครั้งที่ ${i + 1}/${maxRetries}...</i></div>`;
                }
                
                if (i === maxRetries - 1) throw new Error(`เซิร์ฟเวอร์ AI ไม่ว่างเกิน ${maxRetries} ครั้ง`);
            } else if (!response.ok) {
                throw new Error(`HTTP error status: ${response.status}`);
            } else {
                return response; // ทำสำเร็จ คืนค่ากลับไป
            }
        } catch (error) {
            if (i === maxRetries - 1) throw error;
        }
        
        // สุ่มเวลาบวกเข้าไป (Jitter 0-1 วินาที) ป้องกันการยิงซ้ำพร้อมกันพอดี
        const jitter = Math.floor(Math.random() * 1000);
        await new Promise(res => setTimeout(res, delay + jitter));
        
        // เพิ่มเวลารอเป็น 2 เท่าในรอบถัดไป
        delay *= 2; 
    }
}

// ฟังก์ชันสู้ไม่ถอย: ดึงข้อมูลแบบมี Auto-Retry สูงสุด 3 ครั้ง
async function fetchWithRetry(url, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response; // ถ้าสำเร็จ คืนค่ากลับไปใช้งานทันที
        } catch (error) {
            if (i === retries - 1) throw error; // ถ้าสู้ครบ 3 ครั้งแล้วยังพัง ให้ยอมแพ้และโยน Error
            console.warn(`เชื่อมต่อ ${url} ล้มเหลว กำลังลองใหม่ครั้งที่ ${i + 1}...`);
            await new Promise(res => setTimeout(res, delay)); // หน่วงเวลา 1 วินาทีก่อนลุยใหม่
        }
    }
}

// ✨ พระเอกของเราอยู่ตรงนี้ครับ! สั่ง Register ให้ปลั๊กอินทำงาน
Chart.register(ChartDataLabels);

let globalDashboardData = []; // ตัวแปรสำหรับเก็บข้อมูลฝุ่นไปให้ AI ประมวลผล
let globalWeatherData = {}; // ตัวแปรสำหรับเก็บข้อมูลสภาพอากาศไปให้ AI ประมวลผล
let globalNasaHotspots = {}; // ตัวแปรเก็บจุดความร้อนจาก NASA ให้ AI ใช้
let hotspotsFromNasa = false; // true เมื่อดึงจุดความร้อนสดจาก NASA สำเร็จ (false = ยังเป็นค่าจากชีต)

// ปีฐานและปีเป้าหมายของคอลัมน์ "วันเกินมาตรฐาน" และ "จุดความร้อนสะสม" ในชีต (คอลัมน์ 8–11)
// ขึ้นปีใหม่แก้ที่นี่ที่เดียว ทั้งกราฟ การ์ด และข้อมูลที่ส่งให้ AI จะเปลี่ยนตาม
const BASE_YEAR_BE = 2569;
const TARGET_YEAR_BE = 2570;

const TARGET_PROVINCES = ["นครราชสีมา", "ชัยภูมิ", "บุรีรัมย์", "สุรินทร์"];
const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function thaiTime(date) {
    return `${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')}`;
}

function thaiDateTime(date) {
    return `วัน${THAI_DAYS[date.getDay()]}ที่ ${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear() + 543} เวลา ${thaiTime(date)} น.`;
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ตัวเลขสำหรับส่งให้ AI: ค่าที่ไม่มีเขียนว่า "ไม่มีข้อมูล" แทน NaN
function fmtNum(value, digits = 1) {
    const n = parseFloat(value);
    return isNaN(n) ? 'ไม่มีข้อมูล' : String(Math.round(n * 10 ** digits) / 10 ** digits);
}

function getAqiLevelName(value) {
    if (isNaN(value)) return 'ไม่มีข้อมูล';
    if (value <= 15) return 'ดีมาก';
    if (value <= 25) return 'ดี';
    if (value <= 37.5) return 'ปานกลาง';
    if (value <= 75) return 'เริ่มมีผลกระทบต่อสุขภาพ';
    return 'มีผลกระทบต่อสุขภาพ';
}

// เกณฑ์ตามกราฟพยากรณ์อัตราการระบายอากาศของกรมอุตุนิยมวิทยา (ozone.tmd.go.th) เหมือน fireRadar.html
// Poor < 2,000 · Fair 2,000–3,999 · Good 4,000–7,999 · Very Good ≥ 8,000 ตร.ม./วินาที
function getVrStatus(vr) {
    if (vr < 2000) return "แย่ (ฝุ่นสะสมตัว)";
    if (vr < 4000) return "ปานกลาง";
    if (vr < 8000) return "ดี";
    return "ดีมาก (ฝุ่นกระจายตัวดี)";
}

function getAqiClass(value) {
    if (isNaN(value)) return 'bg-gray-300 text-gray-700';
    if (value <= 15) return 'aqi-excellent';
    if (value <= 25) return 'aqi-good';
    if (value <= 37.5) return 'aqi-moderate';
    if (value <= 75) return 'aqi-unhealthy-sensitive';
    return 'aqi-unhealthy';
}

function getHealthAdvice(value) {
    if (isNaN(value)) return 'ไม่มีข้อมูลฝุ่น PM₂.₅ ในขณะนี้';
    if (value <= 15) return 'ประชาชนทุกคนสามารถดำเนินชีวิตได้ตามปกติ';
    if (value <= 25) return 'สามารถทำกิจกรรมกลางแจ้งได้ตามปกติ';
    if (value <= 37.5) return 'ลดระยะเวลาทำกิจกรรมกลางแจ้งหรือออกกำลังกายที่ใช้แรงมาก';
    if (value <= 75) return 'สวมหน้ากากป้องกันฝุ่น PM₂.₅ และจำกัดระยะเวลาทำกิจกรรมกลางแจ้ง';
    return 'งดกิจกรรมกลางแจ้ง และสวมหน้ากากป้องกันฝุ่น PM₂.₅';
}

function updateDateText() {
    const date = new Date();
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    
    document.getElementById('report-date').innerText = `ประจำวัน${dayName}ที่ ${day} ${monthName} ${year} เวลา 07.00 น.`;
}

// --------------------------------------------------
window.onload = function() {
    // ปิดหน้า Login (ถ้ามีค้างอยู่) และแสดงหน้ากำลังโหลดข้อมูลแทน
    const loginModal = document.getElementById('globalLoginModal');
    if (loginModal) {
        loginModal.style.display = 'none';
    }
    
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'flex';
    }
    
    // เรียกฟังก์ชันเริ่มดึงข้อมูลทันทีเมื่อเปิดหน้าเว็บ
    startLoadingData();
};
// --------------------------------------------------

function startLoadingData() {
    updateDateText();
    
    const apiUrl = 'https://script.google.com/macros/s/AKfycbxuZ2j2Cuoy6xUEFO7N0wxV2O47ZqAV3eOOtkrRWdAk7C6Fz_mlvP6O5sAplBOH9HG4IA/exec';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            globalDashboardData = data; 
            renderDashboard(data);
        })
        .catch(error => {
            showError(error);
        });
}

function renderDashboard(data) {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('main-content').classList.remove('hidden');

    const cardsContainer = document.getElementById('province-cards');
    const historyTable = document.getElementById('history-table');
    
    let chartLabels = [];
    let chartData = [];
    let chartColors = [];

    let daysOver68Data = [];
    let daysOver69Data = [];
    let hotspot68Data = [];
    let hotspot69Data = [];

    let historyLineDatasets = [];
    const provinceColors = {
        "นครราชสีมา": "#7E22CE", // สีม่วง
        "ชัยภูมิ": "#F59E0B",    // สีส้ม
        "บุรีรัมย์": "#3B82F6",   // สีฟ้า
        "สุรินทร์": "#10B981"    // สีเขียว
    };

    const targetProvinces = TARGET_PROVINCES;
    const seenProvinces = new Set();

    data.forEach(row => {
        const province = row[1];
        
        if (!targetProvinces.includes(province) || seenProvinces.has(province)) return;
        seenProvinces.add(province);

        const pmTodayNum = parseFloat(row[2]);
        const pmToday = isNaN(pmTodayNum) ? "N/A" : pmTodayNum;

        // ดึงค่าจุดความร้อนจากชีตมาก่อน (ระหว่างรอโหลด API สดทับ)
        const hotspotFromSheet = row[3] || 0; 
        globalNasaHotspots[province] = hotspotFromSheet; 
        
        const dayMinus1Num = parseFloat(row[4]);
        const dayMinus1 = isNaN(dayMinus1Num) ? "-" : dayMinus1Num;
        const dayMinus2Num = parseFloat(row[5]);
        const dayMinus2 = isNaN(dayMinus2Num) ? "-" : dayMinus2Num;
        const dayMinus3Num = parseFloat(row[6]);
        const dayMinus3 = isNaN(dayMinus3Num) ? "-" : dayMinus3Num;
        const dayMinus4Num = parseFloat(row[7]); 
        const dayMinus4 = isNaN(dayMinus4Num) ? "-" : dayMinus4Num;

        const daysOver68 = parseFloat(row[8]) || 0;
        const daysOver69 = parseFloat(row[9]) || 0;
        
        daysOver68Data.push(daysOver68);
        daysOver69Data.push(daysOver69);
        hotspot68Data.push(parseFloat(row[10]) || 0);
        hotspot69Data.push(parseFloat(row[11]) || 0);

        const currentAqiClass = getAqiClass(pmTodayNum);
        const healthAdvice = getHealthAdvice(pmTodayNum);

        const target69 = Math.floor(daysOver68 * 0.95);
        const remainingDays = target69 - daysOver69;
        let quotaHtml = '';

        if (remainingDays > 0) {
            quotaHtml = `
                <div class="mt-2 text-xs p-2 bg-blue-100 text-blue-900 rounded-lg w-full text-left border border-blue-300">
                    📉 <span class="font-bold">เป้าหมายลดฝุ่น 5% จากปี ${BASE_YEAR_BE % 100}:</span> ต้องไม่เกิน ${target69} วัน<br>
                    ⏳ <span class="font-bold text-green-700">เหลือโควต้าอีก: ${remainingDays} วัน</span>
                </div>
            `;
        } else if (remainingDays === 0) {
            quotaHtml = `
                <div class="mt-2 text-xs p-2 bg-orange-100 text-orange-900 rounded-lg w-full text-left border border-orange-400">
                    ⚠️ <span class="font-bold">เป้าหมายลดฝุ่น 5% จากปี ${BASE_YEAR_BE % 100}:</span> ต้องไม่เกิน ${target69} วัน<br>
                    🚨 <span class="font-bold text-orange-700">คำเตือน: วันนี้ฝุ่นเกินมาตรฐานชนเพดานเป้าหมายแล้ว!</span>
                </div>
            `;
        } else {
            quotaHtml = `
                <div class="mt-2 text-xs p-2 bg-red-200 text-red-900 rounded-lg w-full text-left border border-red-500 font-bold">
                    ❌ เป้าหมายลดฝุ่น 5% จากปี ${BASE_YEAR_BE % 100}: ต้องไม่เกิน ${target69} วัน<br>
                    ทะลุเป้าหมายแล้ว (เกินมา ${Math.abs(remainingDays)} วัน)
                </div>
            `;
        }

        let riskAdviceHtml = '';
        if (pmTodayNum >= 25.1 && pmTodayNum <= 37.5) {
            riskAdviceHtml = `
                <div class="mt-2 text-xs p-2 bg-yellow-50 text-yellow-900 rounded-lg w-full text-left border border-yellow-300">
                    <span class="font-bold">กลุ่มเสี่ยง:</span> สวมหน้ากาก ป้องกันตนเอง เฝ้าระวังสุขภาพตนเอง หากมีอาการผิดปกติ ให้รีบไปพบแพทย์
                </div>
            `;
        } else if (pmTodayNum >= 37.6 && pmTodayNum <= 75.0) {
            riskAdviceHtml = `
                <div class="mt-2 text-xs p-2 bg-orange-50 text-orange-900 rounded-lg w-full text-left border border-orange-300">
                    <span class="font-bold">กลุ่มเสี่ยง:</span> เลี่ยงกิจกรรมกลางแจ้ง สวมหน้ากากป้องกันฝุ่น พกพายาประจำตัวและอุปกรณ์ที่จำเป็นให้พร้อม หากมีอาการผิดปกติ ให้รีบไปพบแพทย์
                </div>
            `;
        }

        let warningHtml = '';
        if (pmTodayNum >= 75.1) {
            warningHtml = `
                <div class="mt-3 text-xs p-3 bg-red-100 text-red-900 rounded-lg border-2 border-red-600 w-full text-left overflow-y-auto max-h-48 custom-scrollbar">
                    <div class="font-bold text-sm mb-2 text-red-700">🚨 ยกระดับมาตรการรับมือฝุ่น PM₂.₅ สีแดง:</div>
                    <div class="space-y-3">
                        <div>
                            <span class="font-bold">1. การป้องกันสุขภาพและบริหารจัดการภาพรวม</span>
                            <ul class="list-disc pl-4 mt-1 space-y-1">
                                <li><span class="font-semibold">ลดการรับสัมผัสฝุ่น:</span> ขอความร่วมมือประชาชนงดกิจกรรมกลางแจ้ง เช่น การแข่งขันกีฬาหรือคอนเสิร์ตกลางแจ้ง ให้หน่วยงานพิจารณาทำงานที่บ้าน (Work From Home) และพิจารณาปิดสถานศึกษาชั่วคราว</li>
                                <li><span class="font-semibold">การแจ้งเตือน:</span> แจ้งเตือนภัยสถานการณ์ฝุ่นละอองผ่านระบบ Cell Broadcast และ SMS ส่งตรงถึงโทรศัพท์มือถือของประชาชนในพื้นที่เสี่ยง</li>
                                <li><span class="font-semibold">การสาธารณสุข:</span> จัดเตรียมห้องปลอดฝุ่นเพื่อดูแลกลุ่มเปราะบาง แจกอุปกรณ์ป้องกันส่วนบุคคล (หน้ากากมุ่งสู้ฝุ่น) จัดหน่วยแพทย์ลงพื้นที่ และเปิดคลินิกมลพิษ</li>
                                <li><span class="font-semibold">การบรรเทาสถานการณ์:</span> ปฏิบัติการทำฝนหลวงเพื่อลดปริมาณฝุ่นละออง และพิจารณาประกาศเขตการให้ความช่วยเหลือผู้ประสบภัยพิบัติกรณีฉุกเฉินเพื่อให้ความช่วยเหลือประชาชนได้ทันท่วงที</li>
                            </ul>
                        </div>
                        <div>
                            <span class="font-bold">2. การควบคุมฝุ่นในเขตเมือง</span>
                            <ul class="list-disc pl-4 mt-1 space-y-1">
                                <li><span class="font-semibold">ยานพาหนะ:</span> ตั้งจุดตรวจจับยานพาหนะควันดำอย่างเข้มงวด หากพบค่าเกินมาตรฐานให้บังคับใช้กฎหมายอย่างเด็ดขาด</li>
                                <li><span class="font-semibold">อุตสาหกรรมและก่อสร้าง:</span> ตรวจกำกับและบังคับใช้กฎหมายอย่างเข้มงวดกับโรงงานที่มีความเสี่ยงสูง (เช่น โรงงานใช้หม้อไอน้ำ แพลนท์ปูน โรงหลอมโลหะ) รวมถึงสถานที่ก่อสร้าง</li>
                            </ul>
                        </div>
                        <div>
                            <span class="font-bold">3. การควบคุมการเผาในพื้นที่ป่าและเกษตรกรรม</span>
                            <ul class="list-disc pl-4 mt-1 space-y-1">
                                <li><span class="font-semibold">บังคับใช้กฎหมายการเผา:</span> หากพบการเผาในพื้นที่เกษตร จะถูกบังคับใช้กฎหมาย และถูกตัดสิทธิ์ความช่วยเหลือจากภาครัฐ</li>
                                <li><span class="font-semibold">การจัดการไฟป่า:</span> จัดชุดปฏิบัติการลาดตระเวนและจุดสกัดในพื้นที่เสี่ยง หากมีไฟป่าเกิดขึ้นเจ้าของพื้นที่ต้องร่วมรับผิดชอบ และพิจารณาประกาศปิดป่าในห้วงเวลาที่เหมาะสม</li>
                                <li><span class="font-semibold">บทลงโทษขั้นเด็ดขาด:</span> หากพบการลักลอบเผาในพื้นที่เกษตรกรรมที่ตั้งอยู่ในเขตที่ดินของรัฐ จะถูกดำเนินการเพิกถอนสิทธิในการเข้าทำประโยชน์หรืออยู่อาศัยทันที</li>
                            </ul>
                        </div>
                        <div>
                            <span class="font-bold">4. การจัดการหมอกควันข้ามแดน</span>
                            <ul class="list-disc pl-4 mt-1 space-y-1">
                                <li>ควบคุมและบังคับใช้กฎหมายอย่างเคร่งครัดกับผู้ลักลอบนำเข้าข้าวโพดเลี้ยงสัตว์ที่ไม่ปลอดการเผา</li>
                                <li>ประสานงานเพื่อแก้ไขปัญหาหมอกควันข้ามแดนผ่านกลไกคณะกรรมการชายแดน และการประชุมระดับอาเซียน</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        } else if (pmTodayNum >= 37.6 && pmTodayNum <= 75.0) {
            warningHtml = `
                <div class="mt-3 text-xs p-3 bg-orange-100 text-orange-900 rounded-lg border-2 border-orange-500 w-full text-left overflow-y-auto max-h-48 custom-scrollbar">
                    <div class="font-bold text-sm mb-2 text-orange-700">⚠️ ยกระดับมาตรการรับมือฝุ่น PM₂.₅ สีส้ม:</div>
                    <div class="space-y-3">
                        <div>
                            <span class="font-bold">1. การแจ้งเตือนและป้องกันสุขภาพของประชาชน</span>
                            <ul class="list-disc pl-4 mt-1 space-y-1">
                                <li><span class="font-semibold">แจ้งเตือนภัย:</span> ยกระดับการแจ้งเตือนสถานการณ์ฝุ่น PM₂.₅</li>
                                <li><span class="font-semibold">ลดการรับสัมผัส:</span> ขอความร่วมมือประชาชนงดกิจกรรมกลางแจ้ง</li>
                                <li><span class="font-semibold">สาธารณสุข:</span> จัดเตรียมห้องปลอดฝุ่นเพื่อดูแลกลุ่มเปราะบาง</li>
                            </ul>
                        </div>
                        <div>
                            <span class="font-bold">2. การควบคุมฝุ่นในเขตเมือง</span>
                            <ul class="list-disc pl-4 mt-1 space-y-1">
                                <li><span class="font-semibold">ตรวจจับยานพาหนะ:</span> เข้มงวดการตรวจสอบและตรวจจับรถยนต์ควันดำ หากพบค่าเกินมาตรฐานให้บังคับใช้กฎหมายอย่างเด็ดขาด</li>
                                <li><span class="font-semibold">คุมเข้มโรงงานและก่อสร้าง:</span> ตรวจกำกับและบังคับใช้กฎหมายอย่างเข้มงวดกับโรงงานอุตสาหกรรมเสี่ยงสูง (เช่น หม้อไอน้ำ แพลนท์ปูน โรงหลอมโลหะ) และสถานที่ก่อสร้าง</li>
                            </ul>
                        </div>
                        <div>
                            <span class="font-bold">3. การควบคุมการเผาในพื้นที่เกษตรและไฟป่า</span>
                            <ul class="list-disc pl-4 mt-1 space-y-1">
                                <li><span class="font-semibold">คุมเข้มการเผาทางการเกษตร:</span> ควบคุมการเผาอย่างเคร่งครัด หากเกษตรกรฝ่าฝืนหรือไม่ปฏิบัติตามเงื่อนไข จะถูกบังคับใช้กฎหมายและตัดสิทธิ์การรับความช่วยเหลือจากรัฐ</li>
                                <li><span class="font-semibold">การจัดการป่าไม้:</span> จัดชุดปฏิบัติการลาดตระเวน ตั้งจุดสกัดและจุดเฝ้าระวังในพื้นที่ป่าอนุรักษ์และป่าสงวน หากเกิดไฟป่าเจ้าของพื้นที่ต้องร่วมรับผิดชอบ</li>
                                <li><span class="font-semibold">บทลงโทษในที่ดินรัฐ:</span> หากพบการกระทำผิดลักลอบเผาในพื้นที่เกษตรกรรมที่อยู่ในเขตที่ดินของรัฐ จะถูกพิจารณาเพิกถอนสิทธิการทำประโยชน์หรืออยู่อาศัย</li>
                            </ul>
                        </div>
                        <div>
                            <span class="font-bold">4. การบริหารจัดการภาพรวม</span>
                            <ul class="list-disc pl-4 mt-1 space-y-1">
                                <li>ติดตามสถานการณ์อย่างใกล้ชิด หากสถานการณ์รุนแรงเข้าตามหลักเกณฑ์ จังหวัดพิจารณาประกาศเขตการให้ความช่วยเหลือผู้ประสบภัยพิบัติกรณีฉุกเฉินเพื่อให้การดูแลประชาชนได้ทันท่วงที</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        } else if (dayMinus2Num > 25.0 && dayMinus2Num <= 37.5 &&
                   dayMinus1Num > 25.0 && dayMinus1Num <= 37.5 &&
                   pmTodayNum >= 30.0 && pmTodayNum <= 37.5 &&
                   dayMinus2Num < dayMinus1Num && dayMinus1Num < pmTodayNum) {
            warningHtml = `
                <div class="mt-3 text-xs p-2 bg-yellow-100 text-yellow-800 rounded-lg font-bold border border-yellow-500 w-full text-left">
                    ⚠️ แจ้งเตือน: ควรพิจารณายกระดับมาตรการป้องกันปัญหาฝุ่น PM₂.₅ ก่อนจะเริ่มมีผลกระทบต่อสุขภาพ
                </div>
            `;
        }

        cardsContainer.innerHTML += `
            <div class="p-4 rounded-xl shadow-md text-center flex flex-col justify-start items-center ${currentAqiClass}">
                <h4 class="text-xl font-bold">${province}</h4>
                <div class="text-3xl font-black mt-2">${pmToday}</div>
                <div class="text-xs">มคก./ลบ.ม.</div>
                <div class="mt-2 text-sm bg-white bg-opacity-30 rounded px-2 py-1 w-full">
                    จุดความร้อน (NASA 24 ชม.): <span id="hotspot-val-${province}" class="font-bold text-red-700">${hotspotFromSheet} จุด</span>                        
                </div>
                ${quotaHtml}
                <div class="mt-2 text-xs p-2 bg-white bg-opacity-60 rounded-lg text-black w-full text-left">
                    <span class="font-bold">คำแนะนำ:</span> ${healthAdvice}
                </div>
                ${riskAdviceHtml}
                ${warningHtml}
            </div>
        `;

        historyTable.innerHTML += `
            <tr>
                <td class="border p-2 font-semibold text-left">${province}</td>
                <td class="border p-2 ${getAqiClass(dayMinus4Num)}">${dayMinus4}</td>
                <td class="border p-2 ${getAqiClass(dayMinus3Num)}">${dayMinus3}</td>
                <td class="border p-2 ${getAqiClass(dayMinus2Num)}">${dayMinus2}</td>
                <td class="border p-2 ${getAqiClass(dayMinus1Num)}">${dayMinus1}</td>
                <td class="border p-2 font-bold ${currentAqiClass}">${pmToday}</td>
            </tr>
        `;

        chartLabels.push(province);
        chartData.push(isNaN(pmTodayNum) ? null : pmTodayNum);
        
        if (isNaN(pmTodayNum)) chartColors.push('#D1D5DB');
        else if (pmTodayNum <= 15) chartColors.push('#00B0F0');
        else if (pmTodayNum <= 25) chartColors.push('#92D050');
        else if (pmTodayNum <= 37.5) chartColors.push('#FFFF00');
        else if (pmTodayNum <= 75) chartColors.push('#FFC000');
        else chartColors.push('#FF0000');

        let pmDataArray = [
            isNaN(dayMinus4Num) ? null : dayMinus4Num,
            isNaN(dayMinus3Num) ? null : dayMinus3Num,
            isNaN(dayMinus2Num) ? null : dayMinus2Num,
            isNaN(dayMinus1Num) ? null : dayMinus1Num,
            isNaN(pmTodayNum) ? null : pmTodayNum
        ];

        historyLineDatasets.push({
            label: province,
            data: pmDataArray,
            borderColor: provinceColors[province] || '#333',
            backgroundColor: provinceColors[province] || '#333',
            fill: false,
            tension: 0.1,
            borderWidth: 2,
            pointRadius: 4
        });
    });

    const datalabelsOptions = {
        anchor: 'end',
        align: 'top',
        color: '#333',
        font: { weight: 'bold' },
        formatter: Math.round
    };

    new Chart(document.getElementById('aqiChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'ค่าฝุ่น PM₂.₅ วันนี้',
                data: chartData,
                backgroundColor: chartColors,
                borderWidth: 1,
                borderColor: '#333'
            }]
        },
        options: { 
            responsive: true, 
            layout: { padding: { top: 25 } },
            scales: { y: { beginAtZero: true } }, 
            plugins: { 
                legend: { display: false },
                datalabels: datalabelsOptions
            } 
        }
    });

    new Chart(document.getElementById('daysOverChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [
                { label: `ปี ${BASE_YEAR_BE}`, data: daysOver68Data, backgroundColor: '#9CA3AF' },
                { label: `ปี ${TARGET_YEAR_BE}`, data: daysOver69Data, backgroundColor: '#EF4444' }
            ]
        },
        options: { 
            responsive: true, 
            layout: { padding: { top: 25 } },
            scales: { y: { beginAtZero: true } },
            plugins: { datalabels: datalabelsOptions }
        }
    });

    new Chart(document.getElementById('hotspotAccumChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [
                { label: `ปี ${BASE_YEAR_BE}`, data: hotspot68Data, backgroundColor: '#9CA3AF' },
                { label: `ปี ${TARGET_YEAR_BE}`, data: hotspot69Data, backgroundColor: '#F97316' }
            ]
        },
        options: { 
            responsive: true, 
            layout: { padding: { top: 25 } },
            scales: { y: { beginAtZero: true } },
            plugins: { datalabels: datalabelsOptions }
        }
    });

    new Chart(document.getElementById('historyLineChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: ['ย้อนหลัง 4 วัน', 'ย้อนหลัง 3 วัน', 'ย้อนหลัง 2 วัน', 'ย้อนหลัง 1 วัน', 'วันนี้'],
            datasets: historyLineDatasets
        },
        options: {
            responsive: true,
            layout: { padding: { top: 25, right: 20, left: 10, bottom: 10 } },
            scales: {
                y: {
                    beginAtZero: false, 
                    grace: '10%', 
                    title: { display: true, text: 'PM₂.₅ (มคก./ลบ.ม.)', font: { family: 'Sarabun' } }
                },
                x: {
                    ticks: { font: { family: 'Sarabun' } }
                }
            },
            plugins: {
                legend: { 
                    display: true, 
                    position: 'top',
                    labels: { font: { family: 'Sarabun', size: 14 } }
                },
                datalabels: { display: false },
                annotation: {
                    drawTime: 'beforeDatasetsDraw',
                    annotations: {
                        zoneBlue: {
                            type: 'box', yMin: 0, yMax: 15,
                            backgroundColor: 'rgba(0, 176, 240, 0.2)', borderWidth: 0, adjustScaleRange: false
                        },
                        zoneGreen: {
                            type: 'box', yMin: 15, yMax: 25,
                            backgroundColor: 'rgba(146, 208, 80, 0.2)', borderWidth: 0, adjustScaleRange: false
                        },
                        zoneYellow: {
                            type: 'box', yMin: 25, yMax: 37.5,
                            backgroundColor: 'rgba(255, 255, 0, 0.2)', borderWidth: 0, adjustScaleRange: false
                        },
                        zoneOrange: {
                            type: 'box', yMin: 37.5, yMax: 75,
                            backgroundColor: 'rgba(255, 192, 0, 0.2)', borderWidth: 0, adjustScaleRange: false
                        },
                        zoneRed: {
                            type: 'box', yMin: 75, yMax: 1000, 
                            backgroundColor: 'rgba(255, 0, 0, 0.2)', borderWidth: 0, adjustScaleRange: false
                        }
                    }
                }
            }
        }
    });

    loadWeather();
    loadHotspots();
}

function showError(error) {
    document.getElementById('loader').innerHTML = "เกิดข้อผิดพลาดในการดึงข้อมูล โปรดตรวจสอบ Google Sheets";
    console.error(error);
}

function updateDownloadLinkClean() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const dynamicUrl = `http://air4thai.pcd.go.th/report/HazeTableReportNE_V2003_${formattedDate}_7.pdf`;
    document.getElementById('hazeDownloadBtnClean').href = dynamicUrl;
}
  
updateDownloadLinkClean();

const GAS_WEATHER_PROXY = 'https://script.google.com/macros/s/AKfycbxwoNT9sKWRIz2jGIqN44-71pjnMVyeV_ofNx0jDodMfMITcbCyw81Vsxw9rAURiRtDuw/exec';

function getWeatherCondition(condCode) {
    switch(parseInt(condCode)) {
        case 1: return "ท้องฟ้าแจ่มใส";
        case 2: return "มีเมฆบางส่วน";
        case 3: return "เมฆเป็นส่วนมาก";
        case 4: return "มีเมฆมาก";
        case 5: return "ฝนตกเล็กน้อย";
        case 6: return "ฝนปานกลาง";
        case 7: return "ฝนตกหนัก";
        case 8: return "ฝนฟ้าคะนอง";
        case 9: return "อากาศหนาวจัด";
        case 10: return "อากาศหนาว";
        case 11: return "อากาศเย็น";
        case 12: return "อากาศร้อนจัด";
        default: return "-";
    }
}

function windDirName(degree) {
    const directions = ["เหนือ", "ตะวันออกเฉียงเหนือ", "ตะวันออก", "ตะวันออกเฉียงใต้", "ใต้", "ตะวันตกเฉียงใต้", "ตะวันตก", "ตะวันตกเฉียงเหนือ"];
    const d = ((degree % 360) + 360) % 360;
    return directions[Math.round(d / 45) % 8];
}

function getWindDirectionThai(degree) {
    if (degree === undefined || isNaN(degree)) return '-';
    return windDirName(degree) + ' (' + (((degree % 360) + 360) % 360) + '°)';
}

// สรุปพยากรณ์รายชั่วโมงของ Open-Meteo (3 วัน) เป็นบรรทัดสั้น ๆ วันละบรรทัด ให้ AI ประเมินความเสี่ยง 24–48 ชม. จากข้อมูลจริง
// VR = BLH × ความเร็วลม 10 ม. (สูตรเดียวกับการ์ดสภาพอากาศ) · ทิศลม = ทิศที่ลมพัดมา
function summarizeForecast(meteo) {
    const h = meteo && meteo.hourly;
    if (!h || !Array.isArray(h.time)) return [];
    const blh = h.boundary_layer_height || [];
    const ws = h.wind_speed_10m || [];
    const wd = h.wind_direction_10m || [];
    const pop = h.precipitation_probability || [];
    const rain = h.precipitation || [];
    const isNum = v => typeof v === 'number' && !isNaN(v);
    const hours = (base, from, to) => Array.from({ length: to - from + 1 }, (_, k) => base + from + k);
    const mean = arr => { const v = arr.filter(isNum); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
    const vrAt = i => (isNum(blh[i]) && isNum(ws[i])) ? blh[i] * ws[i] : null;
    const fmtVr = v => v === null ? 'ไม่มีข้อมูล' : `${Math.round(v).toLocaleString('en-US')} ระดับ${getVrStatus(v)}`;
    const dayNames = ['วันนี้', 'พรุ่งนี้', 'มะรืนนี้'];

    const lines = [];
    for (let d = 0; d < 3; d++) {
        const base = d * 24;
        if (h.time.length < base + 24) break;
        const [, m, dd] = h.time[base].slice(0, 10).split('-').map(Number);
        const dateLabel = `${dayNames[d]} (${dd} ${THAI_MONTHS_SHORT[m - 1]})`;

        const morningVr = mean(hours(base, 6, 9).map(vrAt));
        let peak = null;
        hours(base, 10, 17).forEach(i => { const v = vrAt(i); if (v !== null && (!peak || v > peak.v)) peak = { v, i }; });
        const nightBlh = hours(base, 0, 8).map(i => blh[i]).filter(isNum);
        const wsMean = mean(hours(base, 0, 23).map(i => ws[i]));

        // ทิศลมเด่นช่วง 06–18 น.: เฉลี่ยแบบเวกเตอร์ถ่วงด้วยความเร็วลม
        let sx = 0, sy = 0;
        hours(base, 6, 18).forEach(i => {
            if (isNum(wd[i]) && isNum(ws[i])) {
                sx += Math.sin(wd[i] * Math.PI / 180) * ws[i];
                sy += Math.cos(wd[i] * Math.PI / 180) * ws[i];
            }
        });
        const dirText = (sx || sy) ? `พัดมาจากทิศ${windDirName(Math.atan2(sx, sy) * 180 / Math.PI)}` : 'ไม่มีข้อมูลทิศลม';

        const pops = hours(base, 0, 23).map(i => pop[i]).filter(isNum);
        const rains = hours(base, 0, 23).map(i => rain[i]).filter(isNum);

        lines.push(`${dateLabel}: VR ช่วงเช้า 06–09 น. ${fmtVr(morningVr)}` +
            ` | VR สูงสุดช่วงกลางวัน ${peak ? `${fmtVr(peak.v)} เวลา ${h.time[peak.i].slice(11, 13)}.00 น.` : 'ไม่มีข้อมูล'}` +
            ` | BLH ต่ำสุด 00–08 น. ${nightBlh.length ? Math.round(Math.min(...nightBlh)) + ' ม.' : 'ไม่มีข้อมูล'}` +
            ` | ลมเฉลี่ย ${wsMean === null ? 'ไม่มีข้อมูล' : (wsMean * 3.6).toFixed(1) + ' กม./ชม.'} ${dirText}` +
            ` | โอกาสฝนสูงสุด ${pops.length ? Math.max(...pops) + '%' : 'ไม่มีข้อมูล'}` +
            ` | ฝนรวม ${rains.length ? rains.reduce((a, b) => a + b, 0).toFixed(1) + ' มม.' : 'ไม่มีข้อมูล'}`);
    }
    return lines;
}

const GAS_LIVE_PM25_PROXY = 'https://script.google.com/macros/s/AKfycbxuZ2j2Cuoy6xUEFO7N0wxV2O47ZqAV3eOOtkrRWdAk7C6Fz_mlvP6O5sAplBOH9HG4IA/exec';

async function fetchWeatherData() {
    const weatherContainer = document.getElementById('weather-cards');
    const provinces = [
        { name: 'นครราชสีมา', lat: 14.9799, lon: 102.0978 },
        { name: 'ชัยภูมิ', lat: 15.8063, lon: 102.0315 },
        { name: 'บุรีรัมย์', lat: 14.9951, lon: 103.1116 },
        { name: 'สุรินทร์', lat: 14.8818, lon: 103.4936 }
    ];

    weatherContainer.innerHTML = '';

    for (const prov of provinces) {
        weatherContainer.innerHTML += `
            <div class="border rounded-lg p-3 bg-blue-50 relative" id="weather-${prov.name}">
                <h4 class="font-bold text-blue-800 text-center border-b pb-2 mb-2">จ.${prov.name}</h4>
                <div class="text-sm text-center text-gray-500 py-4 animate-pulse">
                    กำลังดึงข้อมูล...
                </div>
            </div>
        `;
    }

    let livePMData = {};
    try {
        const livePMResponse = await fetch(`${GAS_LIVE_PM25_PROXY}?action=live_pm25`);
        if (livePMResponse.ok) {
            livePMData = await livePMResponse.json();
        }
    } catch (e) {
        console.error("ไม่สามารถดึงข้อมูล Live PM₂.₅ ได้:", e);
    }

    const fetchPromises = provinces.map(async (prov) => {
        let forecastLines = [];
        try {
            // 3 วัน: ชั่วโมงของวันนี้ยังอยู่ที่ตำแหน่ง 0–23 เหมือนเดิม ส่วน 24–71 คือพรุ่งนี้และมะรืน (ใช้สรุปพยากรณ์ให้ AI)
            const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${prov.lat}&longitude=${prov.lon}&hourly=boundary_layer_height,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m&wind_speed_unit=ms&timezone=Asia%2FBangkok&forecast_days=3`;
            const [weatherResponse, meteoResponse] = await Promise.all([
                fetchWithRetry(`${GAS_WEATHER_PROXY}?lat=${prov.lat}&lon=${prov.lon}`, 3, 1000).catch(() => null),
                fetchWithRetry(meteoUrl, 3, 1000).catch(() => null)
            ]);

            let meteoData = null;
            if (meteoResponse && meteoResponse.ok) {
                try { meteoData = await meteoResponse.json(); } catch (e) {}
            }
            forecastLines = summarizeForecast(meteoData);

            if (weatherResponse && weatherResponse.ok) {
                const data = await weatherResponse.json();

                if (data && data.WeatherForecasts && data.WeatherForecasts.length > 0) {
                    const forecastObj = data.WeatherForecasts[0].forecasts[0]; 
                    const weatherData = forecastObj.data;
                    const rawTime = forecastObj.time;
                    
                    const dateObj = new Date(rawTime);
                    const timeString = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                    const dateString = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
                    const displayTime = `${dateString} เวลา ${timeString} น.`;
                    
                    const condText = weatherData.cond !== undefined ? getWeatherCondition(weatherData.cond) : '-';
                    const tc = weatherData.tc !== undefined ? weatherData.tc : '-';
                    const rh = weatherData.rh !== undefined ? weatherData.rh : '-';

                    let rainChanceDisplay = '0 %';
                    if (weatherData.pop !== undefined) rainChanceDisplay = `${weatherData.pop} %`;
                    // ปริมาณฝนพยากรณ์จากกรมอุตุนิยมวิทยา (ช่อง rain ต้องอยู่ใน fields ของ Apps Script) ต่อท้ายโอกาสเกิดฝนด้านล่าง
                    const tmdRain = (weatherData.rain !== undefined && weatherData.rain !== null && weatherData.rain !== '') ? weatherData.rain : null;

                    let windSpeedDisplay = '-';
                    if (weatherData.ws10m !== undefined) {
                        const kmh = (weatherData.ws10m * 3.6).toFixed(1);
                        windSpeedDisplay = `${kmh} กม./ชม.`;
                    }
                    const windDirDisplay = weatherData.wd10m !== undefined ? getWindDirectionThai(weatherData.wd10m) : '-';

                    let blhDisplay = '-';
                    let vrDisplay = '-';
                    let currentBlhVal = 0;
                    
                    if (meteoData) {
                        try {
                            const currentHour = new Date().getHours();

                            const currentBlh = meteoData.hourly.boundary_layer_height[currentHour];
                            if (currentBlh !== null && currentBlh !== undefined) {
                                currentBlhVal = Math.round(currentBlh);
                                blhDisplay = `${currentBlhVal} เมตร`;
                            }

                            const currentPop = meteoData.hourly.precipitation_probability[currentHour];
                            if (currentPop !== null && currentPop !== undefined) {
                                rainChanceDisplay = `${currentPop} %`;
                            }
                        } catch(e) {}
                    }

                    if (tmdRain !== null) rainChanceDisplay += ` · ปริมาณฝน ${tmdRain} มม.`;

                    if (weatherData.ws10m !== undefined && currentBlhVal > 0) {
                        const ws_ms = weatherData.ws10m;
                        const vrValue = Math.round(currentBlhVal * ws_ms);
                        vrDisplay = `${vrValue} ตร.ม./วินาที (${getVrStatus(vrValue)})`;
                    }

                    // จัดการค่า Live PM₂.₅ ที่ดึงมาแล้ว
                    const rawLivePM = livePMData[prov.name];
                    let currentLivePMText = rawLivePM || 'N/A';
                    let livePMClass = 'text-gray-500';
                    let livePMIcon = '⚪';
                    const pmNum = parseFloat(rawLivePM);

                    // ดึงค่าฝุ่น 07.00 น. ของจังหวัดนี้จาก globalDashboardData มาเทียบ
                    let pm7amNum = NaN;
                    if (globalDashboardData && globalDashboardData.length > 0) {
                        const rowData = globalDashboardData.find(row => row[1] === prov.name);
                        if (rowData) {
                            pm7amNum = parseFloat(rowData[2]);
                        }
                    }

                    if (!isNaN(pmNum)) {
                        if (pmNum <= 15.0) { livePMIcon = '😊'; }
                        else if (pmNum <= 25.0) { livePMIcon = '🙂'; }
                        else if (pmNum <= 37.5) { livePMIcon = '😐'; }
                        else if (pmNum <= 75.0) { livePMIcon = '⚠️'; }
                        else if (pmNum > 75.0) { livePMIcon = '🚨'; }

                        // เช็คสีตัวเลขเทียบกับเวลา 07.00 น.
                        if (!isNaN(pm7amNum)) {
                            if (pmNum < pm7amNum) {
                                livePMClass = 'text-green-600'; 
                                currentLivePMText += ' <span class="text-sm">📉</span>';
                            } else if (pmNum > pm7amNum) {
                                livePMClass = 'text-red-600'; 
                                currentLivePMText += ' <span class="text-sm">📈</span>';
                            } else {
                                livePMClass = 'text-blue-600'; 
                                currentLivePMText += ' <span class="text-sm">➖</span>';
                            }
                        } else {
                            if (pmNum <= 15.0) livePMClass = 'text-blue-600';
                            else if (pmNum <= 25.0) livePMClass = 'text-green-600';
                            else if (pmNum <= 37.5) livePMClass = 'text-yellow-600';
                            else if (pmNum <= 75.0) livePMClass = 'text-orange-600';
                            else livePMClass = 'text-red-600';
                        }
                    }

                    const livePMHtml = `
                        <div class="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200 shadow-inner my-2">
                            <span class="font-bold text-gray-800 flex items-center gap-1">${livePMIcon} ฝุ่น PM₂.₅:</span>
                            <span class="font-extrabold text-lg ${livePMClass}">${currentLivePMText} มคก./ลบ.ม.</span>
                        </div>
                    `;

                    globalWeatherData[prov.name] = {
                        cond: condText,
                        temp: tc,
                        rh: rh,
                        windSpeed: windSpeedDisplay,
                        windDir: windDirDisplay,
                        rainChance: rainChanceDisplay,
                        blh: blhDisplay,
                        vr: vrDisplay,
                        currentPM25: rawLivePM || 'N/A',
                        tmdTime: displayTime,
                        forecast: forecastLines
                    };

                    let windArrowHtml = '';
                    if (weatherData.wd10m !== undefined) {
                        const rotation = (weatherData.wd10m + 180) % 360;
                        windArrowHtml = `<svg style="transform: rotate(${rotation}deg);" class="inline-block w-5 h-5 ml-1 text-blue-600 font-bold drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 19V5m-7 7l7-7 7 7"></path></svg>`;
                    }

                    document.getElementById(`weather-${prov.name}`).innerHTML = `
                        <h4 class="font-bold text-blue-800 text-center border-b pb-2 mb-2">จ.${prov.name}</h4>
                        <div class="text-xs text-center text-gray-500 mb-2 bg-white py-1 rounded border border-gray-200 shadow-sm">
                            อัปเดตข้อมูล weather: <span class="font-bold text-blue-700">${displayTime}</span>
                        </div>
                        ${livePMHtml}
                        <div class="text-sm space-y-2">
                            <div class="flex justify-between"><span>🌤️ สภาพอากาศ:</span> <span class="font-semibold text-blue-700">${condText}</span></div>
                            <div class="flex justify-between"><span>🌡️ อุณหภูมิ:</span> <span class="font-semibold">${tc} °C</span></div>
                            <div class="flex justify-between"><span>💧 ความชื้น:</span> <span class="font-semibold">${rh} %</span></div>
                            <div class="flex justify-between"><span>🌧️ โอกาสเกิดฝน:</span> <span class="font-semibold text-blue-600">${rainChanceDisplay}</span></div>
                            <div class="flex justify-between"><span>🌬️ ความเร็วลม:</span> <span class="font-semibold">${windSpeedDisplay}</span></div>
                            <div class="flex justify-between items-center">
                                <span>🧭 ทิศทางลม:</span> 
                                <span class="font-semibold text-right flex items-center justify-end">
                                    ${windDirDisplay} ${windArrowHtml}
                                </span>
                            </div>
                            <div class="flex justify-between border-t border-blue-200 pt-2 mt-2">
                                <span class="font-bold text-purple-800">📏 เพดานการระบายอากาศ:</span>
                                <span class="font-bold text-purple-600">${blhDisplay}</span>
                            </div>
                        </div>
                    `;
                } else {
                    throw new Error("TMD returned no forecast");
                }
            } else {
                throw new Error("Failed to load TMD");
            }
        } catch (error) {
            // ข้อมูลกรมอุตุฯ ใช้ไม่ได้ แต่ยังส่งค่าฝุ่นล่าสุดและพยากรณ์ Open-Meteo (ถ้ามี) ให้ AI ได้
            globalWeatherData[prov.name] = {
                unavailable: true,
                currentPM25: livePMData[prov.name] || 'N/A',
                forecast: forecastLines
            };
            document.getElementById(`weather-${prov.name}`).innerHTML = `
                <h4 class="font-bold text-blue-800 text-center border-b pb-2 mb-2">จ.${prov.name}</h4>
                <div class="text-sm text-red-500 text-center py-4">ไม่สามารถดึงข้อมูลสภาพอากาศได้</div>
            `;
        }
    });

    await Promise.all(fetchPromises);
}

// ==== ดึงข้อมูล NASA ผ่าน Google Apps Script Proxy (ดึงจาก Cache ระบบที่ 2)
async function fetchNasaHotspots() {
    const GAS_NEW_HOTSPOT_PROXY = 'https://script.google.com/macros/s/AKfycbxuZ2j2Cuoy6xUEFO7N0wxV2O47ZqAV3eOOtkrRWdAk7C6Fz_mlvP6O5sAplBOH9HG4IA/exec?action=hotspots';
    
    try {
        const response = await fetch(GAS_NEW_HOTSPOT_PROXY);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        if (data && data.counts) {
            hotspotsFromNasa = true;
            for (const [prov, count] of Object.entries(data.counts)) {
                globalNasaHotspots[prov] = count;
                const el = document.getElementById(`hotspot-val-${prov}`);
                if (el) {
                    el.innerText = count + " จุด";
                }
            }
        } else if (data.error) {
             throw new Error(data.error);
        }
        
    } catch (error) {
        console.error("Error fetching NASA data via proxy:", error);
    }
}

// ==========================================
// ความสดของข้อมูลที่ส่งให้ AI
// ==========================================
// สภาพอากาศ ฝุ่น Real-time และจุดความร้อนดึงครั้งเดียวตอนเปิดหน้า ถ้าเปิดหน้าทิ้งไว้แล้วค่อยกดปุ่ม AI
// ข้อมูลจะเก่า (เช่น BLH ตอนเช้าถูกใช้ตอนบ่าย) จึงดึงใหม่ก่อนวิเคราะห์ถ้าเก่ากว่ากำหนด
const AI_DATA_MAX_AGE_MS = 20 * 60 * 1000;
const PAGE_LOADED_DAY = new Date().toDateString();
let weatherJob = null;  // { startedAt, promise }
let hotspotJob = null;

function loadWeather() {
    weatherJob = { startedAt: new Date(), promise: fetchWeatherData().catch(err => console.error(err)) };
    return weatherJob.promise;
}

function loadHotspots() {
    hotspotJob = { startedAt: new Date(), promise: fetchNasaHotspots() };
    return hotspotJob.promise;
}

function freshOrReload(job, loader) {
    if (job && Date.now() - job.startedAt.getTime() < AI_DATA_MAX_AGE_MS) return job.promise; // กำลังดึงอยู่ หรือเพิ่งดึง
    return loader();
}

async function ensureFreshAiData() {
    const timeout = new Promise(res => setTimeout(res, 30000)); // ไม่รอเกิน 30 วินาที ใช้เท่าที่ได้
    await Promise.race([
        Promise.allSettled([freshOrReload(weatherJob, loadWeather), freshOrReload(hotspotJob, loadHotspots)]),
        timeout
    ]);
}

// ==========================================
// ฟังก์ชันสั่งการ AI (เพิ่มระบบ 2 โหมด)
// ==========================================
// URL ของ Apps Script ตัวใหม่ที่เรียก Claude (apps-script/pm25-claude-advisor.gs) วางหลัง Deploy
// ถ้ายังว่าง ปุ่ม AI จะใช้สคริปต์ Gemini ตัวเดิมไปก่อน (ได้ข้อมูลชุดใหม่ที่แม่นขึ้นเหมือนกัน)
const CLAUDE_ADVISOR_URL = '';
const LEGACY_GEMINI_URL = 'https://script.google.com/macros/s/AKfycby2OvLen-3AxfZH2mJ9f-63DClvUT5RuSbbNDuD1_T6SqStLKDYKVapnPOVj_ir_ogj-Q/exec';
const AI_ENDPOINT_URL = CLAUDE_ADVISOR_URL || LEGACY_GEMINI_URL;

(function showAiCredit() {
    const el = document.getElementById('ai-credit');
    if (el) el.textContent = CLAUDE_ADVISOR_URL ? 'Claude API (Anthropic) & Monte Kietpawpan' : 'Google Gemini API & Monte Kietpawpan';
})();

let currentAiMode = 'line_draft'; 

function openAiPasswordModal(mode) {
    currentAiMode = mode;
    document.getElementById('aiPasswordInput').value = '';
    document.getElementById('passwordError').classList.add('hidden');
    document.getElementById('passwordModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('aiPasswordInput').focus(), 100);
}

const btnAnalyze = document.getElementById('btnAnalyze');
if (btnAnalyze) {
    btnAnalyze.addEventListener('click', function() {
        openAiPasswordModal('line_draft');
    });
}

const btnFreeAdvice = document.getElementById('btnFreeAdvice');
if (btnFreeAdvice) {
    btnFreeAdvice.addEventListener('click', function() {
        openAiPasswordModal('free_advice');
    });
}

const btnCancelPassword = document.getElementById('btnCancelPassword');
if (btnCancelPassword) {
    btnCancelPassword.addEventListener('click', function() {
        document.getElementById('passwordModal').classList.add('hidden');
    });
}

const aiPasswordInput = document.getElementById('aiPasswordInput');
if (aiPasswordInput) {
    aiPasswordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('btnConfirmPassword').click();
        }
    });
}

const btnConfirmPassword = document.getElementById('btnConfirmPassword');
if (btnConfirmPassword) {
    btnConfirmPassword.addEventListener('click', async function() {
        const inputVal = document.getElementById('aiPasswordInput').value;
        document.getElementById('passwordModal').classList.add('hidden');
        await runAiAnalysis(inputVal, currentAiMode);
    });
}

// รวบรวมข้อมูลทั้งหมดบนหน้าเป็นข้อความเดียวส่งให้ AI
// ระบุเวลา แหล่งที่มา และหน่วยของทุกค่า เพื่อไม่ให้ AI ตีความผิดหรือเติมตัวเลขเอง
function buildAiContext(now) {
    const weatherAt = weatherJob ? thaiTime(weatherJob.startedAt) : '-';
    const hotspotAt = hotspotJob ? thaiTime(hotspotJob.startedAt) : '-';

    let text = `ข้อมูลจากหน้าเว็บศูนย์ฯ ณ ${thaiDateTime(now)}\n`;
    text += `เกณฑ์: มาตรฐาน PM₂.₅ เฉลี่ย 24 ชม. ไม่เกิน 37.5 มคก./ลบ.ม. (ใช้ตั้งแต่ 1 มิ.ย. 2566) | ระดับ: 0–15 ดีมาก, 15.1–25 ดี, 25.1–37.5 ปานกลาง, 37.6–75 เริ่มมีผลกระทบต่อสุขภาพ, 75.1 ขึ้นไป มีผลกระทบต่อสุขภาพ\n`;
    text += `เป้าหมายปี ${TARGET_YEAR_BE}: จำนวนวันที่ PM₂.₅ เกินมาตรฐานต้องลดลงอย่างน้อย 5% จากปี ${BASE_YEAR_BE}\n`;
    text += `สภาพอากาศ ค่าฝุ่น Real-time และพยากรณ์ ดึงเมื่อ ${weatherAt} น. | จุดความร้อนดึงเมื่อ ${hotspotAt} น.`;
    if (!hotspotsFromNasa) text += ` (ดึงจาก NASA ไม่สำเร็จ ใช้ค่าจากชีตประจำวันแทน)`;
    text += `\n\n`;

    if (!globalDashboardData || globalDashboardData.length === 0) {
        return text + 'ไม่มีข้อมูลฝุ่นรายจังหวัด (โหลดจาก Google Sheets ไม่สำเร็จ)\n';
    }

    let totalHotspots = 0;
    const currentHour = now.getHours();

    TARGET_PROVINCES.forEach(province => {
        const row = globalDashboardData.find(r => r[1] === province);
        if (!row) {
            text += `* ${province}: ไม่มีข้อมูลในชีต\n\n`;
            return;
        }

        const pmVal = parseFloat(row[2]);
        const dayMinus1Num = parseFloat(row[4]);
        const dayMinus2Num = parseFloat(row[5]);
        const dayMinus3Num = parseFloat(row[6]);
        const dayMinus4Num = parseFloat(row[7]);
        const daysOverBase = parseFloat(row[8]) || 0;
        const daysOverTarget = parseFloat(row[9]) || 0;
        const hotspotAccBase = parseFloat(row[10]) || 0;
        const hotspotAccTarget = parseFloat(row[11]) || 0;
        const hotspot = parseInt(globalNasaHotspots[province]) || 0;
        totalHotspots += hotspot;

        const targetDays = Math.floor(daysOverBase * 0.95);
        const remainingDays = targetDays - daysOverTarget;
        let quotaText;
        if (remainingDays > 0) quotaText = `เหลือโควต้า ${remainingDays} วัน`;
        else if (remainingDays === 0) quotaText = `ไม่เหลือโควต้า (ชนเพดานเป้าหมายแล้ว)`;
        else quotaText = `เกินเป้าหมายแล้ว ${Math.abs(remainingDays)} วัน`;

        const w = globalWeatherData[province];
        const livePM = w ? w.currentPM25 : 'N/A';

        let policyAdv;
        if (pmVal >= 75.1) {
            policyAdv = "มาตรการสีแดง (มีผลกระทบ): งดกิจกรรมกลางแจ้ง พิจารณา WFH และปิดสถานศึกษา แจ้งเตือน SMS บังคับใช้กฎหมายกับโรงงานและรถควันดำอย่างเด็ดขาด ห้ามเผาในพื้นที่เกษตรและป่าไม้เด็ดขาด";
        } else if (pmVal >= 37.6) {
            policyAdv = "มาตรการสีส้ม (เริ่มมีผลกระทบ): แจ้งเตือนกลุ่มเสี่ยง ควบคุมการเผาทางการเกษตรอย่างเคร่งครัด ตั้งจุดตรวจจับควันดำ และเฝ้าระวังการเกิดไฟป่า";
        } else if (pmVal >= 25.1) {
            policyAdv = "เฝ้าระวัง: ให้กลุ่มเสี่ยงระวังป้องกันตนเอง สวมหน้ากากอนามัย และเตรียมยกระดับมาตรการหากค่าฝุ่นสูงขึ้น";
        } else if (!isNaN(pmVal)) {
            policyAdv = "สถานการณ์ปกติ: ดำเนินมาตรการเฝ้าระวังตามปกติ";
        } else {
            policyAdv = "ไม่มีค่ารอบ 07.00 น. จึงยังกำหนดระดับมาตรการไม่ได้";
        }

        let trendWarning = "";
        const currentPMNum = parseFloat(livePM) || pmVal;
        if (currentHour >= 16 && currentPMNum > pmVal && currentPMNum >= 37.6) {
            trendWarning = "ค่าฝุ่นช่วงบ่าย/เย็นสูงกว่าช่วงเช้า แสดงถึงการสะสมตัวเกินความสามารถในการระบายอากาศของวันนี้ หากกลางคืนเพดานอากาศ (BLH) ต่ำลง พรุ่งนี้เช้าสถานการณ์อาจแย่ลง ควรแจ้ง ทสจ. เตรียมประชาสัมพันธ์กลุ่มเสี่ยงล่วงหน้า";
        } else if (dayMinus2Num > 25.0 && dayMinus1Num > 25.0 && currentPMNum >= 30.0 && dayMinus2Num < dayMinus1Num && dayMinus1Num < currentPMNum) {
            trendWarning = "แนวโน้มฝุ่นสูงขึ้นต่อเนื่อง ควรพิจารณายกระดับมาตรการป้องกันก่อนเริ่มมีผลกระทบต่อสุขภาพ";
        }

        text += `* ${province}\n`;
        text += `  - PM₂.₅ รอบ 07.00 น. วันนี้: ${fmtNum(pmVal)} มคก./ลบ.ม. (${getAqiLevelName(pmVal)})\n`;
        text += `  - PM₂.₅ Real-time รายชั่วโมงล่าสุด (ดึงเมื่อ ${weatherAt} น.): ${fmtNum(livePM)} มคก./ลบ.ม.\n`;
        text += `  - PM₂.₅ รอบ 07.00 น. ย้อนหลัง 4 วันก่อน → 3 วันก่อน → 2 วันก่อน → เมื่อวาน: ${fmtNum(dayMinus4Num)} → ${fmtNum(dayMinus3Num)} → ${fmtNum(dayMinus2Num)} → ${fmtNum(dayMinus1Num)}\n`;
        text += `  - วันเกินมาตรฐาน: ปี ${BASE_YEAR_BE} รวม ${daysOverBase} วัน → เป้าหมายปี ${TARGET_YEAR_BE} ไม่เกิน ${targetDays} วัน | ปี ${TARGET_YEAR_BE} เกินแล้ว ${daysOverTarget} วัน | ${quotaText}\n`;
        text += `  - จุดความร้อน 24 ชม. ล่าสุด (NASA FIRMS VIIRS): ${hotspot} จุด | สะสมปี ${BASE_YEAR_BE}: ${hotspotAccBase} จุด | สะสมปี ${TARGET_YEAR_BE}: ${hotspotAccTarget} จุด\n`;

        if (w && !w.unavailable) {
            text += `  - สภาพอากาศ (กรมอุตุนิยมวิทยา ข้อมูล ${w.tmdTime}): ${w.cond} | อุณหภูมิ ${w.temp} °C | ความชื้น ${w.rh} % | โอกาสเกิดฝน ${w.rainChance} | ลมพัดมาจากทิศ${w.windDir} ความเร็ว ${w.windSpeed}\n`;
            text += `  - การระบายอากาศชั่วโมงปัจจุบัน (ณ ${weatherAt} น.): BLH ${w.blh} | VR ${w.vr}\n`;
        } else {
            text += `  - สภาพอากาศ: ไม่มีข้อมูลจากกรมอุตุนิยมวิทยาในรอบนี้\n`;
        }
        if (w && w.forecast && w.forecast.length) {
            text += `  - พยากรณ์รายวัน (Open-Meteo, ค่าประมาณ):\n`;
            w.forecast.forEach(line => { text += `      ${line}\n`; });
        } else {
            text += `  - พยากรณ์: ไม่มีข้อมูล\n`;
        }
        text += `  - คำแนะนำสุขภาพตามระดับ: ${getHealthAdvice(pmVal)}\n`;
        text += `  - มาตรการตามระดับวันนี้: ${policyAdv}\n`;
        if (trendWarning) text += `  - ข้อควรระวังจากระบบ: ${trendWarning}\n`;
        text += `\n`;
    });

    text += `รวมจุดความร้อน 24 ชม. ในพื้นที่ สคพ.11 (4 จังหวัด): ${totalHotspots} จุด\n`;
    return text;
}

function setAiButtonsDisabled(disabled) {
    ['btnAnalyze', 'btnFreeAdvice'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.disabled = disabled;
        el.classList.toggle('opacity-50', disabled);
        el.classList.toggle('cursor-not-allowed', disabled);
    });
}

async function runAiAnalysis(password, mode) {
    const resultDiv = document.getElementById('aiResult');
    
    resultDiv.style.display = 'block';
    resultDiv.classList.remove('hidden');

    // เปิดหน้าทิ้งไว้ข้ามวัน: ค่ารอบ 07.00 น. ในหน้าเป็นของเมื่อวาน ต้องโหลดหน้าใหม่ก่อน
    if (new Date().toDateString() !== PAGE_LOADED_DAY) {
        resultDiv.innerHTML = `
            <div class="text-center text-orange-700">
                ข้อมูลบนหน้านี้เป็นของวันก่อน กรุณาโหลดหน้าใหม่เพื่อดึงข้อมูลของวันนี้ก่อนให้ AI วิเคราะห์
                <button onclick="location.reload()" class="mt-3 block mx-auto bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg">🔄 โหลดหน้าใหม่</button>
            </div>`;
        return;
    }

    setAiButtonsDisabled(true);
    resultDiv.innerHTML = `<div class="text-center text-purple-600 animate-pulse"><i>กำลังอัปเดตข้อมูลล่าสุด...</i></div>`;
    await ensureFreshAiData();

    const loadingText = mode === 'line_draft' ? 'กำลังร่างข้อความสำหรับ LINE...' : 'กำลังวิเคราะห์ข้อมูลเชิงลึก...';
    resultDiv.innerHTML = `<div class="text-center text-purple-600 animate-pulse"><i>${loadingText} กรุณารอสักครู่ (อาจใช้เวลาถึง 1 นาที)</i></div>`;

    const analyzedAt = new Date();
    const contextData = buildAiContext(analyzedAt);

    try { 
        const response = await fetchAiWithBackoff(AI_ENDPOINT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({ 
                contextData: contextData, 
                password: password,
                mode: mode
            })
        });

        const data = await response.json();

        if (data.error === "Unauthorized") {
            resultDiv.style.display = 'none';
            resultDiv.classList.add('hidden');
            
            document.getElementById('passwordModal').classList.remove('hidden');
            document.getElementById('passwordError').classList.remove('hidden');
            document.getElementById('passwordError').innerText = 'รหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง';
            document.getElementById('aiPasswordInput').value = '';
            document.getElementById('aiPasswordInput').focus();
            return;
        }
        
        if (data.result) {
            // escape ก่อน แล้วค่อยแปลง **ตัวหนา** กับขึ้นบรรทัดใหม่ กันโค้ด HTML แปลกปลอมในคำตอบ
            const cleanText = escapeHtml(data.result)
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/\n/g, '<br>');

            const engine = data.model ? `Claude (${escapeHtml(data.model)})` : 'AI';
            resultDiv.innerHTML = cleanText + `
                <div class="mt-3 text-xs text-gray-500">ประมวลผลโดย ${engine} เมื่อ ${thaiTime(analyzedAt)} น. จากข้อมูลบนหน้านี้ · โปรดตรวจทานตัวเลขก่อนส่งต่อ</div>
                <button id="copyToLineBtn" class="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md flex justify-center items-center gap-2">
                    📋 คัดลอกข้อความไปที่ LINE
                </button>
            `;

            const clipboardText = data.result.replace(/\*\*(.*?)\*\*/g, '$1');

            const copyBtn = document.getElementById('copyToLineBtn');
            copyBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(clipboardText).then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '✅ คัดลอกข้อความสำเร็จแล้ว!';
                    copyBtn.classList.replace('bg-green-600', 'bg-blue-600');
                    copyBtn.classList.replace('hover:bg-green-700', 'hover:bg-blue-700');
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                        copyBtn.classList.replace('bg-blue-600', 'bg-green-600');
                        copyBtn.classList.replace('hover:bg-blue-700', 'hover:bg-green-700');
                    }, 2000);
                }).catch(err => {
                    console.error('คัดลอกไม่สำเร็จ:', err);
                    alert('เกิดข้อผิดพลาดในการคัดลอกข้อความ โปรดลองใหม่อีกครั้ง');
                });
            });

        } else {
            resultDiv.innerHTML = '<span class="text-red-600">เกิดข้อผิดพลาด: ' + escapeHtml(data.error || 'ไม่มีการส่งค่าผลลัพธ์กลับมา') + '</span>';
        }
    } catch (error) {
        console.error('Error fetching AI result:', error);
        resultDiv.innerHTML = '<span class="text-red-600">ไม่สามารถเชื่อมต่อระบบประมวลผล AI ได้ โปรดลองใหม่อีกครั้ง หรือตรวจสอบ URL ของ Apps Script</span>';
    } finally {
        setAiButtonsDisabled(false);
    }
}

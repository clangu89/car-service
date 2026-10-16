/**
 * ====================================================================
 * ระบบบริหารจัดการและดูแลรักษารถยนต์ของบริษัท (Corporate Car Service)
 * ไฟล์: Setup.gs - สคริปต์สร้างฐานข้อมูลและตารางเริ่มต้นอัตโนมัติ
 * ====================================================================
 */

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. ตารางข้อมูลรถยนต์ (Vehicles)
  setupSheet(ss, "Vehicles", [
    "vehicle_id", "license_plate", "brand", "model", "year", "type", 
    "department", "current_mileage", "tax_expiry_date", "act_expiry_date", 
    "insurance_expiry_date", "status", "image_url", "updated_at"
  ], [
    [
      "CAR-001", "1กข-9999 กทม.", "Toyota", "Hilux Revo 2.4 Entry", 2022, "กระบะ", 
      "ฝ่ายจัดส่งและคลังสินค้า", 45200, "2026-11-30", "2026-11-30", "2026-12-15", 
      "พร้อมใช้งาน", "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=600", new Date()
    ],
    [
      "CAR-002", "ฮภ-5544 กทม.", "Toyota", "Commuter 2.8 Van", 2021, "ตู้", 
      "ฝ่ายบริหารและบุคคล", 68500, "2026-10-25", "2026-10-25", "2026-11-10", 
      "พร้อมใช้งาน", "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600", new Date()
    ],
    [
      "CAR-003", "3ขค-1234 กทม.", "Honda", "City e:HEV RS", 2023, "เก๋ง", 
      "ฝ่ายขายและการตลาด", 28400, "2027-02-15", "2027-02-15", "2027-02-15", 
      "พร้อมใช้งาน", "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600", new Date()
    ],
    [
      "CAR-004", "2ฒณ-8877 กทม.", "Isuzu", "D-Max Spacecab 1.9", 2020, "กระบะ", 
      "ฝ่ายช่างและซ่อมบำรุง", 92100, "2026-10-18", "2026-10-18", "2026-11-05", 
      "ซ่อมบำรุง", "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600", new Date()
    ]
  ]);

  // 2. ตารางประวัติการซ่อมบำรุงและเช็คระยะ (ServiceLogs)
  setupSheet(ss, "ServiceLogs", [
    "log_id", "vehicle_id", "service_date", "odometer", "category", 
    "title", "description", "cost", "service_center", 
    "next_service_mileage", "next_service_date", "receipt_url", "recorded_by", "created_at"
  ], [
    [
      "SRV-202610-001", "CAR-001", "2026-09-10", 40000, "เปลี่ยนน้ำมันเครื่อง", 
      "เปลี่ยนน้ำมันเครื่องสังเคราะห์แท้ + ไส้กรองแท้", "เช็คระบบเบรกและเติมน้ำมันเบรก", 2450.00, 
      "ศูนย์โตโยต้า พระราม 9", 50000, "2027-03-10", "", "สมศักดิ์ ขับรถดี", new Date()
    ],
    [
      "SRV-202610-002", "CAR-002", "2026-08-20", 65000, "ยางรถยนต์", 
      "เปลี่ยนยาง Bridgestone Duravis 4 เส้น", "ถ่วงล้อและตั้งศูนย์หน้า-หลัง", 14800.00, 
      "บี-ควิก สาขาศรีนครินทร์", 105000, "2028-08-20", "", "ประสิทธิ์ มั่นคง", new Date()
    ],
    [
      "SRV-202610-003", "CAR-004", "2026-10-12", 92000, "ช่วงล่าง/เบรก", 
      "เปลี่ยนผ้าเบรกหน้า-หลัง และเจียรจาน", "เปลี่ยนลูกหมากปีกนกหน้าขวา", 6900.00, 
      "อู่เจริญชัย การช่าง", 110000, "2027-04-12", "", "วิชัย ซ่อมเก่ง", new Date()
    ]
  ]);

  // 3. ตารางบันทึกการเติมน้ำมัน (FuelLogs)
  setupSheet(ss, "FuelLogs", [
    "fuel_id", "vehicle_id", "fuel_date", "odometer", "liters", 
    "total_amount", "price_per_liter", "gas_station", "receipt_url", "recorded_by", "created_at"
  ], [
    [
      "FUEL-202610-001", "CAR-001", "2026-10-14", 45200, 52.40, 
      1750.00, 33.40, "ปตท. สาขาบางนา", "", "สมศักดิ์ ขับรถดี", new Date()
    ],
    [
      "FUEL-202610-002", "CAR-003", "2026-10-15", 28400, 35.00, 
      1380.00, 39.43, "บางจาก พระราม 4", "", "นิตยา สดใส", new Date()
    ]
  ]);

  // 4. ตารางบันทึกการขอใช้รถ/เบิกรถ (Bookings)
  setupSheet(ss, "Bookings", [
    "booking_id", "vehicle_id", "user_name", "department", "destination", 
    "purpose", "passenger_count", "start_datetime", "end_datetime", 
    "status", "start_odometer", "end_odometer", "approved_by", "created_at"
  ], [
    [
      "BKG-202610-001", "CAR-003", "นิตยา สดใส", "ฝ่ายขาย", "จ.ชลบุรี (นิคมอมตะซิตี้)", 
      "พบลูกค้าเพื่อเสนอราคาโครงการใหม่", 3, "2026-10-17 08:30", "2026-10-17 18:00", 
      "อนุมัติแล้ว", 28400, 0, "ผู้จัดการฝ่ายยานพาหนะ", new Date()
    ],
    [
      "BKG-202610-002", "CAR-002", "สมชาย ใจเย็น", "ฝ่ายบุคคล", "ศูนย์ประชุมแห่งชาติสิริกิติ์", 
      "รับส่งวิทยากรและพนักงานสัมมนาประจำปี", 10, "2026-10-19 07:00", "2026-10-19 19:30", 
      "รออนุมัติ", 68500, 0, "", new Date()
    ]
  ]);

  // 5. ตารางผู้ใช้งาน / พนักงาน (Users)
  setupSheet(ss, "Users", [
    "user_id", "username", "password", "fullname", "department", "phone", "role", "status"
  ], [
    ["USR-001", "admin", "admin1234", "ผู้ดูแลระบบยานพาหนะ", "ฝ่ายบริหารยานพาหนะ", "081-999-8888", "admin", "active"],
    ["USR-002", "driver1", "driver1234", "นายสมศักดิ์ ขับรถดี", "ฝ่ายจัดส่ง", "082-111-2222", "driver", "active"],
    ["USR-003", "staff1", "staff1234", "นางสาวนิตยา สดใส", "ฝ่ายขาย", "083-333-4444", "staff", "active"]
  ]);

  // 6. ตารางการตั้งค่าระบบ (Settings)
  setupSheet(ss, "Settings", [
    "key", "value", "description"
  ], [
    ["TELEGRAM_BOT_TOKEN", "", "Bot Token ที่ได้จาก @BotFather บน Telegram"],
    ["TELEGRAM_CHAT_ID", "", "Chat ID หรือ Group ID สำหรับรับการแจ้งเตือน"],
    ["ALERT_DAYS_BEFORE", "30", "จำนวนวันเตือนล่วงหน้าก่อนภาษี/พ.ร.บ./ประกันภัยหมดอายุ"],
    ["ALERT_MILEAGE_BEFORE", "1000", "ระยะทางเตือนล่วงหน้าก่อนถึงรอบเช็คระยะ (กิโลเมตร)"],
    ["DRIVE_FOLDER_NAME", "Car_Service_Uploads", "ชื่อโฟลเดอร์ใน Google Drive สำหรับเก็บรูปภาพและใบเสร็จ"],
    ["COMPANY_NAME", "บริษัท ตัวอย่าง จำกัด", "ชื่อบริษัทแสดงบนหัวรายงาน"]
  ]);

  // ติดตั้ง Trigger รันทุกวันเวลา 08:00 - 09:00 น. เพื่อส่ง Telegram Alert
  setupDailyTrigger();

  Logger.log("✅ ติดตั้งฐานข้อมูล Google Sheets และตารางทั้งหมดสำเร็จแล้ว!");
}

/**
 * สร้างหรือรีเซ็ต Sheet ตามชื่อและคอลัมน์ที่กำหนด
 */
function setupSheet(ss, sheetName, headers, initialData) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  // ถ้ายังไม่มีข้อมูล หรือมีแค่บรรทัดเดียว ให้ใส่หัวตาราง
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    // ตกแต่งหัวตาราง
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1E3A8A"); // Deep Navy
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    
    // ใส่ข้อมูลเริ่มต้น
    if (initialData && initialData.length > 0) {
      sheet.getRange(2, 1, initialData.length, headers.length).setValues(initialData);
    }
  }
}

/**
 * ติดตั้ง Time-Driven Trigger ตรวจสอบและส่ง Telegram Alert ทุกเช้า
 */
function setupDailyTrigger() {
  // ลบ trigger เดิมของฟังก์ชันนี้ก่อน
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "checkAndSendDailyAlerts") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // สร้าง Trigger ใหม่ ทุกวันเวลา 08:00 น.
  ScriptApp.newTrigger("checkAndSendDailyAlerts")
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
  
  Logger.log("✅ ติดตั้ง Daily Alert Trigger ทุกวัน 08:00 น. สำเร็จ");
}

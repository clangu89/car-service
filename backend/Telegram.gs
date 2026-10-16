/**
 * ====================================================================
 * ระบบบริหารจัดการและดูแลรักษารถยนต์ของบริษัท (Corporate Car Service)
 * ไฟล์: Telegram.gs - โมดูลส่งการแจ้งเตือนผ่าน Telegram Bot API
 * ====================================================================
 */

/**
 * ดึงค่าคอนฟิกจากแท็บ Settings
 */
function getSystemSetting(key) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Settings");
  if (!sheet) return "";
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      return data[i][1];
    }
  }
  return "";
}

/**
 * ส่งข้อความผ่าน Telegram Bot API
 */
function sendTelegramMessage(text, customToken, customChatId) {
  try {
    var botToken = customToken || getSystemSetting("TELEGRAM_BOT_TOKEN");
    var chatId = customChatId || getSystemSetting("TELEGRAM_CHAT_ID");
    
    if (!botToken || !chatId) {
      Logger.log("⚠️ ข้ามการส่ง Telegram: ยังไม่ได้ตั้งค่า TELEGRAM_BOT_TOKEN หรือ TELEGRAM_CHAT_ID");
      return { success: false, message: "Telegram Bot Token or Chat ID is not configured" };
    }
    
    var url = "https://api.telegram.org/bot" + botToken.trim() + "/sendMessage";
    var payload = {
      chat_id: String(chatId).trim(),
      text: text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    };
    
    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(url, options);
    var respCode = response.getResponseCode();
    var respText = response.getContentText();
    
    if (respCode === 200) {
      Logger.log("✅ ส่ง Telegram สำเร็จ: " + respText);
      return { success: true, response: JSON.parse(respText) };
    } else {
      Logger.log("❌ ส่ง Telegram ล้มเหลว (Code " + respCode + "): " + respText);
      return { success: false, error: respText };
    }
  } catch (err) {
    Logger.log("❌ เกิดข้อผิดพลาดในการส่ง Telegram: " + err.toString());
    return { success: false, error: err.toString() };
  }
}

/**
 * ทดสอบการเชื่อมต่อ Telegram Bot จากหน้าเว็บ
 */
function testTelegramConnection(botToken, chatId) {
  var message = "<b>🚗 Corporate Car Service</b>\n" +
                "━━━━━━━━━━━━━━━━━━\n" +
                "✅ <b>ทดสอบการเชื่อมต่อสำเร็จ!</b>\n" +
                "ระบบแจ้งเตือน Telegram Bot พร้อมใช้งานสำหรับระบบดูแลรักษารถยนต์บริษัทแล้วครับ\n\n" +
                "⏰ เวลาทดสอบ: " + Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");
  
  return sendTelegramMessage(message, botToken, chatId);
}

/**
 * ตรวจสอบและส่งรายงานแจ้งเตือนประจำวัน (ตั้งรันผ่าน Trigger ทุกเช้า)
 */
function checkAndSendDailyAlerts() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var vSheet = ss.getSheetByName("Vehicles");
  if (!vSheet) return;
  
  var vData = vSheet.getDataRange().getValues();
  if (vData.length <= 1) return;
  
  var alertDays = parseInt(getSystemSetting("ALERT_DAYS_BEFORE")) || 30;
  var alertMileage = parseInt(getSystemSetting("ALERT_MILEAGE_BEFORE")) || 1000;
  var companyName = getSystemSetting("COMPANY_NAME") || "Corporate Car Service";
  
  var now = new Date();
  var todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var oneDayMs = 24 * 60 * 60 * 1000;
  
  var urgentAlerts = [];
  var warningAlerts = [];
  
  for (var i = 1; i < vData.length; i++) {
    var row = vData[i];
    var carId = row[0];
    var plate = row[1];
    var model = row[2] + " " + row[3];
    var currentMileage = Number(row[7]) || 0;
    var taxDate = row[8] ? new Date(row[8]) : null;
    var actDate = row[9] ? new Date(row[9]) : null;
    var insDate = row[10] ? new Date(row[10]) : null;
    var status = row[11];
    
    if (status === "ปลดระวาง") continue;
    
    // ตรวจสอบภาษีประจำปี
    if (taxDate && !isNaN(taxDate.getTime())) {
      var diffDays = Math.ceil((taxDate.getTime() - todayMidnight) / oneDayMs);
      if (diffDays < 0) {
        urgentAlerts.push("🚨 <b>ภาษีขาดแล้ว:</b> " + plate + " (" + model + ") ขาดมา " + Math.abs(diffDays) + " วัน");
      } else if (diffDays <= alertDays) {
        warningAlerts.push("⚠️ <b>ภาษีใกล้หมดอายุ:</b> " + plate + " เหลืออีก <b>" + diffDays + " วัน</b> (หมด " + formatDateThai(taxDate) + ")");
      }
    }
    
    // ตรวจสอบ พ.ร.บ.
    if (actDate && !isNaN(actDate.getTime())) {
      var diffDays = Math.ceil((actDate.getTime() - todayMidnight) / oneDayMs);
      if (diffDays < 0) {
        urgentAlerts.push("🚨 <b>พ.ร.บ. ขาดแล้ว:</b> " + plate + " (" + model + ") ขาดมา " + Math.abs(diffDays) + " วัน");
      } else if (diffDays <= alertDays) {
        warningAlerts.push("⚠️ <b>พ.ร.บ. ใกล้หมดอายุ:</b> " + plate + " เหลืออีก <b>" + diffDays + " วัน</b> (หมด " + formatDateThai(actDate) + ")");
      }
    }
    
    // ตรวจสอบประกันภัย
    if (insDate && !isNaN(insDate.getTime())) {
      var diffDays = Math.ceil((insDate.getTime() - todayMidnight) / oneDayMs);
      if (diffDays < 0) {
        urgentAlerts.push("🚨 <b>ประกันภัยขาด:</b> " + plate + " (" + model + ") ขาดมา " + Math.abs(diffDays) + " วัน");
      } else if (diffDays <= alertDays) {
        warningAlerts.push("⚠️ <b>ประกันภัยใกล้หมดอายุ:</b> " + plate + " เหลืออีก <b>" + diffDays + " วัน</b> (หมด " + formatDateThai(insDate) + ")");
      }
    }
  }
  
  // ตรวจสอบรายการที่ต้องเข้าเช็คระยะจาก ServiceLogs
  var sSheet = ss.getSheetByName("ServiceLogs");
  if (sSheet) {
    var sData = sSheet.getDataRange().getValues();
    // หา log ล่าสุดของแต่ละคัน
    var latestLogPerCar = {};
    for (var j = 1; j < sData.length; j++) {
      var sCarId = sData[j][1];
      var nextMileage = Number(sData[j][9]) || 0;
      var nextDate = sData[j][10] ? new Date(sData[j][10]) : null;
      if (!latestLogPerCar[sCarId] || sData[j][13] > latestLogPerCar[sCarId].created_at) {
        latestLogPerCar[sCarId] = { nextMileage: nextMileage, nextDate: nextDate, title: sData[j][5] };
      }
    }
    
    // เทียบกับ current_mileage
    for (var k = 1; k < vData.length; k++) {
      var cId = vData[k][0];
      var cPlate = vData[k][1];
      var cModel = vData[k][2] + " " + vData[k][3];
      var cMileage = Number(vData[k][7]) || 0;
      var latest = latestLogPerCar[cId];
      
      if (latest && latest.nextMileage > 0) {
        var remainKm = latest.nextMileage - cMileage;
        if (remainKm <= 0) {
          urgentAlerts.push("🔧 <b>เลยรอบเช็คระยะแล้ว:</b> " + cPlate + " (" + cModel + ") ปัจจุบัน " + formatNumber(cMileage) + " กม. (กำหนด " + formatNumber(latest.nextMileage) + " กม.)");
        } else if (remainKm <= alertMileage) {
          warningAlerts.push("🔔 <b>ใกล้ครบระยะเช็คบำรุง:</b> " + cPlate + " อีก <b>" + formatNumber(remainKm) + " กม.</b> จะถึงรอบ " + formatNumber(latest.nextMileage) + " กม.");
        }
      }
    }
  }
  
  // ถ้าไม่มีการแจ้งเตือนใดๆ เลย ไม่ต้องยิงรบกวน (หรือยิงสรุปสุขภาพรถปกติ)
  if (urgentAlerts.length === 0 && warningAlerts.length === 0) {
    Logger.log("ℹ️ ไม่พบรายการต้องแจ้งเตือนวันนี้ ยานพาหนะทุกคันอยู่ในเกณฑ์ปกติ");
    return;
  }
  
  var msg = "<b>🚗 สรุปการแจ้งเตือนยานพาหนะประจำวัน</b>\n" +
            "🏢 " + companyName + "\n" +
            "📅 วันที่: " + Utilities.formatDate(now, "Asia/Bangkok", "dd/MM/yyyy HH:mm") + "\n" +
            "━━━━━━━━━━━━━━━━━━\n";
            
  if (urgentAlerts.length > 0) {
    msg += "\n<b>🔴 รายการเร่งด่วนที่ต้องดำเนินการทันที:</b>\n" + urgentAlerts.join("\n") + "\n";
  }
  
  if (warningAlerts.length > 0) {
    msg += "\n<b>🟡 รายการที่ต้องเตรียมการล่วงหน้า (ใน 30 วัน):</b>\n" + warningAlerts.join("\n") + "\n";
  }
  
  msg += "\n━━━━━━━━━━━━━━━━━━\n" +
         "💡 <i>โปรดติดต่อฝ่ายดูแลยานพาหนะเพื่อต่ออายุและเข้าตรวจเช็ค</i>";
         
  sendTelegramMessage(msg);
}

/**
 * ส่งแจ้งเตือนเมื่อมีการส่งคำขอจองรถใหม่
 */
function sendBookingNotification(booking, carPlate, carModel) {
  var msg = "<b>📋 มีคำขอใช้รถบริษัทใหม่!</b>\n" +
            "━━━━━━━━━━━━━━━━━━\n" +
            "🚗 <b>รถ:</b> " + carPlate + " (" + carModel + ")\n" +
            "👤 <b>ผู้ขอ:</b> " + booking.user_name + " (" + (booking.department || "ไม่ระบุ") + ")\n" +
            "🎯 <b>จุดหมาย:</b> " + booking.destination + "\n" +
            "📝 <b>วัตถุประสงค์:</b> " + booking.purpose + "\n" +
            "👥 <b>ผู้โดยสาร:</b> " + (booking.passenger_count || 1) + " คน\n" +
            "📅 <b>เริ่ม:</b> " + booking.start_datetime + "\n" +
            "🏁 <b>สิ้นสุด:</b> " + booking.end_datetime + "\n" +
            "📌 <b>สถานะ:</b> ⏳ รออนุมัติ\n" +
            "━━━━━━━━━━━━━━━━━━\n" +
            "👉 <i>โปรดเข้าสู่ระบบเพื่อตรวจสอบและอนุมัติการใช้รถ</i>";
            
  return sendTelegramMessage(msg);
}

/**
 * ส่งแจ้งเตือนเมื่อมีการบันทึกงานซ่อมบำรุงใหม่
 */
function sendServiceLogNotification(log, carPlate, carModel) {
  var msg = "<b>🔧 บันทึกการซ่อมบำรุง/เช็คระยะ</b>\n" +
            "━━━━━━━━━━━━━━━━━━\n" +
            "🚗 <b>รถ:</b> " + carPlate + " (" + carModel + ")\n" +
            "🛠️ <b>หมวดหมู่:</b> " + log.category + "\n" +
            "📝 <b>รายการ:</b> " + log.title + "\n" +
            "💰 <b>ค่าใช้จ่าย:</b> " + formatNumber(log.cost) + " บาท\n" +
            "🛣️ <b>เลขไมล์:</b> " + formatNumber(log.odometer) + " กม.\n" +
            "🏢 <b>ศูนย์/อู่:</b> " + (log.service_center || "-") + "\n" +
            "👤 <b>ผู้บันทึก:</b> " + (log.recorded_by || "พนักงาน") + "\n" +
            "━━━━━━━━━━━━━━━━━━\n" +
            "🔍 <i>บันทึกเข้าประวัติยานพาหนะเรียบร้อยแล้ว</i>";
            
  return sendTelegramMessage(msg);
}

/**
 * Helper Formatters
 */
function formatDateThai(date) {
  if (!date || isNaN(date.getTime())) return "-";
  return Utilities.formatDate(date, "Asia/Bangkok", "dd/MM/yyyy");
}

function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

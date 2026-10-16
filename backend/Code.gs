/**
 * ====================================================================
 * ระบบบริหารจัดการและดูแลรักษารถยนต์ของบริษัท (Corporate Car Service)
 * ไฟล์: Code.gs - Web App REST API Router (doGet, doPost, File Upload)
 * ====================================================================
 */

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    var action = params.action || "ping";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var result = { success: false, action: action };

    switch (action) {
      case "ping":
        result = { 
          success: true, 
          message: "Corporate Car Service API is running!", 
          timestamp: new Date().toISOString() 
        };
        break;

      case "getVehicles":
        result = { success: true, data: getAllVehicles(ss) };
        break;

      case "getServiceLogs":
        var vehicleId = params.vehicle_id || null;
        result = { success: true, data: getServiceLogs(ss, vehicleId) };
        break;

      case "getFuelLogs":
        var vehicleId = params.vehicle_id || null;
        result = { success: true, data: getFuelLogs(ss, vehicleId) };
        break;

      case "getBookings":
        result = { success: true, data: getBookings(ss) };
        break;

      case "getUsers":
        result = { success: true, data: getUsers(ss) };
        break;

      case "getDashboard":
        result = { success: true, data: getDashboardData(ss) };
        break;

      case "getSettings":
        result = { success: true, data: getSettingsData(ss) };
        break;

      case "checkAlerts":
        checkAndSendDailyAlerts();
        result = { success: true, message: "Daily alert check executed" };
        break;

      default:
        result = { success: false, error: "Unknown GET action: " + action };
        break;
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    var content = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    var payload = JSON.parse(content);
    var action = payload.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var result = { success: false, action: action };

    switch (action) {
      case "login":
        result = handleLogin(ss, payload);
        break;

      case "saveVehicle":
        result = handleSaveVehicle(ss, payload.data);
        break;

      case "deleteVehicle":
        result = handleDeleteVehicle(ss, payload.vehicle_id);
        break;

      case "saveServiceLog":
        result = handleSaveServiceLog(ss, payload.data);
        break;

      case "saveFuelLog":
        result = handleSaveFuelLog(ss, payload.data);
        break;

      case "saveBooking":
        result = handleSaveBooking(ss, payload.data);
        break;

      case "updateBookingStatus":
        result = handleUpdateBookingStatus(ss, payload);
        break;

      case "uploadFile":
        result = handleFileUpload(payload);
        break;

      case "testTelegram":
        result = testTelegramConnection(payload.bot_token, payload.chat_id);
        break;

      case "saveSettings":
        result = handleSaveSettings(ss, payload.settings);
        break;

      default:
        result = { success: false, error: "Unknown POST action: " + action };
        break;
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Helper JSON Response Output
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ====================================================================
// DATA RETRIEVAL (GET) HANDLERS
// ====================================================================

function getAllVehicles(ss) {
  var sheet = ss.getSheetByName("Vehicles");
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[0]) continue;
    var obj = {};
    for (var h = 0; h < headers.length; h++) {
      var val = row[h];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, "Asia/Bangkok", "yyyy-MM-dd");
      }
      obj[headers[h]] = val;
    }
    list.push(obj);
  }
  return list;
}

function getServiceLogs(ss, vehicleId) {
  var sheet = ss.getSheetByName("ServiceLogs");
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[0]) continue;
    if (vehicleId && row[1] !== vehicleId) continue;
    
    var obj = {};
    for (var h = 0; h < headers.length; h++) {
      var val = row[h];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, "Asia/Bangkok", "yyyy-MM-dd");
      }
      obj[headers[h]] = val;
    }
    list.push(obj);
  }
  // จัดเรียงวันที่ล่าสุดก่อน
  list.sort(function(a, b) {
    return new Date(b.service_date) - new Date(a.service_date);
  });
  return list;
}

function getFuelLogs(ss, vehicleId) {
  var sheet = ss.getSheetByName("FuelLogs");
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[0]) continue;
    if (vehicleId && row[1] !== vehicleId) continue;

    var obj = {};
    for (var h = 0; h < headers.length; h++) {
      var val = row[h];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, "Asia/Bangkok", "yyyy-MM-dd");
      }
      obj[headers[h]] = val;
    }
    list.push(obj);
  }
  list.sort(function(a, b) {
    return new Date(b.fuel_date) - new Date(a.fuel_date);
  });
  return list;
}

function getBookings(ss) {
  var sheet = ss.getSheetByName("Bookings");
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var headers = rows[0];
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[0]) continue;
    var obj = {};
    for (var h = 0; h < headers.length; h++) {
      var val = row[h];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, "Asia/Bangkok", "yyyy-MM-dd HH:mm");
      }
      obj[headers[h]] = val;
    }
    list.push(obj);
  }
  list.sort(function(a, b) {
    return new Date(b.start_datetime) - new Date(a.start_datetime);
  });
  return list;
}

function getUsers(ss) {
  var sheet = ss.getSheetByName("Users");
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[0]) continue;
    list.push({
      user_id: row[0],
      username: row[1],
      fullname: row[3],
      department: row[4],
      phone: row[5],
      role: row[6],
      status: row[7]
    });
  }
  return list;
}

function getSettingsData(ss) {
  var sheet = ss.getSheetByName("Settings");
  if (!sheet) return {};
  var rows = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < rows.length; i++) {
    var key = rows[i][0];
    var val = rows[i][1];
    if (key) {
      settings[key] = val;
    }
  }
  return settings;
}

function getDashboardData(ss) {
  var vehicles = getAllVehicles(ss);
  var serviceLogs = getServiceLogs(ss);
  var fuelLogs = getFuelLogs(ss);
  var bookings = getBookings(ss);

  var totalFleet = vehicles.length;
  var readyCount = 0;
  var maintenanceCount = 0;
  var retiredCount = 0;

  var now = new Date();
  var todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var alertDays = 30;
  var urgentAlerts = [];
  var warningAlerts = [];

  for (var i = 0; i < vehicles.length; i++) {
    var v = vehicles[i];
    if (v.status === "พร้อมใช้งาน") readyCount++;
    else if (v.status === "ซ่อมบำรุง") maintenanceCount++;
    else if (v.status === "ปลดระวาง") retiredCount++;

    if (v.status !== "ปลดระวาง") {
      // Check Tax
      checkExpiryItem(v.tax_expiry_date, todayMidnight, alertDays, v.license_plate, "ภาษีประจำปี", urgentAlerts, warningAlerts);
      // Check Act
      checkExpiryItem(v.act_expiry_date, todayMidnight, alertDays, v.license_plate, "พ.ร.บ.", urgentAlerts, warningAlerts);
      // Check Insurance
      checkExpiryItem(v.insurance_expiry_date, todayMidnight, alertDays, v.license_plate, "ประกันภัย", urgentAlerts, warningAlerts);
    }
  }

  // Monthly Expenses (Service & Fuel)
  var totalServiceCost = 0;
  for (var s = 0; s < serviceLogs.length; s++) {
    totalServiceCost += Number(serviceLogs[s].cost) || 0;
  }

  var totalFuelCost = 0;
  for (var f = 0; f < fuelLogs.length; f++) {
    totalFuelCost += Number(fuelLogs[f].total_amount) || 0;
  }

  // Active bookings today
  var todayStr = Utilities.formatDate(now, "Asia/Bangkok", "yyyy-MM-dd");
  var activeBookingsToday = bookings.filter(function(b) {
    return b.status === "อนุมัติแล้ว" && String(b.start_datetime).indexOf(todayStr) === 0;
  }).length;

  var pendingBookings = bookings.filter(function(b) {
    return b.status === "รออนุมัติ";
  }).length;

  return {
    summary: {
      totalVehicles: totalFleet,
      readyVehicles: readyCount,
      maintenanceVehicles: maintenanceCount,
      retiredVehicles: retiredCount,
      activeBookingsToday: activeBookingsToday,
      pendingBookings: pendingBookings,
      totalServiceCost: totalServiceCost,
      totalFuelCost: totalFuelCost,
      totalFleetCost: totalServiceCost + totalFuelCost
    },
    alerts: {
      urgent: urgentAlerts,
      warning: warningAlerts
    },
    recentServiceLogs: serviceLogs.slice(0, 5),
    recentBookings: bookings.slice(0, 5)
  };
}

function checkExpiryItem(dateStr, todayMidnight, alertDays, plate, label, urgentArr, warningArr) {
  if (!dateStr) return;
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return;
  var diffDays = Math.ceil((d.getTime() - todayMidnight) / (24 * 60 * 60 * 1000));
  if (diffDays < 0) {
    urgentArr.push({ plate: plate, label: label, days: Math.abs(diffDays), status: "expired", expiryDate: dateStr });
  } else if (diffDays <= alertDays) {
    warningArr.push({ plate: plate, label: label, days: diffDays, status: "expiring_soon", expiryDate: dateStr });
  }
}

// ====================================================================
// DATA MODIFICATION (POST) HANDLERS
// ====================================================================

function handleLogin(ss, payload) {
  var username = String(payload.username || "").trim().toLowerCase();
  var password = String(payload.password || "").trim();

  var sheet = ss.getSheetByName("Users");
  if (!sheet) return { success: false, message: "Users table not found" };

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    var uName = String(rows[i][1]).trim().toLowerCase();
    var uPass = String(rows[i][2]).trim();
    var status = String(rows[i][7]).trim();

    if (uName === username && uPass === password) {
      if (status !== "active") {
        return { success: false, message: "บัญชีผู้ใช้นี้ถูกระงับการใช้งาน" };
      }

      var userObj = {
        user_id: rows[i][0],
        username: rows[i][1],
        fullname: rows[i][3],
        department: rows[i][4],
        phone: rows[i][5],
        role: rows[i][6],
        token: Utilities.base64Encode(username + ":" + new Date().getTime())
      };

      return { success: true, message: "เข้าสู่ระบบสำเร็จ", user: userObj };
    }
  }

  return { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
}

function handleSaveVehicle(ss, data) {
  var sheet = ss.getSheetByName("Vehicles");
  if (!sheet) return { success: false, message: "Vehicles table not found" };

  var rows = sheet.getDataRange().getValues();
  var vehicleId = data.vehicle_id;
  var rowIndex = -1;

  if (vehicleId) {
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === vehicleId) {
        rowIndex = i + 1;
        break;
      }
    }
  }

  var now = new Date();
  if (rowIndex === -1) {
    // เพิ่มคันใหม่
    vehicleId = "CAR-" + Utilities.formatDate(now, "Asia/Bangkok", "yyyyMM") + "-" + ("00" + rows.length).slice(-3);
    var newRow = [
      vehicleId,
      data.license_plate || "",
      data.brand || "",
      data.model || "",
      data.year || new Date().getFullYear(),
      data.type || "เก๋ง",
      data.department || "",
      Number(data.current_mileage) || 0,
      data.tax_expiry_date || "",
      data.act_expiry_date || "",
      data.insurance_expiry_date || "",
      data.status || "พร้อมใช้งาน",
      data.image_url || "",
      now
    ];
    sheet.appendRow(newRow);
    return { success: true, message: "เพิ่มข้อมูลรถยนต์สำเร็จ", vehicle_id: vehicleId };
  } else {
    // แก้ไขข้อมูลเดิม
    sheet.getRange(rowIndex, 2).setValue(data.license_plate || "");
    sheet.getRange(rowIndex, 3).setValue(data.brand || "");
    sheet.getRange(rowIndex, 4).setValue(data.model || "");
    sheet.getRange(rowIndex, 5).setValue(data.year || "");
    sheet.getRange(rowIndex, 6).setValue(data.type || "");
    sheet.getRange(rowIndex, 7).setValue(data.department || "");
    if (data.current_mileage !== undefined) {
      sheet.getRange(rowIndex, 8).setValue(Number(data.current_mileage) || 0);
    }
    sheet.getRange(rowIndex, 9).setValue(data.tax_expiry_date || "");
    sheet.getRange(rowIndex, 10).setValue(data.act_expiry_date || "");
    sheet.getRange(rowIndex, 11).setValue(data.insurance_expiry_date || "");
    sheet.getRange(rowIndex, 12).setValue(data.status || "พร้อมใช้งาน");
    if (data.image_url) {
      sheet.getRange(rowIndex, 13).setValue(data.image_url);
    }
    sheet.getRange(rowIndex, 14).setValue(now);
    return { success: true, message: "อัปเดตข้อมูลรถยนต์เรียบร้อย", vehicle_id: vehicleId };
  }
}

function handleDeleteVehicle(ss, vehicleId) {
  var sheet = ss.getSheetByName("Vehicles");
  if (!sheet) return { success: false, message: "Vehicles sheet not found" };

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === vehicleId) {
      // Soft delete: เปลี่ยนสถานะเป็นปลดระวาง
      sheet.getRange(i + 1, 12).setValue("ปลดระวาง");
      sheet.getRange(i + 1, 14).setValue(new Date());
      return { success: true, message: "ปลดระวางยานพาหนะเรียบร้อยแล้ว" };
    }
  }
  return { success: false, message: "ไม่พบรหัสรถยนต์ที่ระบุ" };
}

function handleSaveServiceLog(ss, data) {
  var sheet = ss.getSheetByName("ServiceLogs");
  if (!sheet) return { success: false, message: "ServiceLogs table not found" };

  var now = new Date();
  var logId = "SRV-" + Utilities.formatDate(now, "Asia/Bangkok", "yyyyMMdd-HHmmss");
  var newRow = [
    logId,
    data.vehicle_id,
    data.service_date || Utilities.formatDate(now, "Asia/Bangkok", "yyyy-MM-dd"),
    Number(data.odometer) || 0,
    data.category || "ทั่วไป",
    data.title || "",
    data.description || "",
    Number(data.cost) || 0,
    data.service_center || "",
    Number(data.next_service_mileage) || 0,
    data.next_service_date || "",
    data.receipt_url || "",
    data.recorded_by || "พนักงาน",
    now
  ];

  sheet.appendRow(newRow);

  // อัปเดตเลขไมล์ปัจจุบันของรถยนต์ หากเลขไมล์งานซ่อมสูงกว่าเลขไมล์เดิม
  updateVehicleMileage(ss, data.vehicle_id, Number(data.odometer) || 0);

  // ส่งแจ้งเตือน Telegram
  try {
    var vInfo = getVehicleBasicInfo(ss, data.vehicle_id);
    sendServiceLogNotification(data, vInfo.plate, vInfo.model);
  } catch (err) {
    Logger.log("Telegram notification error: " + err.toString());
  }

  return { success: true, message: "บันทึกข้อมูลการซ่อมบำรุงสำเร็จ", log_id: logId };
}

function handleSaveFuelLog(ss, data) {
  var sheet = ss.getSheetByName("FuelLogs");
  if (!sheet) return { success: false, message: "FuelLogs table not found" };

  var now = new Date();
  var fuelId = "FUEL-" + Utilities.formatDate(now, "Asia/Bangkok", "yyyyMMdd-HHmmss");
  var totalAmount = Number(data.total_amount) || 0;
  var liters = Number(data.liters) || 0;
  var pricePerLiter = liters > 0 ? (totalAmount / liters).toFixed(2) : 0;

  var newRow = [
    fuelId,
    data.vehicle_id,
    data.fuel_date || Utilities.formatDate(now, "Asia/Bangkok", "yyyy-MM-dd"),
    Number(data.odometer) || 0,
    liters,
    totalAmount,
    pricePerLiter,
    data.gas_station || "",
    data.receipt_url || "",
    data.recorded_by || "พนักงาน",
    now
  ];

  sheet.appendRow(newRow);

  // อัปเดตเลขไมล์รถ
  updateVehicleMileage(ss, data.vehicle_id, Number(data.odometer) || 0);

  return { success: true, message: "บันทึกประวัติการเติมน้ำมันสำเร็จ", fuel_id: fuelId };
}

function handleSaveBooking(ss, data) {
  var sheet = ss.getSheetByName("Bookings");
  if (!sheet) return { success: false, message: "Bookings table not found" };

  var now = new Date();
  var bookingId = "BKG-" + Utilities.formatDate(now, "Asia/Bangkok", "yyyyMMdd-HHmmss");
  
  var vInfo = getVehicleBasicInfo(ss, data.vehicle_id);

  var newRow = [
    bookingId,
    data.vehicle_id,
    data.user_name || "",
    data.department || "",
    data.destination || "",
    data.purpose || "",
    Number(data.passenger_count) || 1,
    data.start_datetime || "",
    data.end_datetime || "",
    "รออนุมัติ",
    Number(vInfo.mileage) || 0,
    0,
    "",
    now
  ];

  sheet.appendRow(newRow);

  // ส่งแจ้งเตือน Telegram ถึง Admin
  try {
    sendBookingNotification(data, vInfo.plate, vInfo.model);
  } catch (err) {
    Logger.log("Telegram booking alert error: " + err.toString());
  }

  return { success: true, message: "ส่งคำขอจองรถบริษัทเรียบร้อยแล้ว รอการอนุมัติ", booking_id: bookingId };
}

function handleUpdateBookingStatus(ss, payload) {
  var sheet = ss.getSheetByName("Bookings");
  if (!sheet) return { success: false, message: "Bookings table not found" };

  var bookingId = payload.booking_id;
  var newStatus = payload.status; // อนุมัติแล้ว, คืนรถแล้ว, ยกเลิก
  var approvedBy = payload.approved_by || "";
  var endOdometer = Number(payload.end_odometer) || 0;

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === bookingId) {
      var rowIdx = i + 1;
      var vId = rows[i][1];
      
      sheet.getRange(rowIdx, 10).setValue(newStatus);
      if (approvedBy) {
        sheet.getRange(rowIdx, 13).setValue(approvedBy);
      }
      if (endOdometer > 0) {
        sheet.getRange(rowIdx, 12).setValue(endOdometer);
        // อัปเดตเลขไมล์รถเมื่อคืนรถ
        updateVehicleMileage(ss, vId, endOdometer);
      }
      return { success: true, message: "อัปเดตสถานะการจองเป็น '" + newStatus + "' สำเร็จ" };
    }
  }
  return { success: false, message: "ไม่พบรายการจองนี้" };
}

function handleFileUpload(payload) {
  try {
    var base64Data = payload.base64;
    var filename = payload.filename || ("upload_" + new Date().getTime() + ".jpg");
    var folderName = getSystemSetting("DRIVE_FOLDER_NAME") || "Car_Service_Uploads";

    // ค้นหาหรือสร้างโฟลเดอร์ใน Google Drive
    var folders = DriveApp.getFoldersByName(folderName);
    var targetFolder;
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = DriveApp.createFolder(folderName);
      targetFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    // ล้าง Data URI prefix (เช่น "data:image/jpeg;base64,")
    var cleanBase64 = base64Data;
    var contentType = "image/jpeg";
    if (base64Data.indexOf("data:") === 0) {
      var parts = base64Data.split(",");
      cleanBase64 = parts[1];
      var typeMatch = parts[0].match(/:(.*?);/);
      if (typeMatch) contentType = typeMatch[1];
    }

    var decoded = Utilities.base64Decode(cleanBase64);
    var blob = Utilities.newBlob(decoded, contentType, filename);
    var file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // สร้างลิงก์ที่เข้าถึงภาพได้โดยตรง
    var fileId = file.getId();
    var viewUrl = "https://lh3.googleusercontent.com/d/" + fileId;

    return { 
      success: true, 
      message: "อัปโหลดไฟล์สำเร็จ", 
      file_url: viewUrl, 
      file_id: fileId 
    };
  } catch (err) {
    return { success: false, error: "Upload failed: " + err.toString() };
  }
}

function handleSaveSettings(ss, settingsObj) {
  var sheet = ss.getSheetByName("Settings");
  if (!sheet) return { success: false, message: "Settings sheet not found" };

  var rows = sheet.getDataRange().getValues();
  for (var key in settingsObj) {
    var found = false;
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(settingsObj[key]);
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([key, settingsObj[key], ""]);
    }
  }

  return { success: true, message: "บันทึกการตั้งค่าระบบเรียบร้อย" };
}

/**
 * Utility Functions
 */
function updateVehicleMileage(ss, vehicleId, newMileage) {
  if (!newMileage || newMileage <= 0) return;
  var sheet = ss.getSheetByName("Vehicles");
  if (!sheet) return;

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === vehicleId) {
      var current = Number(rows[i][7]) || 0;
      if (newMileage > current) {
        sheet.getRange(i + 1, 8).setValue(newMileage);
        sheet.getRange(i + 1, 14).setValue(new Date());
      }
      break;
    }
  }
}

function getVehicleBasicInfo(ss, vehicleId) {
  var sheet = ss.getSheetByName("Vehicles");
  if (!sheet) return { plate: vehicleId, model: "", mileage: 0 };

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === vehicleId) {
      return {
        plate: rows[i][1],
        model: rows[i][2] + " " + rows[i][3],
        mileage: Number(rows[i][7]) || 0
      };
    }
  }
  return { plate: vehicleId, model: "", mileage: 0 };
}

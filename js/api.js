/**
 * ====================================================================
 * ระบบบริหารจัดการและดูแลรักษารถยนต์ของบริษัท (Corporate Car Service)
 * ไฟล์: js/api.js - ตัวจัดการเชื่อมต่อ API (GAS Web App / Mock Database)
 * ====================================================================
 */

const Api = {
  /**
   * ส่งคำขอ HTTP GET หรือดึงจาก Mock Database
   */
  async get(action, params = {}) {
    if (AppConfig.isMockMode()) {
      return this.handleMockGet(action, params);
    }

    const gasUrl = AppConfig.getGasUrl();
    const query = new URLSearchParams({ action, ...params }).toString();
    try {
      const response = await fetch(`${gasUrl}?${query}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn("⚠️ การเชื่อมต่อ Live GAS ล้มเหลว สลับไปใช้ Mock Mode ชั่วคราว:", err);
      return this.handleMockGet(action, params);
    }
  },

  /**
   * ส่งคำขอ HTTP POST (ใช้ Content-Type: text/plain ข้าม CORS Preflight)
   */
  async post(action, payload = {}) {
    if (AppConfig.isMockMode()) {
      return this.handleMockPost(action, payload);
    }

    const gasUrl = AppConfig.getGasUrl();
    try {
      const response = await fetch(gasUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({ action, ...payload })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn("⚠️ ไม่สามารถส่งคำขอไปยัง GAS ได้ ใช้ Mock Mode ชั่วคราว:", err);
      return this.handleMockPost(action, payload);
    }
  },

  // ==================================================================
  // BUSINESS API METHODS
  // ==================================================================

  async login(username, password) {
    return this.post("login", { username, password });
  },

  async getVehicles() {
    return this.get("getVehicles");
  },

  async saveVehicle(vehicleData) {
    return this.post("saveVehicle", { data: vehicleData });
  },

  async deleteVehicle(vehicleId) {
    return this.post("deleteVehicle", { vehicle_id: vehicleId });
  },

  async getServiceLogs(vehicleId = null) {
    const params = vehicleId ? { vehicle_id: vehicleId } : {};
    return this.get("getServiceLogs", params);
  },

  async saveServiceLog(logData) {
    return this.post("saveServiceLog", { data: logData });
  },

  async getFuelLogs(vehicleId = null) {
    const params = vehicleId ? { vehicle_id: vehicleId } : {};
    return this.get("getFuelLogs", params);
  },

  async saveFuelLog(fuelData) {
    return this.post("saveFuelLog", { data: fuelData });
  },

  async getBookings() {
    return this.get("getBookings");
  },

  async saveBooking(bookingData) {
    return this.post("saveBooking", { data: bookingData });
  },

  async updateBookingStatus(bookingId, status, approvedBy = "", endOdometer = 0) {
    return this.post("updateBookingStatus", {
      booking_id: bookingId,
      status: status,
      approved_by: approvedBy,
      end_odometer: endOdometer
    });
  },

  async getDashboard() {
    return this.get("getDashboard");
  },

  async uploadFile(base64, filename) {
    return this.post("uploadFile", { base64, filename });
  },

  async testTelegram(botToken, chatId) {
    return this.post("testTelegram", { bot_token: botToken, chat_id: chatId });
  },

  async saveSettings(settings) {
    return this.post("saveSettings", { settings });
  },

  // ==================================================================
  // IN-MEMORY MOCK HANDLERS
  // ==================================================================

  handleMockGet(action, params) {
    switch (action) {
      case "getVehicles":
        return { success: true, data: [...MockDatabase.vehicles] };

      case "getServiceLogs":
        let sLogs = [...MockDatabase.serviceLogs];
        if (params.vehicle_id) {
          sLogs = sLogs.filter(item => item.vehicle_id === params.vehicle_id);
        }
        return { success: true, data: sLogs };

      case "getFuelLogs":
        let fLogs = [...MockDatabase.fuelLogs];
        if (params.vehicle_id) {
          fLogs = fLogs.filter(item => item.vehicle_id === params.vehicle_id);
        }
        return { success: true, data: fLogs };

      case "getBookings":
        return { success: true, data: [...MockDatabase.bookings] };

      case "getDashboard":
        return { success: true, data: this.calculateMockDashboard() };

      default:
        return { success: false, message: `Mock GET action ${action} not found` };
    }
  },

  handleMockPost(action, payload) {
    switch (action) {
      case "login": {
        const u = MockDatabase.users.find(
          x => x.username.toLowerCase() === (payload.username || "").toLowerCase() &&
               x.password === payload.password
        );
        if (u) {
          return {
            success: true,
            message: "เข้าสู่ระบบสำเร็จ (โหมดจำลอง)",
            user: {
              user_id: u.user_id,
              username: u.username,
              fullname: u.fullname,
              department: u.department,
              role: u.role,
              phone: u.phone,
              token: "mock-token-" + Date.now()
            }
          };
        }
        return { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
      }

      case "saveVehicle": {
        const vData = payload.data;
        if (vData.vehicle_id) {
          const idx = MockDatabase.vehicles.findIndex(v => v.vehicle_id === vData.vehicle_id);
          if (idx !== -1) {
            MockDatabase.vehicles[idx] = { ...MockDatabase.vehicles[idx], ...vData, updated_at: new Date().toISOString() };
            return { success: true, message: "อัปเดตข้อมูลรถเรียบร้อย" };
          }
        }
        const newId = `CAR-${String(MockDatabase.vehicles.length + 1).padStart(3, '0')}`;
        const newCar = {
          vehicle_id: newId,
          ...vData,
          current_mileage: Number(vData.current_mileage) || 0,
          updated_at: new Date().toISOString()
        };
        MockDatabase.vehicles.push(newCar);
        return { success: true, message: "เพิ่มรถยนต์สำเร็จ", vehicle_id: newId };
      }

      case "deleteVehicle": {
        const cId = payload.vehicle_id;
        const target = MockDatabase.vehicles.find(v => v.vehicle_id === cId);
        if (target) {
          target.status = "ปลดระวาง";
          return { success: true, message: "ปลดระวางรถยนต์เรียบร้อยแล้ว" };
        }
        return { success: false, message: "ไม่พบข้อมูลรถยนต์" };
      }

      case "saveServiceLog": {
        const log = payload.data;
        const newLogId = `SRV-${Date.now().toString().slice(-6)}`;
        const entry = {
          log_id: newLogId,
          ...log,
          cost: Number(log.cost) || 0,
          odometer: Number(log.odometer) || 0,
          created_at: new Date().toISOString()
        };
        MockDatabase.serviceLogs.unshift(entry);

        // Update vehicle mileage
        const car = MockDatabase.vehicles.find(v => v.vehicle_id === log.vehicle_id);
        if (car && Number(log.odometer) > Number(car.current_mileage)) {
          car.current_mileage = Number(log.odometer);
        }

        return { success: true, message: "บันทึกการซ่อมบำรุงสำเร็จ", log_id: newLogId };
      }

      case "saveFuelLog": {
        const fLog = payload.data;
        const newFuelId = `FUEL-${Date.now().toString().slice(-6)}`;
        const entry = {
          fuel_id: newFuelId,
          ...fLog,
          total_amount: Number(fLog.total_amount) || 0,
          liters: Number(fLog.liters) || 0,
          odometer: Number(fLog.odometer) || 0,
          created_at: new Date().toISOString()
        };
        MockDatabase.fuelLogs.unshift(entry);

        const car = MockDatabase.vehicles.find(v => v.vehicle_id === fLog.vehicle_id);
        if (car && Number(fLog.odometer) > Number(car.current_mileage)) {
          car.current_mileage = Number(fLog.odometer);
        }

        return { success: true, message: "บันทึกการเติมน้ำมันสำเร็จ", fuel_id: newFuelId };
      }

      case "saveBooking": {
        const bkg = payload.data;
        const newBkgId = `BKG-${Date.now().toString().slice(-6)}`;
        const car = MockDatabase.vehicles.find(v => v.vehicle_id === bkg.vehicle_id);
        const entry = {
          booking_id: newBkgId,
          ...bkg,
          status: "รออนุมัติ",
          start_odometer: car ? car.current_mileage : 0,
          end_odometer: 0,
          created_at: new Date().toISOString()
        };
        MockDatabase.bookings.unshift(entry);
        return { success: true, message: "ส่งคำขอจองรถบริษัทสำเร็จ รอการอนุมัติ", booking_id: newBkgId };
      }

      case "updateBookingStatus": {
        const b = MockDatabase.bookings.find(item => item.booking_id === payload.booking_id);
        if (b) {
          b.status = payload.status;
          if (payload.approved_by) b.approved_by = payload.approved_by;
          if (payload.end_odometer > 0) {
            b.end_odometer = payload.end_odometer;
            const car = MockDatabase.vehicles.find(v => v.vehicle_id === b.vehicle_id);
            if (car && Number(payload.end_odometer) > Number(car.current_mileage)) {
              car.current_mileage = Number(payload.end_odometer);
            }
          }
          return { success: true, message: `อัปเดตสถานะเป็น '${payload.status}' เรียบร้อย` };
        }
        return { success: false, message: "ไม่พบรายการจอง" };
      }

      case "uploadFile": {
        // ในโหมด Mock คืนค่า Base64 URL เป็นรูปพรีวิวโดยตรง
        return {
          success: true,
          message: "อัปโหลดภาพจำลองสำเร็จ",
          file_url: payload.base64
        };
      }

      case "testTelegram": {
        return {
          success: true,
          message: "ส่งข้อความทดสอบ Telegram จำลองสำเร็จ (หากเชื่อมต่อ GAS จริงจะส่งเข้าบอท Telegram ทันที)"
        };
      }

      default:
        return { success: false, message: `Mock POST action ${action} not found` };
    }
  },

  calculateMockDashboard() {
    const vehicles = MockDatabase.vehicles;
    const sLogs = MockDatabase.serviceLogs;
    const fLogs = MockDatabase.fuelLogs;
    const bookings = MockDatabase.bookings;

    let readyCount = 0;
    let maintenanceCount = 0;
    let retiredCount = 0;

    const urgentAlerts = [];
    const warningAlerts = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    vehicles.forEach(v => {
      if (v.status === "พร้อมใช้งาน") readyCount++;
      else if (v.status === "ซ่อมบำรุง") maintenanceCount++;
      else if (v.status === "ปลดระวาง") retiredCount++;

      if (v.status !== "ปลดระวาง") {
        this.checkMockExpiry(v.tax_expiry_date, today, v.license_plate, "ภาษีประจำปี", urgentAlerts, warningAlerts);
        this.checkMockExpiry(v.act_expiry_date, today, v.license_plate, "พ.ร.บ.", urgentAlerts, warningAlerts);
        this.checkMockExpiry(v.insurance_expiry_date, today, v.license_plate, "ประกันภัย", urgentAlerts, warningAlerts);
      }
    });

    const totalServiceCost = sLogs.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
    const totalFuelCost = fLogs.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

    return {
      summary: {
        totalVehicles: vehicles.length,
        readyVehicles: readyCount,
        maintenanceVehicles: maintenanceCount,
        retiredVehicles: retiredCount,
        activeBookingsToday: bookings.filter(b => b.status === "อนุมัติแล้ว").length,
        pendingBookings: bookings.filter(b => b.status === "รออนุมัติ").length,
        totalServiceCost,
        totalFuelCost,
        totalFleetCost: totalServiceCost + totalFuelCost
      },
      alerts: {
        urgent: urgentAlerts,
        warning: warningAlerts
      },
      recentServiceLogs: sLogs.slice(0, 5),
      recentBookings: bookings.slice(0, 5)
    };
  },

  checkMockExpiry(dateStr, today, plate, label, urgentArr, warningArr) {
    if (!dateStr) return;
    const d = new Date(dateStr).getTime();
    if (isNaN(d)) return;
    const diffDays = Math.ceil((d - today) / (24 * 60 * 60 * 1000));
    if (diffDays < 0) {
      urgentArr.push({ plate, label, days: Math.abs(diffDays), status: "expired", expiryDate: dateStr });
    } else if (diffDays <= 30) {
      warningArr.push({ plate, label, days: diffDays, status: "expiring_soon", expiryDate: dateStr });
    }
  }
};

/**
 * ====================================================================
 * ระบบบริหารจัดการและดูแลรักษารถยนต์ของบริษัท (Corporate Car Service)
 * ไฟล์: js/config.js - ตั้งค่าคอนฟิกและการเชื่อมต่อ
 * ====================================================================
 */

const AppConfig = {
  // ค่าเริ่มต้น (หากผู้ใช้ยังไม่ได้ระบุ Web App URL จะทำงานใน Demo/Mock Mode อัตโนมัติ)
  DEFAULT_GAS_URL: "", 
  
  STORAGE_KEYS: {
    GAS_URL: "car_service_gas_url",
    AUTH_USER: "car_service_auth_user",
    USE_MOCK: "car_service_use_mock",
    TELEGRAM_BOT_TOKEN: "car_service_tg_token",
    TELEGRAM_CHAT_ID: "car_service_tg_chat_id",
    COMPANY_NAME: "car_service_company_name"
  },

  getGasUrl() {
    return localStorage.getItem(this.STORAGE_KEYS.GAS_URL) || this.DEFAULT_GAS_URL;
  },

  setGasUrl(url) {
    if (url) {
      localStorage.setItem(this.STORAGE_KEYS.GAS_URL, url.trim());
    } else {
      localStorage.removeItem(this.STORAGE_KEYS.GAS_URL);
    }
  },

  isMockMode() {
    const forcedMock = localStorage.getItem(this.STORAGE_KEYS.USE_MOCK);
    if (forcedMock !== null) {
      return forcedMock === "true";
    }
    // ถ้ายังไม่ได้กรอก GAS Web App URL ให้ถือว่าเป็น Mock Mode อัตโนมัติ
    return !this.getGasUrl();
  },

  setMockMode(isMock) {
    localStorage.setItem(this.STORAGE_KEYS.USE_MOCK, isMock ? "true" : "false");
  },

  getTelegramConfig() {
    return {
      botToken: localStorage.getItem(this.STORAGE_KEYS.TELEGRAM_BOT_TOKEN) || "",
      chatId: localStorage.getItem(this.STORAGE_KEYS.TELEGRAM_CHAT_ID) || ""
    };
  },

  setTelegramConfig(botToken, chatId) {
    localStorage.setItem(this.STORAGE_KEYS.TELEGRAM_BOT_TOKEN, (botToken || "").trim());
    localStorage.setItem(this.STORAGE_KEYS.TELEGRAM_CHAT_ID, (chatId || "").trim());
  },

  getCompanyName() {
    return localStorage.getItem(this.STORAGE_KEYS.COMPANY_NAME) || "บริษัท คอร์ปอเรท ทรานสปอร์ต จำกัด";
  },

  setCompanyName(name) {
    localStorage.setItem(this.STORAGE_KEYS.COMPANY_NAME, name.trim());
  }
};

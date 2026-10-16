/**
 * ====================================================================
 * ระบบบริหารจัดการและดูแลรักษารถยนต์ของบริษัท (Corporate Car Service)
 * ไฟล์: js/auth.js - จัดการการพิสูจน์ตัวตนและสิทธิ์การใช้งาน (Auth & Roles)
 * ====================================================================
 */

const Auth = {
  getCurrentUser() {
    const raw = localStorage.getItem(AppConfig.STORAGE_KEYS.AUTH_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  isAdmin() {
    const u = this.getCurrentUser();
    return u && u.role === "admin";
  },

  isDriver() {
    const u = this.getCurrentUser();
    return u && (u.role === "driver" || u.role === "admin");
  },

  isStaff() {
    const u = this.getCurrentUser();
    return !!u;
  },

  async login(username, password) {
    const res = await Api.login(username, password);
    if (res.success && res.user) {
      localStorage.setItem(AppConfig.STORAGE_KEYS.AUTH_USER, JSON.stringify(res.user));
    }
    return res;
  },

  logout() {
    localStorage.removeItem(AppConfig.STORAGE_KEYS.AUTH_USER);
  },

  /**
   * One-click Quick Demo Login สำหรับทดสอบระบบ
   */
  async quickDemoLogin(role = "admin") {
    let username = "admin";
    let password = "admin1234";

    if (role === "driver") {
      username = "driver1";
      password = "driver1234";
    } else if (role === "staff") {
      username = "staff1";
      password = "staff1234";
    }

    return this.login(username, password);
  }
};

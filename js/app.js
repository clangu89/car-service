/**
 * ====================================================================
 * ระบบบริหารจัดการและดูแลรักษารถยนต์ของบริษัท (Corporate Car Service)
 * ไฟล์: js/app.js - ตัวควบคุม UI และการทำงานหลักของระบบ
 * ====================================================================
 */

const App = {
  currentTab: "dashboard",
  vehicles: [],
  services: [],
  fuels: [],
  bookings: [],
  dashboardData: null,
  activeVehicleFilter: "all",
  searchQuery: "",
  expenseChart: null,
  tcoChart: null,
  uploadedBase64: null,

  async init() {
    this.bindGlobalEvents();
    
    if (!Auth.isLoggedIn()) {
      this.renderLoginScreen();
      return;
    }

    this.renderMainLayout();
    await this.refreshData();
  },

  // ==================================================================
  // GLOBAL EVENTS & ROUTING
  // ==================================================================
  bindGlobalEvents() {
    // Window click to close modals if backdrop clicked
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        this.closeAllModals();
      }
    });

    // Escape key to close modals
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals();
      }
    });
  },

  async refreshData() {
    this.showLoading(true);
    try {
      const [vRes, sRes, fRes, bRes, dRes] = await Promise.all([
        Api.getVehicles(),
        Api.getServiceLogs(),
        Api.getFuelLogs(),
        Api.getBookings(),
        Api.getDashboard()
      ]);

      if (vRes.success) this.vehicles = vRes.data || [];
      if (sRes.success) this.services = sRes.data || [];
      if (fRes.success) this.fuels = fRes.data || [];
      if (bRes.success) this.bookings = bRes.data || [];
      if (dRes.success) this.dashboardData = dRes.data;

      this.renderCurrentTab();
    } catch (err) {
      this.showToast("เกิดข้อผิดพลาดในการโหลดข้อมูล: " + err.message, "error");
    } finally {
      this.showLoading(false);
    }
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll(".nav-link").forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add("active", "bg-blue-600", "text-white");
        btn.classList.remove("text-slate-300", "hover:bg-slate-800");
      } else {
        btn.classList.remove("active", "bg-blue-600", "text-white");
        btn.classList.add("text-slate-300", "hover:bg-slate-800");
      }
    });

    // Mobile bottom nav sync
    document.querySelectorAll(".mobile-nav-btn").forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add("text-blue-600");
        btn.classList.remove("text-slate-400");
      } else {
        btn.classList.remove("text-blue-600");
        btn.classList.add("text-slate-400");
      }
    });

    this.renderCurrentTab();
  },

  renderCurrentTab() {
    const container = document.getElementById("main-content");
    if (!container) return;

    switch (this.currentTab) {
      case "dashboard":
        this.renderDashboardView(container);
        break;
      case "vehicles":
        this.renderVehiclesView(container);
        break;
      case "services":
        this.renderServicesView(container);
        break;
      case "fuels":
        this.renderFuelsView(container);
        break;
      case "bookings":
        this.renderBookingsView(container);
        break;
      case "reports":
        this.renderReportsView(container);
        break;
      case "settings":
        this.renderSettingsView(container);
        break;
      default:
        this.renderDashboardView(container);
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // ==================================================================
  // AUTHENTICATION & LOGIN SCREEN
  // ==================================================================
  renderLoginScreen() {
    const appEl = document.getElementById("app");
    appEl.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 fade-in">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <i data-lucide="car" class="w-8 h-8"></i>
            </div>
            <h1 class="text-2xl font-bold text-slate-800">ระบบดูแลรักษารถยนต์บริษัท</h1>
            <p class="text-slate-500 text-sm mt-1">Corporate Car Fleet & Maintenance</p>
          </div>

          <form id="login-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้งาน / รหัสพนักงาน</label>
              <div class="relative">
                <i data-lucide="user" class="w-5 h-5 absolute left-3 top-3 text-slate-400"></i>
                <input type="text" id="login-username" required placeholder="เช่น admin, driver1, staff1"
                  class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 text-sm">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
              <div class="relative">
                <i data-lucide="lock" class="w-5 h-5 absolute left-3 top-3 text-slate-400"></i>
                <input type="password" id="login-password" required placeholder="••••••••"
                  class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 text-sm">
              </div>
            </div>

            <button type="submit" id="btn-login-submit"
              class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
              <span>เข้าสู่ระบบ</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-slate-100">
            <p class="text-xs text-center text-slate-400 font-medium mb-3">ทดสอบระบบอย่างรวดเร็ว (Quick Demo Login)</p>
            <div class="grid grid-cols-3 gap-2">
              <button onclick="App.quickLogin('admin')" class="py-2 px-2 text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg font-medium text-slate-600 transition flex flex-col items-center gap-1">
                <i data-lucide="shield-check" class="w-4 h-4 text-blue-600"></i>
                <span>ผู้ดูแลระบบ</span>
              </button>
              <button onclick="App.quickLogin('driver')" class="py-2 px-2 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg font-medium text-slate-600 transition flex flex-col items-center gap-1">
                <i data-lucide="truck" class="w-4 h-4 text-emerald-600"></i>
                <span>คนขับรถ</span>
              </button>
              <button onclick="App.quickLogin('staff')" class="py-2 px-2 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg font-medium text-slate-600 transition flex flex-col items-center gap-1">
                <i data-lucide="users" class="w-4 h-4 text-indigo-600"></i>
                <span>พนักงานทั่วไป</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const u = document.getElementById("login-username").value;
      const p = document.getElementById("login-password").value;
      this.handleLogin(u, p);
    });
  },

  async quickLogin(role) {
    this.showLoading(true);
    const res = await Auth.quickDemoLogin(role);
    this.showLoading(false);
    if (res.success) {
      this.showToast(`ยินดีต้อนรับ ${res.user.fullname} (${res.user.role})`, "success");
      this.renderMainLayout();
      await this.refreshData();
    } else {
      this.showToast(res.message, "error");
    }
  },

  async handleLogin(username, password) {
    const btn = document.getElementById("btn-login-submit");
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> กำลังตรวจสอบ...`;
    if (window.lucide) lucide.createIcons();

    const res = await Auth.login(username, password);
    btn.disabled = false;
    btn.innerHTML = `<span>เข้าสู่ระบบ</span><i data-lucide="arrow-right" class="w-4 h-4"></i>`;
    if (window.lucide) lucide.createIcons();

    if (res.success) {
      this.showToast(res.message, "success");
      this.renderMainLayout();
      await this.refreshData();
    } else {
      this.showToast(res.message || "เข้าสู่ระบบไม่สำเร็จ", "error");
    }
  },

  handleLogout() {
    Auth.logout();
    this.showToast("ออกจากระบบแล้ว", "info");
    this.renderLoginScreen();
  },

  // ==================================================================
  // MAIN APPLICATION LAYOUT
  // ==================================================================
  renderMainLayout() {
    const user = Auth.getCurrentUser();
    const appEl = document.getElementById("app");
    const isMock = AppConfig.isMockMode();

    appEl.innerHTML = `
      <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-16 md:pb-0">
        <!-- SIDEBAR (DESKTOP) -->
        <aside class="w-64 bg-slate-900 text-slate-200 hidden md:flex flex-col border-r border-slate-800 shrink-0">
          <div class="p-6 border-b border-slate-800 flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <i data-lucide="car" class="w-5 h-5"></i>
            </div>
            <div>
              <h2 class="font-bold text-white text-base leading-tight">Car Fleet</h2>
              <span class="text-xs text-slate-400">ระบบยานพาหนะบริษัท</span>
            </div>
          </div>

          <!-- Status Mode Pill -->
          <div class="px-6 py-3 bg-slate-950/60 flex items-center justify-between text-xs border-b border-slate-800/60">
            <span class="text-slate-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full ${isMock ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}"></span>
              ${isMock ? 'โหมดจำลอง (Demo)' : 'Google Sheets Live'}
            </span>
            <button onclick="App.switchTab('settings')" class="text-blue-400 hover:text-blue-300">ตั้งค่า</button>
          </div>

          <!-- NAV LINKS -->
          <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
            <button onclick="App.switchTab('dashboard')" data-tab="dashboard"
              class="nav-link active w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition text-left">
              <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
              <span>แดชบอร์ด (Overview)</span>
            </button>
            <button onclick="App.switchTab('vehicles')" data-tab="vehicles"
              class="nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition text-left">
              <i data-lucide="car-front" class="w-4 h-4"></i>
              <span>ทะเบียนรถยนต์</span>
            </button>
            <button onclick="App.switchTab('services')" data-tab="services"
              class="nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition text-left">
              <i data-lucide="wrench" class="w-4 h-4"></i>
              <span>ประวัติซ่อมบำรุง</span>
            </button>
            <button onclick="App.switchTab('fuels')" data-tab="fuels"
              class="nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition text-left">
              <i data-lucide="fuel" class="w-4 h-4"></i>
              <span>บันทึกการเติมน้ำมัน</span>
            </button>
            <button onclick="App.switchTab('bookings')" data-tab="bookings"
              class="nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition text-left">
              <i data-lucide="calendar-check" class="w-4 h-4"></i>
              <span>ระบบขอใช้รถ / เบิกรถ</span>
            </button>
            <button onclick="App.switchTab('reports')" data-tab="reports"
              class="nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition text-left">
              <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
              <span>รายงานและ TCO</span>
            </button>
            <button onclick="App.switchTab('settings')" data-tab="settings"
              class="nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition text-left">
              <i data-lucide="settings" class="w-4 h-4"></i>
              <span>ตั้งค่า & Telegram</span>
            </button>
          </nav>

          <!-- USER PROFILE FOOTER -->
          <div class="p-4 border-t border-slate-800 bg-slate-950/40">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  ${(user.fullname || user.username).charAt(0)}
                </div>
                <div class="truncate">
                  <div class="text-sm font-medium text-white truncate">${user.fullname || user.username}</div>
                  <div class="text-xs text-blue-400 capitalize">${user.role} • ${user.department || 'ทั่วไป'}</div>
                </div>
              </div>
              <button onclick="App.handleLogout()" title="ออกจากระบบ" class="text-slate-400 hover:text-rose-400 p-1.5 transition">
                <i data-lucide="log-out" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </aside>

        <!-- MAIN CONTAINER -->
        <div class="flex-1 flex flex-col min-h-screen overflow-hidden">
          <!-- TOPBAR -->
          <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div class="flex items-center gap-3 md:hidden">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <i data-lucide="car" class="w-4 h-4"></i>
              </div>
              <span class="font-bold text-slate-800 text-sm">Car Fleet</span>
            </div>

            <div class="hidden md:flex items-center gap-2">
              <span class="text-xs text-slate-400">องค์กร:</span>
              <span class="text-sm font-semibold text-slate-700">${AppConfig.getCompanyName()}</span>
            </div>

            <div class="flex items-center gap-3">
              <button onclick="App.refreshData()" title="รีเฟรชข้อมูล"
                class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                <span>ซิงค์ข้อมูล</span>
              </button>

              <button onclick="App.openNewServiceModal()" 
                class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span class="hidden sm:inline">บันทึกซ่อมด่วน</span>
              </button>
            </div>
          </header>

          <!-- DYNAMIC CONTENT AREA -->
          <main id="main-content" class="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
            <!-- Content will be rendered here -->
          </main>
        </div>

        <!-- MOBILE BOTTOM NAVIGATION -->
        <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-3 flex items-center justify-around z-30 shadow-lg">
          <button onclick="App.switchTab('dashboard')" data-tab="dashboard" class="mobile-nav-btn text-blue-600 flex flex-col items-center text-[10px] font-medium gap-1">
            <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
            <span>หน้าแรก</span>
          </button>
          <button onclick="App.switchTab('vehicles')" data-tab="vehicles" class="mobile-nav-btn text-slate-400 flex flex-col items-center text-[10px] font-medium gap-1">
            <i data-lucide="car-front" class="w-5 h-5"></i>
            <span>รถยนต์</span>
          </button>
          <button onclick="App.switchTab('services')" data-tab="services" class="mobile-nav-btn text-slate-400 flex flex-col items-center text-[10px] font-medium gap-1">
            <i data-lucide="wrench" class="w-5 h-5"></i>
            <span>ซ่อมบำรุง</span>
          </button>
          <button onclick="App.switchTab('fuels')" data-tab="fuels" class="mobile-nav-btn text-slate-400 flex flex-col items-center text-[10px] font-medium gap-1">
            <i data-lucide="fuel" class="w-5 h-5"></i>
            <span>น้ำมัน</span>
          </button>
          <button onclick="App.switchTab('bookings')" data-tab="bookings" class="mobile-nav-btn text-slate-400 flex flex-col items-center text-[10px] font-medium gap-1">
            <i data-lucide="calendar" class="w-5 h-5"></i>
            <span>จองรถ</span>
          </button>
        </nav>
      </div>

      <!-- MODAL CONTAINER -->
      <div id="modal-container"></div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  // ==================================================================
  // VIEW: DASHBOARD (OVERVIEW)
  // ==================================================================
  renderDashboardView(container) {
    const d = this.dashboardData ? this.dashboardData.summary : {
      totalVehicles: this.vehicles.length,
      readyVehicles: this.vehicles.filter(v => v.status === "พร้อมใช้งาน").length,
      maintenanceVehicles: this.vehicles.filter(v => v.status === "ซ่อมบำรุง").length,
      totalServiceCost: 0,
      totalFuelCost: 0,
      activeBookingsToday: 0
    };

    const alerts = this.dashboardData && this.dashboardData.alerts ? this.dashboardData.alerts : { urgent: [], warning: [] };
    const hasAlerts = (alerts.urgent && alerts.urgent.length > 0) || (alerts.warning && alerts.warning.length > 0);

    container.innerHTML = `
      <div class="space-y-6 fade-in">
        <!-- HEADER TITLE -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">แดชบอร์ดภาพรวมยานพาหนะ</h1>
            <p class="text-sm text-slate-500">ติดตามสถานะรถยนต์ การซ่อมบำรุง และค่าใช้จ่ายทั้งหมดของบริษัท</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.openNewBookingModal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition">
              <i data-lucide="calendar-plus" class="w-4 h-4"></i>
              <span>ขอใช้รถ</span>
            </button>
            <button onclick="App.openNewFuelModal()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition">
              <i data-lucide="fuel" class="w-4 h-4"></i>
              <span>เติมน้ำมัน</span>
            </button>
          </div>
        </div>

        <!-- URGENT ALERTS BANNER -->
        ${hasAlerts ? `
          <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5 shadow-sm">
            <div class="flex items-center gap-2 text-amber-800 font-bold text-sm mb-3">
              <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600"></i>
              <span>รายการแจ้งเตือนด่วน (ภาษี / พ.ร.บ. / ประกันภัย / รอบเช็คระยะ)</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${(alerts.urgent || []).map(u => `
                <div class="flex items-center justify-between bg-white/80 p-3 rounded-xl border border-rose-200 text-xs">
                  <span class="font-bold text-rose-700 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    ${u.plate}
                  </span>
                  <span class="text-rose-600 font-medium">${u.label} ขาดแล้ว (${u.days} วัน)</span>
                </div>
              `).join("")}
              ${(alerts.warning || []).map(w => `
                <div class="flex items-center justify-between bg-white/80 p-3 rounded-xl border border-amber-200 text-xs">
                  <span class="font-bold text-slate-800 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                    ${w.plate}
                  </span>
                  <span class="text-amber-700 font-medium">${w.label} ใกล้หมด (เหลือ ${w.days} วัน)</span>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ''}

        <!-- STATS CARDS GRID -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400 font-medium">รถยนต์ทั้งหมด</div>
              <div class="text-2xl font-bold text-slate-800 mt-1">${d.totalVehicles} <span class="text-xs font-normal text-slate-500">คัน</span></div>
            </div>
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <i data-lucide="car" class="w-6 h-6"></i>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400 font-medium">พร้อมใช้งาน</div>
              <div class="text-2xl font-bold text-emerald-600 mt-1">${d.readyVehicles} <span class="text-xs font-normal text-slate-500">คัน</span></div>
            </div>
            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <i data-lucide="check-circle" class="w-6 h-6"></i>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400 font-medium">กำลังซ่อมบำรุง</div>
              <div class="text-2xl font-bold text-amber-600 mt-1">${d.maintenanceVehicles} <span class="text-xs font-normal text-slate-500">คัน</span></div>
            </div>
            <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <i data-lucide="wrench" class="w-6 h-6"></i>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400 font-medium">การใช้รถวันนี้</div>
              <div class="text-2xl font-bold text-indigo-600 mt-1">${d.activeBookingsToday || 0} <span class="text-xs font-normal text-slate-500">คัน</span></div>
            </div>
            <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <i data-lucide="calendar-check" class="w-6 h-6"></i>
            </div>
          </div>
        </div>

        <!-- CHARTS & SUMMARY EXPENSES -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- CHART: ค่าใช้จ่ายแยกประเภท -->
          <div class="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-slate-800 text-base">สถิติค่าใช้จ่าย (ซ่อมบำรุง vs ค่าน้ำมัน)</h3>
                <p class="text-xs text-slate-400">เปรียบเทียบค่าใช้จ่ายรายหมวดหมู่</p>
              </div>
              <div class="text-right">
                <div class="text-xs text-slate-400">ค่าใช้จ่ายรวม</div>
                <div class="text-lg font-bold text-blue-600">${this.formatMoney(d.totalFleetCost || (d.totalServiceCost + d.totalFuelCost))}</div>
              </div>
            </div>
            <div class="h-64 relative">
              <canvas id="expenseChart"></canvas>
            </div>
          </div>

          <!-- RECENT SERVICE ACTIVITY -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-slate-800 text-base">ประวัติซ่อมบำรุงล่าสุด</h3>
              <button onclick="App.switchTab('services')" class="text-xs text-blue-600 hover:underline">ดูทั้งหมด</button>
            </div>
            <div class="space-y-3 flex-1 overflow-y-auto max-h-64">
              ${this.services.slice(0, 4).map(s => {
                const car = this.vehicles.find(v => v.vehicle_id === s.vehicle_id);
                return `
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-2 text-xs">
                    <div>
                      <div class="font-bold text-slate-800">${car ? car.license_plate : s.vehicle_id}</div>
                      <div class="text-slate-500 font-medium truncate mt-0.5">${s.title}</div>
                      <div class="text-slate-400 text-[11px] mt-1">${s.service_date} • ${s.service_center || 'ศูนย์บริการ'}</div>
                    </div>
                    <div class="text-right shrink-0">
                      <div class="font-bold text-blue-700">${this.formatMoney(s.cost)}</div>
                      <span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">${s.category}</span>
                    </div>
                  </div>
                `;
              }).join("") || '<div class="text-center py-8 text-slate-400 text-xs">ยังไม่มีรายการซ่อม</div>'}
            </div>
          </div>
        </div>

        <!-- FLEET CARDS PREVIEW -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-slate-800 text-base">ยานพาหนะในสังกัด</h3>
              <p class="text-xs text-slate-400">สถานะและเลขไมล์ปัจจุบันของรถแต่ละคัน</p>
            </div>
            <button onclick="App.switchTab('vehicles')" class="text-xs text-blue-600 hover:underline">จัดการรถทั้งหมด</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${this.vehicles.slice(0, 4).map(v => this.renderVehicleMiniCard(v)).join("")}
          </div>
        </div>
      </div>
    `;

    this.renderExpenseChart();
  },

  renderVehicleMiniCard(v) {
    const statusBg = v.status === "พร้อมใช้งาน" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                     v.status === "ซ่อมบำรุง" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-600 border-slate-200";

    return `
      <div class="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition">
        <div class="h-32 bg-slate-200 relative overflow-hidden">
          <img src="${v.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500'}" 
               alt="${v.license_plate}" class="w-full h-full object-cover">
          <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBg}">
            ${v.status}
          </span>
        </div>
        <div class="p-3.5">
          <div class="text-xs text-slate-400">${v.brand} ${v.model} (${v.year})</div>
          <div class="text-sm font-bold text-slate-800 mt-0.5">${v.license_plate}</div>
          <div class="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
            <span>เลขไมล์:</span>
            <span class="font-semibold text-slate-700">${Number(v.current_mileage || 0).toLocaleString()} กม.</span>
          </div>
          <button onclick="App.viewVehicleTimeline('${v.vehicle_id}')" 
            class="w-full mt-3 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium transition text-center">
            ดูประวัติรถ
          </button>
        </div>
      </div>
    `;
  },

  renderExpenseChart() {
    const canvas = document.getElementById("expenseChart");
    if (!canvas || !window.Chart) return;

    if (this.expenseChart) {
      this.expenseChart.destroy();
    }

    // สรุปค่าใช้จ่ายแยกหมวดหมู่
    const catMap = {};
    this.services.forEach(s => {
      const cat = s.category || "ทั่วไป";
      catMap[cat] = (catMap[cat] || 0) + (Number(s.cost) || 0);
    });

    const totalFuel = this.fuels.reduce((a, b) => a + (Number(b.total_amount) || 0), 0);
    catMap["ค่าน้ำมันเชื้อเพลิง"] = totalFuel;

    const labels = Object.keys(catMap);
    const data = Object.values(catMap);

    this.expenseChart = new Chart(canvas, {
      type: "bar",
      data: {
        labels: labels.length > 0 ? labels : ["ไม่มีข้อมูล"],
        datasets: [{
          label: "ค่าใช้จ่าย (บาท)",
          data: data.length > 0 ? data : [0],
          backgroundColor: [
            "#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2", "#ea580c"
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: val => val.toLocaleString() + " ฿"
            }
          }
        }
      }
    });
  },

  // ==================================================================
  // VIEW: VEHICLES (ทะเบียนรถยนต์)
  // ==================================================================
  renderVehiclesView(container) {
    let filtered = [...this.vehicles];
    if (this.activeVehicleFilter !== "all") {
      filtered = filtered.filter(v => v.status === this.activeVehicleFilter);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        (v.license_plate && v.license_plate.toLowerCase().includes(q)) ||
        (v.brand && v.brand.toLowerCase().includes(q)) ||
        (v.model && v.model.toLowerCase().includes(q)) ||
        (v.department && v.department.toLowerCase().includes(q))
      );
    }

    container.innerHTML = `
      <div class="space-y-6 fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">ทะเบียนรถยนต์ของบริษัท</h1>
            <p class="text-sm text-slate-500">จัดการข้อมูลรถยนต์ วันหมดอายุภาษี พ.ร.บ. ประกันภัย และเลขไมล์</p>
          </div>
          ${Auth.isAdmin() ? `
            <button onclick="App.openNewVehicleModal()" 
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>เพิ่มรถยนต์คันใหม่</span>
            </button>
          ` : ''}
        </div>

        <!-- SEARCH & STATUS FILTERS -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="relative w-full md:w-80">
            <i data-lucide="search" class="w-4 h-4 absolute left-3 top-3 text-slate-400"></i>
            <input type="text" id="vehicle-search" value="${this.searchQuery}" placeholder="ค้นหาทะเบียน, ยี่ห้อ, รุ่น, แผนก..."
              oninput="App.handleVehicleSearch(this.value)"
              class="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>

          <div class="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button onclick="App.setVehicleFilter('all')" 
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${this.activeVehicleFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              ทั้งหมด (${this.vehicles.length})
            </button>
            <button onclick="App.setVehicleFilter('พร้อมใช้งาน')" 
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${this.activeVehicleFilter === 'พร้อมใช้งาน' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              พร้อมใช้งาน (${this.vehicles.filter(v => v.status === 'พร้อมใช้งาน').length})
            </button>
            <button onclick="App.setVehicleFilter('ซ่อมบำรุง')" 
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${this.activeVehicleFilter === 'ซ่อมบำรุง' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              กำลังซ่อม (${this.vehicles.filter(v => v.status === 'ซ่อมบำรุง').length})
            </button>
            <button onclick="App.setVehicleFilter('ปลดระวาง')" 
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition ${this.activeVehicleFilter === 'ปลดระวาง' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              ปลดระวาง (${this.vehicles.filter(v => v.status === 'ปลดระวาง').length})
            </button>
          </div>
        </div>

        <!-- CARDS GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${filtered.map(v => this.renderFullVehicleCard(v)).join("")}
          ${filtered.length === 0 ? `
            <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
              <i data-lucide="car-off" class="w-10 h-10 mx-auto text-slate-300 mb-2"></i>
              <p class="text-sm">ไม่พบข้อมูลรถยนต์ที่ค้นหา</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  renderFullVehicleCard(v) {
    const statusBg = v.status === "พร้อมใช้งาน" ? "bg-emerald-100 text-emerald-800" :
                     v.status === "ซ่อมบำรุง" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700";

    return `
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col">
        <div class="h-44 bg-slate-100 relative overflow-hidden group">
          <img src="${v.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600'}" 
               alt="${v.license_plate}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
          <div class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
            ${v.type || 'รถยนต์'}
          </div>
          <div class="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusBg}">
            ${v.status}
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-blue-600 font-semibold">${v.brand} ${v.model} (${v.year})</span>
              <span class="text-xs text-slate-400 font-mono">${v.vehicle_id}</span>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mt-1">${v.license_plate}</h3>
            <p class="text-xs text-slate-500 mt-0.5">ผู้ดูแล: ${v.department || 'ส่วนกลาง'}</p>

            <div class="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div class="flex items-center justify-between text-slate-600">
                <span class="flex items-center gap-1.5"><i data-lucide="gauge" class="w-3.5 h-3.5 text-slate-400"></i> เลขไมล์ปัจจุบัน:</span>
                <span class="font-bold text-slate-800">${Number(v.current_mileage || 0).toLocaleString()} กม.</span>
              </div>
              <div class="flex items-center justify-between text-slate-600">
                <span class="flex items-center gap-1.5"><i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-400"></i> วันหมดอายุภาษี:</span>
                <span class="font-medium ${this.checkDateWarning(v.tax_expiry_date)}">${v.tax_expiry_date || '-'}</span>
              </div>
              <div class="flex items-center justify-between text-slate-600">
                <span class="flex items-center gap-1.5"><i data-lucide="shield" class="w-3.5 h-3.5 text-slate-400"></i> วันหมดอายุ พ.ร.บ.:</span>
                <span class="font-medium ${this.checkDateWarning(v.act_expiry_date)}">${v.act_expiry_date || '-'}</span>
              </div>
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button onclick="App.viewVehicleTimeline('${v.vehicle_id}')"
              class="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
              <i data-lucide="history" class="w-3.5 h-3.5"></i>
              <span>ดูประวัติรถ</span>
            </button>
            ${Auth.isAdmin() ? `
              <button onclick="App.openEditVehicleModal('${v.vehicle_id}')"
                class="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                <i data-lucide="edit" class="w-3.5 h-3.5"></i>
                <span>แก้ไข</span>
              </button>
            ` : `
              <button onclick="App.openNewServiceModal('${v.vehicle_id}')"
                class="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                <i data-lucide="wrench" class="w-3.5 h-3.5"></i>
                <span>แจ้งซ่อม</span>
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  },

  handleVehicleSearch(query) {
    this.searchQuery = query;
    const container = document.getElementById("main-content");
    this.renderVehiclesView(container);
    if (window.lucide) lucide.createIcons();
  },

  setVehicleFilter(filter) {
    this.activeVehicleFilter = filter;
    const container = document.getElementById("main-content");
    this.renderVehiclesView(container);
    if (window.lucide) lucide.createIcons();
  },

  checkDateWarning(dateStr) {
    if (!dateStr) return "text-slate-500";
    const d = new Date(dateStr).getTime();
    const today = new Date().getTime();
    const diff = (d - today) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "text-rose-600 font-bold";
    if (diff <= 30) return "text-amber-600 font-bold";
    return "text-slate-700";
  },

  // ==================================================================
  // VIEW: SERVICES (บันทึกซ่อมบำรุง)
  // ==================================================================
  renderServicesView(container) {
    container.innerHTML = `
      <div class="space-y-6 fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">ประวัติการซ่อมบำรุงและเช็คระยะ</h1>
            <p class="text-sm text-slate-500">บันทึกรายการเปลี่ยนถ่ายน้ำมันเครื่อง เปลี่ยนยาง เบรก และซ่อมแซมอะไหล่</p>
          </div>
          <button onclick="App.openNewServiceModal()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>บันทึกงานซ่อมใหม่</span>
          </button>
        </div>

        <!-- TABLE OF SERVICE LOGS -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="p-4">วันที่เข้าซ่อม</th>
                  <th class="p-4">ทะเบียนรถ</th>
                  <th class="p-4">หมวดหมู่</th>
                  <th class="p-4">รายการซ่อม / รายละเอียด</th>
                  <th class="p-4">เลขไมล์ (กม.)</th>
                  <th class="p-4">ค่าใช้จ่าย</th>
                  <th class="p-4">ศูนย์บริการ / อู่</th>
                  <th class="p-4">ใบเสร็จ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                ${this.services.map(s => {
                  const car = this.vehicles.find(v => v.vehicle_id === s.vehicle_id);
                  return `
                    <tr class="hover:bg-slate-50/80 transition">
                      <td class="p-4 whitespace-nowrap font-medium">${s.service_date}</td>
                      <td class="p-4 whitespace-nowrap">
                        <div class="font-bold text-slate-800">${car ? car.license_plate : s.vehicle_id}</div>
                        <div class="text-[11px] text-slate-400">${car ? car.brand + ' ' + car.model : ''}</div>
                      </td>
                      <td class="p-4 whitespace-nowrap">
                        <span class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-semibold">
                          ${s.category || 'ทั่วไป'}
                        </span>
                      </td>
                      <td class="p-4">
                        <div class="font-semibold text-slate-800">${s.title}</div>
                        ${s.description ? `<div class="text-slate-500 text-[11px] mt-0.5 line-clamp-2">${s.description}</div>` : ''}
                      </td>
                      <td class="p-4 whitespace-nowrap font-mono font-medium">${Number(s.odometer || 0).toLocaleString()}</td>
                      <td class="p-4 whitespace-nowrap font-bold text-blue-600">${this.formatMoney(s.cost)}</td>
                      <td class="p-4 whitespace-nowrap text-slate-500">${s.service_center || '-'}</td>
                      <td class="p-4 whitespace-nowrap">
                        ${s.receipt_url ? `
                          <button onclick="App.viewImageModal('${s.receipt_url}', 'ใบเสร็จงานซ่อม')" 
                            class="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[11px] font-medium flex items-center gap-1 transition">
                            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
                            <span>ดูบิล</span>
                          </button>
                        ` : '<span class="text-slate-300">-</span>'}
                      </td>
                    </tr>
                  `;
                }).join("")}
                ${this.services.length === 0 ? `
                  <tr>
                    <td colspan="8" class="text-center py-10 text-slate-400">ยังไม่มีประวัติการซ่อมบำรุง</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ==================================================================
  // VIEW: FUEL LOGS (บันทึกการเติมน้ำมัน)
  // ==================================================================
  renderFuelsView(container) {
    const totalFuelBaht = this.fuels.reduce((a, b) => a + (Number(b.total_amount) || 0), 0);
    const totalLiters = this.fuels.reduce((a, b) => a + (Number(b.liters) || 0), 0);

    container.innerHTML = `
      <div class="space-y-6 fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">บันทึกการเติมน้ำมันเชื้อเพลิง</h1>
            <p class="text-sm text-slate-500">ติดตามปริมาณน้ำมัน ค่าใช้จ่าย และคำนวณอัตราสิ้นเปลือง</p>
          </div>
          <button onclick="App.openNewFuelModal()"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>บันทึกการเติมน้ำมัน</span>
          </button>
        </div>

        <!-- STATS BAR -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-200">
            <div class="text-xs text-slate-400 font-medium">ยอดเงินค่าน้ำมันรวม</div>
            <div class="text-xl font-bold text-slate-800 mt-1">${this.formatMoney(totalFuelBaht)}</div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-200">
            <div class="text-xs text-slate-400 font-medium">ปริมาณรวมทั้งหมด</div>
            <div class="text-xl font-bold text-emerald-600 mt-1">${totalLiters.toFixed(2)} <span class="text-xs text-slate-500 font-normal">ลิตร</span></div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-200">
            <div class="text-xs text-slate-400 font-medium">จำนวนครั้งที่เติม</div>
            <div class="text-xl font-bold text-blue-600 mt-1">${this.fuels.length} <span class="text-xs text-slate-500 font-normal">ครั้ง</span></div>
          </div>
        </div>

        <!-- TABLE OF FUEL LOGS -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="p-4">วันที่เติม</th>
                  <th class="p-4">ทะเบียนรถ</th>
                  <th class="p-4">เลขไมล์ (กม.)</th>
                  <th class="p-4">จำนวนลิตร</th>
                  <th class="p-4">ยอดเงิน (บาท)</th>
                  <th class="p-4">ราคา/ลิตร</th>
                  <th class="p-4">ปั๊มน้ำมัน</th>
                  <th class="p-4">ผู้บันทึก</th>
                  <th class="p-4">ใบเสร็จ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                ${this.fuels.map(f => {
                  const car = this.vehicles.find(v => v.vehicle_id === f.vehicle_id);
                  const pricePerL = Number(f.liters) > 0 ? (Number(f.total_amount) / Number(f.liters)).toFixed(2) : '-';
                  return `
                    <tr class="hover:bg-slate-50/80 transition">
                      <td class="p-4 whitespace-nowrap font-medium">${f.fuel_date}</td>
                      <td class="p-4 whitespace-nowrap">
                        <div class="font-bold text-slate-800">${car ? car.license_plate : f.vehicle_id}</div>
                      </td>
                      <td class="p-4 whitespace-nowrap font-mono font-medium">${Number(f.odometer || 0).toLocaleString()}</td>
                      <td class="p-4 whitespace-nowrap font-semibold">${Number(f.liters || 0).toFixed(2)} ลิตร</td>
                      <td class="p-4 whitespace-nowrap font-bold text-emerald-600">${this.formatMoney(f.total_amount)}</td>
                      <td class="p-4 whitespace-nowrap text-slate-500">${pricePerL} ฿/ล.</td>
                      <td class="p-4 whitespace-nowrap">${f.gas_station || '-'}</td>
                      <td class="p-4 whitespace-nowrap text-slate-500">${f.recorded_by || '-'}</td>
                      <td class="p-4 whitespace-nowrap">
                        ${f.receipt_url ? `
                          <button onclick="App.viewImageModal('${f.receipt_url}', 'ใบเสร็จค่าน้ำมัน')" 
                            class="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg text-[11px] font-medium flex items-center gap-1 transition">
                            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
                            <span>ดูสลิป</span>
                          </button>
                        ` : '<span class="text-slate-300">-</span>'}
                      </td>
                    </tr>
                  `;
                }).join("")}
                ${this.fuels.length === 0 ? `
                  <tr>
                    <td colspan="9" class="text-center py-10 text-slate-400">ยังไม่มีประวัติการเติมน้ำมัน</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ==================================================================
  // VIEW: BOOKINGS (การขอใช้รถ / เบิกรถ)
  // ==================================================================
  renderBookingsView(container) {
    const isAdmin = Auth.isAdmin();

    container.innerHTML = `
      <div class="space-y-6 fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">ระบบขอใช้รถและเบิกรถบริษัท</h1>
            <p class="text-sm text-slate-500">ส่งคำขอใช้งาน ตรวจสอบคิวรถ และบันทึกเลขไมล์คืนรถ</p>
          </div>
          <button onclick="App.openNewBookingModal()"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition">
            <i data-lucide="calendar-plus" class="w-4 h-4"></i>
            <span>ส่งคำขอใช้รถใหม่</span>
          </button>
        </div>

        <!-- BOOKING CARDS LIST -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${this.bookings.map(b => {
            const car = this.vehicles.find(v => v.vehicle_id === b.vehicle_id);
            const statusClass = b.status === "อนุมัติแล้ว" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                                b.status === "รออนุมัติ" ? "bg-amber-100 text-amber-800 border-amber-200" :
                                b.status === "คืนรถแล้ว" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-slate-100 text-slate-600 border-slate-200";

            return `
              <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-mono text-slate-400">${b.booking_id}</span>
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${statusClass}">
                      ${b.status}
                    </span>
                  </div>

                  <div class="mt-3">
                    <h3 class="text-base font-bold text-slate-800">${car ? car.license_plate : b.vehicle_id}</h3>
                    <p class="text-xs text-blue-600 font-medium">${car ? car.brand + ' ' + car.model : ''}</p>
                  </div>

                  <div class="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div class="flex items-center gap-2">
                      <i data-lucide="user" class="w-4 h-4 text-slate-400"></i>
                      <span>ผู้ขอ: <b>${b.user_name}</b> (${b.department || 'ไม่ระบุ'})</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i data-lucide="map-pin" class="w-4 h-4 text-rose-500"></i>
                      <span>ปลายทาง: <b>${b.destination}</b></span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i data-lucide="file-text" class="w-4 h-4 text-slate-400"></i>
                      <span>วัตถุประสงค์: ${b.purpose}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i data-lucide="clock" class="w-4 h-4 text-slate-400"></i>
                      <span>เวลา: ${b.start_datetime} ถึง ${b.end_datetime}</span>
                    </div>
                    ${b.end_odometer > 0 ? `
                      <div class="flex items-center gap-2 text-emerald-600 font-medium">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        <span>เลขไมล์คืนรถ: ${Number(b.end_odometer).toLocaleString()} กม. (ระยะทางวิ่ง ${(Number(b.end_odometer) - Number(b.start_odometer)).toLocaleString()} กม.)</span>
                      </div>
                    ` : ''}
                  </div>
                </div>

                <!-- ACTION BUTTONS -->
                <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  ${isAdmin && b.status === "รออนุมัติ" ? `
                    <button onclick="App.approveBooking('${b.booking_id}')" 
                      class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition">
                      <i data-lucide="check" class="w-3.5 h-3.5"></i>
                      <span>อนุมัติคำขอ</span>
                    </button>
                    <button onclick="App.cancelBooking('${b.booking_id}')" 
                      class="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg text-xs font-semibold transition">
                      <span>ปฏิเสธ</span>
                    </button>
                  ` : ''}

                  ${b.status === "อนุมัติแล้ว" ? `
                    <button onclick="App.openReturnVehicleModal('${b.booking_id}', '${b.vehicle_id}', ${b.start_odometer})" 
                      class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition">
                      <i data-lucide="corner-up-left" class="w-3.5 h-3.5"></i>
                      <span>คืนรถ / บันทึกเลขไมล์</span>
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join("")}
          ${this.bookings.length === 0 ? `
            <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
              <i data-lucide="calendar-x" class="w-10 h-10 mx-auto text-slate-300 mb-2"></i>
              <p class="text-sm">ยังไม่มีคำขอใช้รถ</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  async approveBooking(bookingId) {
    const user = Auth.getCurrentUser();
    this.showLoading(true);
    const res = await Api.updateBookingStatus(bookingId, "อนุมัติแล้ว", user ? user.fullname : "Admin");
    this.showLoading(false);
    if (res.success) {
      this.showToast(res.message, "success");
      await this.refreshData();
    } else {
      this.showToast(res.message, "error");
    }
  },

  async cancelBooking(bookingId) {
    if (!confirm("คุณต้องการปฏิเสธ/ยกเลิกคำขอนี้ใช่หรือไม่?")) return;
    this.showLoading(true);
    const res = await Api.updateBookingStatus(bookingId, "ยกเลิก");
    this.showLoading(false);
    if (res.success) {
      this.showToast("ยกเลิกคำขอเรียบร้อย", "info");
      await this.refreshData();
    }
  },

  // ==================================================================
  // VIEW: REPORTS & EXPORT
  // ==================================================================
  renderReportsView(container) {
    // คำนวณ TCO (Total Cost of Ownership) แยกแต่ละคัน
    const tcoList = this.vehicles.map(v => {
      const vServices = this.services.filter(s => s.vehicle_id === v.vehicle_id);
      const vFuels = this.fuels.filter(f => f.vehicle_id === v.vehicle_id);
      const totalService = vServices.reduce((a, b) => a + (Number(b.cost) || 0), 0);
      const totalFuel = vFuels.reduce((a, b) => a + (Number(b.total_amount) || 0), 0);
      const totalCost = totalService + totalFuel;

      return {
        vehicle_id: v.vehicle_id,
        plate: v.license_plate,
        model: `${v.brand} ${v.model}`,
        current_mileage: v.current_mileage,
        totalService,
        totalFuel,
        totalCost,
        serviceCount: vServices.length,
        fuelCount: vFuels.length
      };
    });

    container.innerHTML = `
      <div class="space-y-6 fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">รายงานสรุปค่าใช้จ่ายและต้นทุน (TCO)</h1>
            <p class="text-sm text-slate-500">วิเคราะห์ต้นทุนการดูแลรักษารถยนต์แยกตามคัน และส่งออกข้อมูลเป็น CSV</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.exportToCsv('services')" 
              class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span>ส่งออก CSV ซ่อมบำรุง</span>
            </button>
            <button onclick="App.exportToCsv('fuels')" 
              class="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span>ส่งออก CSV ค่าน้ำมัน</span>
            </button>
          </div>
        </div>

        <!-- TCO TABLE -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 class="font-bold text-slate-800 text-base">สรุปค่าใช้จ่ายรวมแยกตามคัน (Fleet Cost Breakdown)</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="p-4">ทะเบียนรถ</th>
                  <th class="p-4">ยี่ห้อ / รุ่น</th>
                  <th class="p-4">เลขไมล์ (กม.)</th>
                  <th class="p-4">ค่าซ่อมบำรุง (บาท)</th>
                  <th class="p-4">ค่าน้ำมัน (บาท)</th>
                  <th class="p-4">ค่าใช้จ่ายรวมทั้งสิ้น</th>
                  <th class="p-4 text-center">สัดส่วน</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                ${tcoList.map(item => `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="p-4 font-bold text-slate-800">${item.plate}</td>
                    <td class="p-4 text-slate-600">${item.model}</td>
                    <td class="p-4 font-mono">${Number(item.current_mileage || 0).toLocaleString()}</td>
                    <td class="p-4 font-semibold text-blue-600">${this.formatMoney(item.totalService)}</td>
                    <td class="p-4 font-semibold text-emerald-600">${this.formatMoney(item.totalFuel)}</td>
                    <td class="p-4 font-bold text-slate-900">${this.formatMoney(item.totalCost)}</td>
                    <td class="p-4 text-center">
                      <button onclick="App.viewVehicleTimeline('${item.vehicle_id}')" class="text-blue-600 hover:underline">
                        ดูไทม์ไลน์
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ==================================================================
  // VIEW: SETTINGS & TELEGRAM INTEGRATION
  // ==================================================================
  renderSettingsView(container) {
    const isMock = AppConfig.isMockMode();
    const gasUrl = AppConfig.getGasUrl();
    const tgConfig = AppConfig.getTelegramConfig();
    const companyName = AppConfig.getCompanyName();

    container.innerHTML = `
      <div class="max-w-4xl space-y-6 fade-in">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">ตั้งค่าระบบและการเชื่อมต่อ</h1>
          <p class="text-sm text-slate-500">จัดการ URL ของ Google Apps Script, แจ้งเตือน Telegram Bot และข้อมูลบริษัท</p>
        </div>

        <!-- SETTINGS FORM -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <!-- MODE TOGGLE -->
          <div class="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <div class="font-bold text-slate-800 text-sm">โหมดการทำงานของระบบ (Data Mode)</div>
              <div class="text-xs text-slate-400 mt-0.5">สลับระหว่างโหมดจำลอง (Mock Demo) กับเชื่อมต่อ Google Sheets จริง</div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="App.toggleMockMode(true)" 
                class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${isMock ? 'bg-amber-500 text-white shadow' : 'bg-slate-100 text-slate-600'}">
                โหมดจำลอง (Demo)
              </button>
              <button onclick="App.toggleMockMode(false)" 
                class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${!isMock ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600'}">
                เชื่อมต่อ GAS Live
              </button>
            </div>
          </div>

          <!-- GOOGLE APPS SCRIPT URL -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-slate-700">Google Apps Script Web App URL</label>
            <p class="text-xs text-slate-400">นำ URL ที่ได้จากการกด Deploy > New deployment > Web app ใน Google Apps Script มาใส่ที่นี่</p>
            <input type="url" id="setting-gas-url" value="${gasUrl}" placeholder="https://script.google.com/macros/s/.../exec"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>

          <!-- TELEGRAM NOTIFICATION SECTION -->
          <div class="pt-4 border-t border-slate-100 space-y-4">
            <div class="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <i data-lucide="send" class="w-4 h-4 text-sky-500"></i>
              <span>การตั้งค่าแจ้งเตือน Telegram Bot</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Telegram Bot Token</label>
                <input type="text" id="setting-tg-token" value="${tgConfig.botToken}" placeholder="เช่น 123456789:ABCdefGhIJKlmNoPQ..."
                  class="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <span class="text-[11px] text-slate-400 mt-1 block">ขอรับได้ฟรีจาก @BotFather บน Telegram</span>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Telegram Chat ID / Group ID</label>
                <input type="text" id="setting-tg-chat" value="${tgConfig.chatId}" placeholder="เช่น -100123456789 หรือ 98765432"
                  class="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <span class="text-[11px] text-slate-400 mt-1 block">ID ผู้รับ หรือ ID กลุ่มที่ดึง Bot เข้าไป</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button onclick="App.testTelegramSend()" type="button"
                class="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
                <i data-lucide="bell-ring" class="w-3.5 h-3.5"></i>
                <span>ทดสอบส่งข้อความเข้า Telegram เดี๋ยวนี้</span>
              </button>
            </div>
          </div>

          <!-- COMPANY NAME -->
          <div class="pt-4 border-t border-slate-100 space-y-2">
            <label class="block text-xs font-semibold text-slate-700">ชื่อองค์กร / บริษัท</label>
            <input type="text" id="setting-company" value="${companyName}"
              class="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>

          <!-- SAVE BUTTON -->
          <div class="pt-4 border-t border-slate-100 flex justify-end">
            <button onclick="App.saveSystemSettings()" 
              class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>บันทึกการตั้งค่าทั้งหมด</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  toggleMockMode(isMock) {
    AppConfig.setMockMode(isMock);
    this.showToast(`เปลี่ยนเป็น ${isMock ? 'โหมดจำลอง (Mock Demo)' : 'โหมด Live GAS'} เรียบร้อย`, "info");
    this.renderMainLayout();
    this.refreshData();
  },

  async saveSystemSettings() {
    const gasUrl = document.getElementById("setting-gas-url").value;
    const tgToken = document.getElementById("setting-tg-token").value;
    const tgChat = document.getElementById("setting-tg-chat").value;
    const company = document.getElementById("setting-company").value;

    AppConfig.setGasUrl(gasUrl);
    AppConfig.setTelegramConfig(tgToken, tgChat);
    AppConfig.setCompanyName(company);

    this.showToast("บันทึกการตั้งค่าระบบเรียบร้อยแล้ว", "success");
    await this.refreshData();
  },

  async testTelegramSend() {
    const tgToken = document.getElementById("setting-tg-token").value;
    const tgChat = document.getElementById("setting-tg-chat").value;

    this.showLoading(true);
    const res = await TelegramHelper.testConnection(tgToken, tgChat);
    this.showLoading(false);

    if (res.success) {
      this.showToast(res.message, "success");
    } else {
      this.showToast(res.message, "error");
    }
  },

  // ==================================================================
  // MODALS & FORMS
  // ==================================================================
  openNewVehicleModal() {
    this.renderVehicleModal({
      vehicle_id: "",
      license_plate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      type: "กระบะ",
      department: "",
      current_mileage: 0,
      tax_expiry_date: "",
      act_expiry_date: "",
      insurance_expiry_date: "",
      status: "พร้อมใช้งาน",
      image_url: ""
    }, "เพิ่มรถยนต์คันใหม่");
  },

  openEditVehicleModal(vehicleId) {
    const v = this.vehicles.find(item => item.vehicle_id === vehicleId);
    if (!v) return;
    this.renderVehicleModal(v, "แก้ไขข้อมูลรถยนต์");
  },

  renderVehicleModal(v, title) {
    const container = document.getElementById("modal-container");
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
        <div class="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8 fade-in">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-800 text-lg">${title}</h3>
            <button onclick="App.closeAllModals()" class="text-slate-400 hover:text-slate-600 p-1">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="vehicle-form" class="space-y-4 mt-4">
            <input type="hidden" id="v-id" value="${v.vehicle_id || ''}">

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ทะเบียนรถ *</label>
                <input type="text" id="v-plate" required value="${v.license_plate || ''}" placeholder="เช่น 1กข-9999 กทม."
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ประเภทรถ</label>
                <select id="v-type" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="กระบะ" ${v.type === 'กระบะ' ? 'selected' : ''}>กระบะ</option>
                  <option value="เก๋ง" ${v.type === 'เก๋ง' ? 'selected' : ''}>เก๋ง</option>
                  <option value="ตู้" ${v.type === 'ตู้' ? 'selected' : ''}>ตู้</option>
                  <option value="SUV" ${v.type === 'SUV' ? 'selected' : ''}>SUV</option>
                  <option value="มอเตอร์ไซค์" ${v.type === 'มอเตอร์ไซค์' ? 'selected' : ''}>มอเตอร์ไซค์</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ยี่ห้อ *</label>
                <input type="text" id="v-brand" required value="${v.brand || ''}" placeholder="Toyota"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">รุ่น *</label>
                <input type="text" id="v-model" required value="${v.model || ''}" placeholder="Hilux Revo"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ปีจดทะเบียน</label>
                <input type="number" id="v-year" value="${v.year || new Date().getFullYear()}"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">แผนก / ผู้ดูแล</label>
                <input type="text" id="v-dept" value="${v.department || ''}" placeholder="ฝ่ายจัดส่ง"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">เลขไมล์ปัจจุบัน (กม.)</label>
                <input type="number" id="v-mileage" value="${v.current_mileage || 0}"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">วันหมดอายุภาษี</label>
                <input type="date" id="v-tax" value="${v.tax_expiry_date || ''}"
                  class="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">วันหมดอายุ พ.ร.บ.</label>
                <input type="date" id="v-act" value="${v.act_expiry_date || ''}"
                  class="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">วันหมดประกันภัย</label>
                <input type="date" id="v-ins" value="${v.insurance_expiry_date || ''}"
                  class="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">สถานะ</label>
                <select id="v-status" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="พร้อมใช้งาน" ${v.status === 'พร้อมใช้งาน' ? 'selected' : ''}>พร้อมใช้งาน</option>
                  <option value="ซ่อมบำรุง" ${v.status === 'ซ่อมบำรุง' ? 'selected' : ''}>ซ่อมบำรุง</option>
                  <option value="ปลดระวาง" ${v.status === 'ปลดระวาง' ? 'selected' : ''}>ปลดระวาง</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ลิงก์รูปภาพตัวรถ</label>
                <input type="url" id="v-img" value="${v.image_url || ''}" placeholder="https://..."
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onclick="App.closeAllModals()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                ยกเลิก
              </button>
              <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm">
                บันทึกข้อมูลรถยนต์
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    document.getElementById("vehicle-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        vehicle_id: document.getElementById("v-id").value,
        license_plate: document.getElementById("v-plate").value,
        type: document.getElementById("v-type").value,
        brand: document.getElementById("v-brand").value,
        model: document.getElementById("v-model").value,
        year: document.getElementById("v-year").value,
        department: document.getElementById("v-dept").value,
        current_mileage: document.getElementById("v-mileage").value,
        tax_expiry_date: document.getElementById("v-tax").value,
        act_expiry_date: document.getElementById("v-act").value,
        insurance_expiry_date: document.getElementById("v-ins").value,
        status: document.getElementById("v-status").value,
        image_url: document.getElementById("v-img").value
      };

      this.showLoading(true);
      const res = await Api.saveVehicle(payload);
      this.showLoading(false);

      if (res.success) {
        this.showToast(res.message, "success");
        this.closeAllModals();
        await this.refreshData();
      } else {
        this.showToast(res.message, "error");
      }
    });
  },

  openNewServiceModal(preselectedCarId = "") {
    const user = Auth.getCurrentUser();
    const today = new Date().toISOString().split("T")[0];
    const container = document.getElementById("modal-container");

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 fade-in">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-800 text-lg">บันทึกการซ่อมบำรุง / เช็คระยะ</h3>
            <button onclick="App.closeAllModals()" class="text-slate-400 hover:text-slate-600 p-1">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="service-form" class="space-y-4 mt-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">เลือกรถยนต์ *</label>
                <select id="s-vehicle" required class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="">-- เลือกรถยนต์ --</option>
                  ${this.vehicles.map(v => `
                    <option value="${v.vehicle_id}" ${v.vehicle_id === preselectedCarId ? 'selected' : ''}>
                      ${v.license_plate} (${v.brand} ${v.model})
                    </option>
                  `).join("")}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">วันที่เข้าซ่อม *</label>
                <input type="date" id="s-date" required value="${today}"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่งานซ่อม *</label>
                <select id="s-cat" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="เปลี่ยนน้ำมันเครื่อง">เปลี่ยนน้ำมันเครื่อง</option>
                  <option value="ยางรถยนต์">ยางรถยนต์</option>
                  <option value="ช่วงล่าง/เบรก">ช่วงล่าง/เบรก</option>
                  <option value="เช็คระยะตามรอบ">เช็คระยะตามรอบ</option>
                  <option value="แบตเตอรี่/ระบบไฟ">แบตเตอรี่/ระบบไฟ</option>
                  <option value="แอร์/ระบบความเย็น">แอร์/ระบบความเย็น</option>
                  <option value="ภาษี/พ.ร.บ./ประกัน">ภาษี/พ.ร.บ./ประกัน</option>
                  <option value="ทั่วไป/อื่นๆ">ทั่วไป/อื่นๆ</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">เลขไมล์ขณะเข้าซ่อม (กม.) *</label>
                <input type="number" id="s-odometer" required placeholder="เช่น 45000"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">หัวข้อรายการซ่อม *</label>
              <input type="text" id="s-title" required placeholder="เช่น เปลี่ยนน้ำมันเครื่อง 5W-30 + ไส้กรองแท้"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดเพิ่มเติม</label>
              <textarea id="s-desc" rows="2" placeholder="รายละเอียดรายการอะไหล่ หรือข้อสังเกตของช่าง..."
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ยอดค่าใช้จ่ายรวม (บาท) *</label>
                <input type="number" step="0.01" id="s-cost" required placeholder="0.00"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ศูนย์บริการ / อู่</label>
                <input type="text" id="s-center" placeholder="เช่น ศูนย์โตโยต้า พระราม 9"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <!-- NEXT SERVICE TARGET -->
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span class="text-xs font-bold text-slate-700 flex items-center gap-1">
                <i data-lucide="bell" class="w-3.5 h-3.5 text-blue-600"></i>
                เป้าหมายเช็คระยะรอบถัดไป (สำหรับแจ้งเตือน)
              </span>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] text-slate-500">เลขไมล์ถัดไป (กม.)</label>
                  <input type="number" id="s-next-mileage" placeholder="เช่น 55000"
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white">
                </div>
                <div>
                  <label class="block text-[11px] text-slate-500">วันที่ควรเช็คถัดไป</label>
                  <input type="date" id="s-next-date"
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white">
                </div>
              </div>
            </div>

            <!-- FILE UPLOAD (RECEIPT) -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">แนบรูปใบเสร็จ / บิลค่าซ่อม</label>
              <div class="flex items-center gap-3">
                <input type="file" id="s-file" accept="image/*" capture="environment" onchange="App.handleFileSelected(event)"
                  class="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                <div id="file-preview-thumb"></div>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onclick="App.closeAllModals()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                ยกเลิก
              </button>
              <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm">
                บันทึกและส่งแจ้งเตือน
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    document.getElementById("service-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        vehicle_id: document.getElementById("s-vehicle").value,
        service_date: document.getElementById("s-date").value,
        category: document.getElementById("s-cat").value,
        odometer: document.getElementById("s-odometer").value,
        title: document.getElementById("s-title").value,
        description: document.getElementById("s-desc").value,
        cost: document.getElementById("s-cost").value,
        service_center: document.getElementById("s-center").value,
        next_service_mileage: document.getElementById("s-next-mileage").value,
        next_service_date: document.getElementById("s-next-date").value,
        receipt_url: this.uploadedBase64 || "",
        recorded_by: user ? user.fullname : "พนักงาน"
      };

      this.showLoading(true);
      const res = await Api.saveServiceLog(payload);
      this.showLoading(false);

      if (res.success) {
        this.showToast(res.message, "success");
        this.uploadedBase64 = null;
        this.closeAllModals();
        await this.refreshData();
      } else {
        this.showToast(res.message, "error");
      }
    });
  },

  openNewFuelModal() {
    const user = Auth.getCurrentUser();
    const today = new Date().toISOString().split("T")[0];
    const container = document.getElementById("modal-container");

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8 fade-in">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-800 text-lg">บันทึกการเติมน้ำมัน</h3>
            <button onclick="App.closeAllModals()" class="text-slate-400 hover:text-slate-600 p-1">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="fuel-form" class="space-y-4 mt-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">เลือกรถยนต์ *</label>
              <select id="f-vehicle" required class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="">-- เลือกรถยนต์ --</option>
                ${this.vehicles.map(v => `
                  <option value="${v.vehicle_id}">${v.license_plate} (${v.brand} ${v.model})</option>
                `).join("")}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">วันที่เติม *</label>
                <input type="date" id="f-date" required value="${today}"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">เลขไมล์ปัจจุบัน (กม.) *</label>
                <input type="number" id="f-odometer" required placeholder="เช่น 45200"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ยอดเงินรวม (บาท) *</label>
                <input type="number" step="0.01" id="f-total" required placeholder="เช่น 1500"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-emerald-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ปริมาณ (ลิตร) *</label>
                <input type="number" step="0.01" id="f-liters" required placeholder="เช่น 42.5"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">สถานีบริการ / ปั๊ม</label>
              <input type="text" id="f-station" placeholder="เช่น ปตท. สาขาบางนา"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">แนบรูปใบเสร็จ / หัวจ่าย</label>
              <input type="file" id="f-file" accept="image/*" capture="environment" onchange="App.handleFileSelected(event)"
                class="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onclick="App.closeAllModals()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                ยกเลิก
              </button>
              <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm">
                บันทึกค่าน้ำมัน
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    document.getElementById("fuel-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        vehicle_id: document.getElementById("f-vehicle").value,
        fuel_date: document.getElementById("f-date").value,
        odometer: document.getElementById("f-odometer").value,
        total_amount: document.getElementById("f-total").value,
        liters: document.getElementById("f-liters").value,
        gas_station: document.getElementById("f-station").value,
        receipt_url: this.uploadedBase64 || "",
        recorded_by: user ? user.fullname : "พนักงาน"
      };

      this.showLoading(true);
      const res = await Api.saveFuelLog(payload);
      this.showLoading(false);

      if (res.success) {
        this.showToast(res.message, "success");
        this.uploadedBase64 = null;
        this.closeAllModals();
        await this.refreshData();
      } else {
        this.showToast(res.message, "error");
      }
    });
  },

  openNewBookingModal() {
    const user = Auth.getCurrentUser();
    const availableCars = this.vehicles.filter(v => v.status === "พร้อมใช้งาน");
    const container = document.getElementById("modal-container");

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 fade-in">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-800 text-lg">ส่งคำขอใช้รถ / จองรถบริษัท</h3>
            <button onclick="App.closeAllModals()" class="text-slate-400 hover:text-slate-600 p-1">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="booking-form" class="space-y-4 mt-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">เลือกรถยนต์ที่ต้องการขอใช้ *</label>
              <select id="b-vehicle" required class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="">-- เลือกรถยนต์ (เฉพาะรถที่พร้อมใช้) --</option>
                ${availableCars.map(v => `
                  <option value="${v.vehicle_id}">${v.license_plate} - ${v.brand} ${v.model} (${v.type})</option>
                `).join("")}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ชื่อผู้ขอใช้ *</label>
                <input type="text" id="b-name" required value="${user ? user.fullname : ''}"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">แผนก / ฝ่าย *</label>
                <input type="text" id="b-dept" required value="${user ? user.department : ''}"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">วันที่และเวลาเริ่มต้น *</label>
                <input type="datetime-local" id="b-start" required
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">วันที่และเวลาสิ้นสุด *</label>
                <input type="datetime-local" id="b-end" required
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <label class="block text-xs font-semibold text-slate-700 mb-1">สถานที่ปลายทาง *</label>
                <input type="text" id="b-dest" required placeholder="เช่น จ.ชลบุรี (นิคมอมตะ)"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ผู้โดยสาร (คน)</label>
                <input type="number" id="b-passengers" value="1" min="1"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">วัตถุประสงค์การใช้งาน *</label>
              <textarea id="b-purpose" required rows="2" placeholder="เช่น เดินทางไปพบลูกค้าเพื่อเสนอราคาโครงการ..."
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onclick="App.closeAllModals()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                ยกเลิก
              </button>
              <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm">
                ส่งคำขอจองรถ
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    document.getElementById("booking-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        vehicle_id: document.getElementById("b-vehicle").value,
        user_name: document.getElementById("b-name").value,
        department: document.getElementById("b-dept").value,
        start_datetime: document.getElementById("b-start").value.replace("T", " "),
        end_datetime: document.getElementById("b-end").value.replace("T", " "),
        destination: document.getElementById("b-dest").value,
        passenger_count: document.getElementById("b-passengers").value,
        purpose: document.getElementById("b-purpose").value
      };

      this.showLoading(true);
      const res = await Api.saveBooking(payload);
      this.showLoading(false);

      if (res.success) {
        this.showToast(res.message, "success");
        this.closeAllModals();
        await this.refreshData();
      } else {
        this.showToast(res.message, "error");
      }
    });
  },

  openReturnVehicleModal(bookingId, vehicleId, startOdo) {
    const container = document.getElementById("modal-container");
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
        <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 fade-in">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-800 text-base">บันทึกคืนรถและเลขไมล์</h3>
            <button onclick="App.closeAllModals()" class="text-slate-400 hover:text-slate-600 p-1">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="return-form" class="space-y-4 mt-4">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <div>เลขไมล์ก่อนไป: <b class="text-slate-800">${Number(startOdo).toLocaleString()} กม.</b></div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">เลขไมล์ตอนนำรถมาคืน (กม.) *</label>
              <input type="number" id="ret-odo" required min="${startOdo}" placeholder="เช่น ${Number(startOdo) + 50}"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onclick="App.closeAllModals()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                ยกเลิก
              </button>
              <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm">
                ยืนยันการคืนรถ
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    document.getElementById("return-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const endOdo = document.getElementById("ret-odo").value;

      this.showLoading(true);
      const res = await Api.updateBookingStatus(bookingId, "คืนรถแล้ว", "", endOdo);
      this.showLoading(false);

      if (res.success) {
        this.showToast(res.message, "success");
        this.closeAllModals();
        await this.refreshData();
      } else {
        this.showToast(res.message, "error");
      }
    });
  },

  viewVehicleTimeline(vehicleId) {
    const v = this.vehicles.find(item => item.vehicle_id === vehicleId);
    if (!v) return;

    const vServices = this.services.filter(s => s.vehicle_id === vehicleId);
    const vFuels = this.fuels.filter(f => f.vehicle_id === vehicleId);
    const vBookings = this.bookings.filter(b => b.vehicle_id === vehicleId);

    const totalServiceCost = vServices.reduce((a, b) => a + (Number(b.cost) || 0), 0);
    const totalFuelCost = vFuels.reduce((a, b) => a + (Number(b.total_amount) || 0), 0);

    const container = document.getElementById("modal-container");
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
        <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8 fade-in max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span class="text-xs text-blue-600 font-bold">${v.brand} ${v.model} (${v.year})</span>
              <h3 class="font-bold text-slate-800 text-lg">${v.license_plate}</h3>
            </div>
            <button onclick="App.closeAllModals()" class="text-slate-400 hover:text-slate-600 p-1">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <div class="py-4 overflow-y-auto space-y-4 flex-1">
            <!-- CAR SUMMARY STATS -->
            <div class="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span class="text-slate-400">เลขไมล์ปัจจุบัน:</span>
                <div class="font-bold text-slate-800 mt-0.5">${Number(v.current_mileage || 0).toLocaleString()} กม.</div>
              </div>
              <div>
                <span class="text-slate-400">ค่าซ่อมรวม:</span>
                <div class="font-bold text-blue-600 mt-0.5">${this.formatMoney(totalServiceCost)}</div>
              </div>
              <div>
                <span class="text-slate-400">ค่าน้ำมันรวม:</span>
                <div class="font-bold text-emerald-600 mt-0.5">${this.formatMoney(totalFuelCost)}</div>
              </div>
            </div>

            <!-- TIMELINE LIST -->
            <div>
              <h4 class="font-bold text-slate-800 text-sm mb-3">ประวัติการซ่อมบำรุง (${vServices.length} รายการ)</h4>
              <div class="space-y-2">
                ${vServices.map(s => `
                  <div class="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-start justify-between">
                    <div>
                      <div class="font-bold text-slate-800">${s.title}</div>
                      <div class="text-slate-500 mt-0.5">${s.service_date} • เลขไมล์ ${Number(s.odometer).toLocaleString()} กม. • ${s.service_center || 'ศูนย์บริการ'}</div>
                    </div>
                    <div class="text-right">
                      <span class="font-bold text-blue-600">${this.formatMoney(s.cost)}</span>
                      <span class="block text-[10px] text-slate-400 mt-0.5">${s.category}</span>
                    </div>
                  </div>
                `).join("") || '<p class="text-xs text-slate-400">ยังไม่มีประวัติการซ่อม</p>'}
              </div>
            </div>

            <div>
              <h4 class="font-bold text-slate-800 text-sm mb-3">ประวัติการเติมน้ำมัน (${vFuels.length} ครั้ง)</h4>
              <div class="space-y-2">
                ${vFuels.map(f => `
                  <div class="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-start justify-between">
                    <div>
                      <div class="font-bold text-slate-800">${f.gas_station || 'สถานีบริการ'}</div>
                      <div class="text-slate-500 mt-0.5">${f.fuel_date} • ${f.liters} ลิตร • เลขไมล์ ${Number(f.odometer).toLocaleString()} กม.</div>
                    </div>
                    <div class="font-bold text-emerald-600">${this.formatMoney(f.total_amount)}</div>
                  </div>
                `).join("") || '<p class="text-xs text-slate-400">ยังไม่มีประวัติเติมน้ำมัน</p>'}
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex justify-end">
            <button onclick="App.closeAllModals()" class="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  viewImageModal(imgUrl, title = "รูปภาพเอกสาร") {
    const container = document.getElementById("modal-container");
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
        <div class="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 fade-in">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="font-bold text-slate-800 text-sm">${title}</h3>
            <button onclick="App.closeAllModals()" class="text-slate-400 hover:text-slate-600 p-1">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
          <div class="mt-3 overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center max-h-[75vh]">
            <img src="${imgUrl}" alt="${title}" class="w-full h-auto object-contain max-h-[70vh]">
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  handleFileSelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedBase64 = e.target.result;
      const previewEl = document.getElementById("file-preview-thumb");
      if (previewEl) {
        previewEl.innerHTML = `
          <img src="${this.uploadedBase64}" class="w-8 h-8 rounded-lg object-cover border border-blue-400">
        `;
      }
    };
    reader.readAsDataURL(file);
  },

  closeAllModals() {
    const container = document.getElementById("modal-container");
    if (container) container.innerHTML = "";
    this.uploadedBase64 = null;
  },

  // ==================================================================
  // UTILITY HELPERS
  // ==================================================================
  formatMoney(num) {
    if (num === null || num === undefined || isNaN(num)) return "0.00 ฿";
    return Number(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ฿";
  },

  showLoading(isLoading) {
    let loader = document.getElementById("app-loader");
    if (isLoading) {
      if (!loader) {
        loader = document.createElement("div");
        loader.id = "app-loader";
        loader.className = "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm";
        loader.innerHTML = `
          <div class="bg-white p-5 rounded-2xl shadow-xl flex items-center gap-3">
            <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs font-semibold text-slate-700">กำลังประมวลผล...</span>
          </div>
        `;
        document.body.appendChild(loader);
      }
    } else {
      if (loader) loader.remove();
    }
  },

  showToast(message, type = "info") {
    let toast = document.createElement("div");
    const bg = type === "success" ? "bg-emerald-600 text-white" :
               type === "error" ? "bg-rose-600 text-white" : "bg-slate-800 text-white";

    toast.className = `fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-medium flex items-center gap-2 ${bg} fade-in`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3500);
  },

  exportToCsv(type) {
    let rows = [];
    let filename = `car_service_${type}_${new Date().toISOString().split('T')[0]}.csv`;

    if (type === "services") {
      rows.push(["วันที่", "ทะเบียนรถ", "หมวดหมู่", "รายการ", "เลขไมล์", "ค่าใช้จ่าย", "ศูนย์บริการ", "ผู้บันทึก"]);
      this.services.forEach(s => {
        const car = this.vehicles.find(v => v.vehicle_id === s.vehicle_id);
        rows.push([
          s.service_date,
          car ? car.license_plate : s.vehicle_id,
          s.category,
          `"${(s.title || '').replace(/"/g, '""')}"`,
          s.odometer,
          s.cost,
          `"${(s.service_center || '').replace(/"/g, '""')}"`,
          s.recorded_by
        ]);
      });
    } else if (type === "fuels") {
      rows.push(["วันที่", "ทะเบียนรถ", "เลขไมล์", "ปริมาณลิตร", "ยอดเงิน", "ปั๊มน้ำมัน", "ผู้บันทึก"]);
      this.fuels.forEach(f => {
        const car = this.vehicles.find(v => v.vehicle_id === f.vehicle_id);
        rows.push([
          f.fuel_date,
          car ? car.license_plate : f.vehicle_id,
          f.odometer,
          f.liters,
          f.total_amount,
          `"${(f.gas_station || '').replace(/"/g, '""')}"`,
          f.recorded_by
        ]);
      });
    }

    const csvContent = "\uFEFF" + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast(`ส่งออกไฟล์ ${filename} สำเร็จ`, "success");
  }
};

// Initialize Application when DOM ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

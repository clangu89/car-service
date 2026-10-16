# 🚗 ระบบบริหารจัดการและดูแลรักษารถยนต์ของบริษัท (Corporate Car Fleet & Maintenance)

เว็บแอปพลิเคชันจัดการทะเบียนรถ บันทึกการซ่อมบำรุง/เช็คระยะ ค่าน้ำมันเชื้อเพลิง การขอใช้รถ/เบิกรถ พร้อมระบบแจ้งเตือนผ่าน **Telegram Bot** อัตโนมัติ โดยใช้ **Google Sheets** เป็นฐานข้อมูล, **Google Apps Script** เป็น Backend API และโฮสต์บน **GitHub Pages**

🌐 **เปิดใช้งานเว็บไซต์จริงได้ที่:** [https://clangu89.github.io/car-service/](https://clangu89.github.io/car-service/)  
📦 **GitHub Repository:** [https://github.com/clangu89/car-service](https://github.com/clangu89/car-service)

---

## ✨ ฟังก์ชันเด่นของระบบ

1. **ทะเบียนรถยนต์บริษัท (Vehicle Fleet Registry)**
   - จัดการข้อมูลรถ ทะเบียน ยี่ห้อ รุ่น ปี แผนกผู้รับผิดชอบ และรูปภาพตัวรถ
   - ติดตามเลขไมล์ปัจจุบัน และสถานะรถ (พร้อมใช้งาน / ซ่อมบำรุง / ปลดระวาง)
   - แจ้งเตือนวันหมดอายุ **ภาษีประจำปี, พ.ร.บ. และ ประกันภัย** ล่วงหน้า 30 วัน (มีแถบสีเตือนชัดเจน)
2. **ประวัติการซ่อมบำรุงและเช็คระยะ (Service & Maintenance Logs)**
   - บันทึกการเปลี่ยนถ่ายน้ำมันเครื่อง เปลี่ยนยาง เบรก เช็คระยะ และอะไหล่ต่างๆ
   - บันทึกยอดเงิน ศูนย์บริการ/อู่ที่เข้าซ่อม และเลขไมล์ที่ต้องเข้าตรวจเช็คครั้งถัดไป
   - แนบรูปถ่ายใบเสร็จ / บิลค่าซ่อม / สภาพรถ เก็บลง Google Drive โดยอัตโนมัติ
3. **บันทึกการเติมน้ำมัน (Fuel Logs)**
   - บันทึกวันที่ ปริมาณลิตร ยอดเงิน ปั๊มน้ำมัน และเลขไมล์
   - คำนวณราคาเฉลี่ยต่อลิตร และสถิติการใช้น้ำมันของรถแต่ละคัน
4. **ระบบขอใช้รถ / เบิกรถ (Vehicle Booking)**
   - พนักงานส่งคำขอจองรถ ระบุวันเวลา ปลายทาง วัตถุประสงค์ และผู้โดยสาร
   - ผู้ดูแลระบบ (Admin) ตรวจสอบและอนุมัติผ่านหน้าเว็บ
   - บันทึกเลขไมล์ขากลับเมื่อนำรถมาคืน พร้อมคำนวณระยะทางที่ใช้งานจริง
5. **การแจ้งเตือนผ่าน Telegram Bot**
   - ส่งแจ้งเตือนอัตโนมัติทุกเช้า 08:00 น. หากมีรถที่ภาษี/พ.ร.บ./ประกัน หรือรอบเช็คระยะใกล้หมดอายุ
   - แจ้งเตือนทันทีเมื่อมีคำขอใช้รถใหม่เข้ามา
   - แจ้งเตือนทันทีเมื่อมีการบันทึกงานซ่อมบำรุงใหม่
   - มีปุ่มทดสอบส่งข้อความเข้า Telegram จากหน้าตั้งค่าได้ทันที
6. **ระบบสิทธิ์ผู้ใช้งาน (Role-Based Authentication)**
   - **Admin (ผู้ดูแลระบบ):** จัดการรถยนต์ อนุมัติการจองรถ ตั้งค่า Telegram และตั้งค่าระบบ
   - **Driver (คนขับรถ):** บันทึกการซ่อมบำรุง เติมน้ำมัน และคืนรถ
   - **Staff (พนักงานทั่วไป):** ดูข้อมูลรถ และส่งคำขอจองรถ

---

## 📁 โครงสร้างโปรเจกต์

```text
Car Service/
├── index.html                   # หน้าเว็บแอปพลิเคชันหลัก (SPA)
├── css/
│   └── style.css                # สไตล์ฟอนต์ภาษาไทย Prompt และแอนิเมชัน
├── js/
│   ├── config.js                # จัดการ LocalStorage และค่าคอนฟิก
│   ├── mockData.js              # ข้อมูลจำลองสำหรับทดสอบระบบทันที (Demo Mode)
│   ├── api.js                   # API Client (bypass CORS ผ่าน Content-Type text/plain)
│   ├── auth.js                  # ระบบตรวจสอบสิทธิ์พนักงาน (Admin, Driver, Staff)
│   ├── telegram.js              # ตัวช่วยทดสอบเชื่อมต่อ Telegram Bot
│   └── app.js                   # Logic จัดการ UI, Routing, Charts, Modals และฟอร์ม
├── backend/
│   ├── Setup.gs                 # สคริปต์สร้างตาราง Google Sheets และ Daily Trigger อัตโนมัติ
│   ├── Code.gs                  # Google Apps Script Web App REST API Router
│   ├── Telegram.gs              # โมดูลส่งการแจ้งเตือน Telegram Bot
│   └── appsscript.json          # สิทธิ์การเข้าถึง Google Workspace (OAuth Scopes)
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions Deploy ขึ้น GitHub Pages อัตโนมัติ
└── README.md                    # คู่มือการติดตั้งและใช้งานระบบ
```

---

## 🚀 ขั้นตอนการติดตั้งและเชื่อมต่อระบบ (Step-by-Step)

### ขั้นตอนที่ 1: เตรียม Google Sheets และ Google Apps Script
1. ไปที่ [Google Sheets](https://sheets.new) เพื่อสร้างสเปรดชีตใหม่ ตั้งชื่อว่า **"ระบบดูแลรักษารถยนต์บริษัท"**
2. ไปที่เมนู **ส่วนขยาย (Extensions)** > **Apps Script**
3. สร้างไฟล์และคัดลอกโค้ดจากโฟลเดอร์ `backend/` ไปวาง:
   - นำโค้ดจาก `backend/Setup.gs` ไปวาง
   - สร้างไฟล์สคริปต์ใหม่ชื่อ `Code.gs` และนำโค้ดจาก `backend/Code.gs` ไปวาง
   - สร้างไฟล์สคริปต์ใหม่ชื่อ `Telegram.gs` และนำโค้ดจาก `backend/Telegram.gs` ไปวาง
   - ไปที่ **การตั้งค่าโปรเจกต์ (Project Settings ⚙️)** > ติ๊กเลือก **"แสดงไฟล์ Manifest appsscript.json ในตัวแก้ไข"** จากนั้นนำเนื้อหาจาก `backend/appsscript.json` ไปแทนที่
4. ในหน้าต่าง Apps Script ให้เลือกฟังก์ชัน **`setupDatabase`** ด้านบน แล้วกดปุ่ม **เรียกใช้ (Run)**:
   - กดยินยอมสิทธิ์การเข้าถึง (Authorize) ในครั้งแรก
   - สคริปต์จะสร้างตาราง `Vehicles`, `ServiceLogs`, `FuelLogs`, `Bookings`, `Users`, `Settings` พร้อมข้อมูลตัวอย่างและตั้ง Trigger แจ้งเตือนเวลา 08:00 น. ให้อัตโนมัติ!

---

### ขั้นตอนที่ 2: สร้างและตั้งค่า Telegram Bot
1. เปิดแอป Telegram ค้นหาบัญชี **@BotFather**
2. พิมพ์คำสั่ง `/newbot` จากนั้นตั้งชื่อบอทและ username ของบอท (ต้องลงท้ายด้วย `bot` เช่น `MyCompanyCarAlert_bot`)
3. @BotFather จะส่ง **HTTP API Token** มาให้ (เช่น `123456789:ABCdefGhIJKlmNoPQ...`) ให้คัดลอกเก็บไว้
4. กดเข้าไปคุยกับบอทที่เพิ่งสร้าง แล้วกดปุ่ม **Start**
5. หากต้องการให้แจ้งเตือนเข้ากลุ่ม ให้ดึงบอทเข้ากลุ่มของฝ่ายยานพาหนะ
6. หาค่า **Chat ID**:
   - พิมพ์ค้นหาบอท **@userinfobot** ใน Telegram เพื่อดู ID ของตัวท่านเอง หรือดึง **@RawDataBot** เข้ากลุ่มเพื่อดู ID ของกลุ่ม (Chat ID ของกลุ่มมักขึ้นต้นด้วยเครื่องหมายลบ เช่น `-100xxxxxxxxx`)

---

### ขั้นตอนที่ 3: เผยแพร่ Web App (Deploy Google Apps Script)
1. ในหน้า Google Apps Script Editor กดปุ่ม **การทำให้ใช้งานได้ (Deploy)** มุมบนขวา > เลือก **การทำให้ใช้งานได้รายการใหม่ (New deployment)**
2. คลิกไอคอนรูปฟันเฟือง ⚙️ ด้านซ้าย > เลือก **เว็บแอป (Web app)**
3. ตั้งค่าดังนี้:
   - **คำอธิบาย (Description):** `Car Service API v1`
   - **ดำเนินการในฐานะ (Execute as):** `ฉัน (อีเมลของคุณ)`
   - **ผู้ที่มีสิทธิ์เข้าถึง (Who has access):** `ทุกคน (Anyone)` *(สำคัญมาก)*
4. กด **ทำให้ใช้งานได้ (Deploy)** และคัดลอก **URL ของเว็บแอป (Web App URL)** ที่ลงท้ายด้วย `/exec`

---

### ขั้นตอนที่ 4: นำโปรเจกต์ขึ้น GitHub Pages (clangu89)
1. ไปที่ GitHub ของท่าน (`clangu89`) สร้าง New Repository เช่น `car-service` หรือ `car-maintenance` (ตั้งเป็น Public)
2. อัปโหลดหรือ Push โค้ดในโฟลเดอร์นี้ขึ้น Repository:
   ```bash
   git add .
   git commit -m "feat: initial corporate car maintenance web application"
   git branch -M main
   git remote add origin https://github.com/clangu89/<repo-name>.git
   git push -u origin main
   ```
3. ไปที่หน้า Repository บน GitHub > ไปที่แท็บ **Settings** > เมนู **Pages** ทางซ้าย:
   - ในส่วน **Build and deployment > Source**: เลือก **GitHub Actions**
   - GitHub Actions workflow ที่เราสร้างไว้ใน `.github/workflows/deploy.yml` จะทำการ Deploy ให้โดยอัตโนมัติภายใน 1-2 นาที
4. เมื่อเสร็จสิ้น หน้าเว็บของคุณจะเปิดใช้งานได้ที่:
   ```
   https://clangu89.github.io/<repo-name>/
   ```

---

### ขั้นตอนที่ 5: เชื่อมต่อ Web App และเปิดใช้งาน
1. เปิดหน้าเว็บที่ Deploy บน GitHub Pages
2. กดปุ่มทดสอบระบบด้วยบัญชี **ผู้ดูแลระบบ (Admin)**
3. ไปที่เมนู **ตั้งค่า & Telegram**:
   - วาง **Google Apps Script Web App URL** ที่ได้จากขั้นตอนที่ 3
   - วาง **Telegram Bot Token** และ **Chat ID**
   - กดปุ่ม **"ทดสอบส่งข้อความเข้า Telegram เดี๋ยวนี้"** บอทจะส่งข้อความแจ้งเตือนเข้า Telegram ทันที
   - สลับปุ่มโหมดข้อมูลเป็น **"เชื่อมต่อ GAS Live"** และกด **"บันทึกการตั้งค่าทั้งหมด"**
4. ระบบพร้อมใช้งานอย่างสมบูรณ์แบบ ทั้งบนคอมพิวเตอร์และมือถือของพนักงาน!

---

## 👥 บัญชีผู้ใช้งานเริ่มต้น (Seed Users)

| ชื่อผู้ใช้ (Username) | รหัสผ่าน (Password) | บทบาท (Role) | สิทธิ์การเข้าถึง |
|---|---|---|---|
| `admin` | `admin1234` | ผู้ดูแลระบบ (Admin) | เพิ่ม/แก้ไขรถ, อนุมัติการจอง, ตั้งค่า Telegram และตั้งค่าระบบ |
| `driver1` | `driver1234` | คนขับรถ (Driver) | บันทึกซ่อมบำรุง, เติมน้ำมัน, คืนรถ และดูรายการรถ |
| `staff1` | `staff1234` | พนักงาน (Staff) | ส่งคำขอจองรถ และดูสถานะรถ |

*(ท่านสามารถเพิ่มหรือแก้ไขพนักงานได้โดยตรงในแท็บ `Users` บน Google Sheets)*

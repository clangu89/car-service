/**
 * ====================================================================
 * ระบบบริหารจัดการและดูแลรักษารถยนต์ของบริษัท (Corporate Car Service)
 * ไฟล์: js/mockData.js - ข้อมูลจำลองสำหรับทดสอบระบบ (Offline/Demo Mode)
 * ====================================================================
 */

const MockDatabase = {
  vehicles: [
    {
      vehicle_id: "CAR-001",
      license_plate: "1กข-9999 กทม.",
      brand: "Toyota",
      model: "Hilux Revo 2.4 Entry",
      year: 2022,
      type: "กระบะ",
      department: "ฝ่ายจัดส่งและคลังสินค้า",
      current_mileage: 45200,
      tax_expiry_date: "2026-11-20",
      act_expiry_date: "2026-11-20",
      insurance_expiry_date: "2026-12-15",
      status: "พร้อมใช้งาน",
      image_url: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=600&auto=format&fit=crop&q=80",
      updated_at: "2026-10-15 14:00"
    },
    {
      vehicle_id: "CAR-002",
      license_plate: "ฮภ-5544 กทม.",
      brand: "Toyota",
      model: "Commuter 2.8 Van",
      year: 2021,
      type: "ตู้",
      department: "ฝ่ายบริหารและบุคคล",
      current_mileage: 68500,
      tax_expiry_date: "2026-10-28", // ใกล้หมดในไม่กี่วัน
      act_expiry_date: "2026-10-28",
      insurance_expiry_date: "2026-11-10",
      status: "พร้อมใช้งาน",
      image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
      updated_at: "2026-10-14 11:30"
    },
    {
      vehicle_id: "CAR-003",
      license_plate: "3ขค-1234 กทม.",
      brand: "Honda",
      model: "City e:HEV RS",
      year: 2023,
      type: "เก๋ง",
      department: "ฝ่ายขายและการตลาด",
      current_mileage: 28400,
      tax_expiry_date: "2027-02-15",
      act_expiry_date: "2027-02-15",
      insurance_expiry_date: "2027-02-15",
      status: "พร้อมใช้งาน",
      image_url: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600&auto=format&fit=crop&q=80",
      updated_at: "2026-10-12 09:15"
    },
    {
      vehicle_id: "CAR-004",
      license_plate: "2ฒณ-8877 กทม.",
      brand: "Isuzu",
      model: "D-Max Spacecab 1.9",
      year: 2020,
      type: "กระบะ",
      department: "ฝ่ายช่างและบริการสนาม",
      current_mileage: 92100,
      tax_expiry_date: "2026-10-10", // ขาดแล้ว!
      act_expiry_date: "2026-10-10",
      insurance_expiry_date: "2026-11-05",
      status: "ซ่อมบำรุง",
      image_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
      updated_at: "2026-10-12 16:45"
    }
  ],

  serviceLogs: [
    {
      log_id: "SRV-202610-001",
      vehicle_id: "CAR-001",
      service_date: "2026-09-10",
      odometer: 40000,
      category: "เปลี่ยนน้ำมันเครื่อง",
      title: "เปลี่ยนน้ำมันเครื่องสังเคราะห์แท้ 5W-30 + ไส้กรองแท้",
      description: "เช็คระบบเบรก เติมน้ำยาหล่อเย็น และตรวจเช็คแรงดันลมยาง 4 ล้อ",
      cost: 2450.00,
      service_center: "ศูนย์โตโยต้า พระราม 9",
      next_service_mileage: 50000,
      next_service_date: "2027-03-10",
      receipt_url: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80",
      recorded_by: "นายสมศักดิ์ ขับรถดี",
      created_at: "2026-09-10 14:30"
    },
    {
      log_id: "SRV-202610-002",
      vehicle_id: "CAR-002",
      service_date: "2026-08-20",
      odometer: 65000,
      category: "ยางรถยนต์",
      title: "เปลี่ยนยางรถยนต์ Bridgestone Duravis 4 เส้น",
      description: "ถ่วงล้อ 4 ล้อ และตั้งศูนย์ล้อหน้า-หลัง",
      cost: 14800.00,
      service_center: "บี-ควิก สาขาศรีนครินทร์",
      next_service_mileage: 105000,
      next_service_date: "2028-08-20",
      receipt_url: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80",
      recorded_by: "นายประสิทธิ์ มั่นคง",
      created_at: "2026-08-20 16:00"
    },
    {
      log_id: "SRV-202610-003",
      vehicle_id: "CAR-004",
      service_date: "2026-10-12",
      odometer: 92000,
      category: "ช่วงล่าง/เบรก",
      title: "เปลี่ยนผ้าเบรกหน้า-หลัง และเจียรจานเบรกคู่หน้า",
      description: "เปลี่ยนลูกหมากปีกนกหน้าขวามีเสียงดัง และเปลี่ยนน้ำมันเบรก DOT4",
      cost: 6900.00,
      service_center: "อู่เจริญชัย การช่าง",
      next_service_mileage: 110000,
      next_service_date: "2027-04-12",
      receipt_url: "",
      recorded_by: "นายวิชัย ซ่อมเก่ง",
      created_at: "2026-10-12 17:30"
    }
  ],

  fuelLogs: [
    {
      fuel_id: "FUEL-202610-001",
      vehicle_id: "CAR-001",
      fuel_date: "2026-10-14",
      odometer: 45200,
      liters: 52.40,
      total_amount: 1750.00,
      price_per_liter: 33.40,
      gas_station: "ปตท. สาขาบางนา กม.4",
      receipt_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
      recorded_by: "นายสมศักดิ์ ขับรถดี",
      created_at: "2026-10-14 18:20"
    },
    {
      fuel_id: "FUEL-202610-002",
      vehicle_id: "CAR-003",
      fuel_date: "2026-10-15",
      odometer: 28400,
      liters: 35.00,
      total_amount: 1380.00,
      price_per_liter: 39.43,
      gas_station: "บางจาก พระราม 4",
      receipt_url: "",
      recorded_by: "นางสาวนิตยา สดใส",
      created_at: "2026-10-15 08:45"
    },
    {
      fuel_id: "FUEL-202610-003",
      vehicle_id: "CAR-002",
      fuel_date: "2026-10-11",
      odometer: 68100,
      liters: 60.00,
      total_amount: 2000.00,
      price_per_liter: 33.33,
      gas_station: "Shell สาขาสุขุมวิท 62",
      receipt_url: "",
      recorded_by: "นายประสิทธิ์ มั่นคง",
      created_at: "2026-10-11 19:10"
    }
  ],

  bookings: [
    {
      booking_id: "BKG-202610-001",
      vehicle_id: "CAR-003",
      user_name: "นางสาวนิตยา สดใส",
      department: "ฝ่ายขาย",
      destination: "จ.ชลบุรี (นิคมอุตสาหกรรมอมตะซิตี้)",
      purpose: "เข้าพบลูกค้าเพื่อเสนอราคาโครงการใหม่ Q4",
      passenger_count: 3,
      start_datetime: "2026-10-17 08:30",
      end_datetime: "2026-10-17 18:00",
      status: "อนุมัติแล้ว",
      start_odometer: 28400,
      end_odometer: 0,
      approved_by: "ผู้จัดการฝ่ายยานพาหนะ",
      created_at: "2026-10-15 10:00"
    },
    {
      booking_id: "BKG-202610-002",
      vehicle_id: "CAR-002",
      user_name: "นายสมชาย ใจเย็น",
      department: "ฝ่ายบุคคล",
      destination: "ศูนย์การประชุมแห่งชาติสิริกิติ์",
      purpose: "รับส่งวิทยากรและผู้บริหารงานสัมมนาประจำปี",
      passenger_count: 10,
      start_datetime: "2026-10-19 07:30",
      end_datetime: "2026-10-19 19:00",
      status: "รออนุมัติ",
      start_odometer: 68500,
      end_odometer: 0,
      approved_by: "",
      created_at: "2026-10-16 09:30"
    },
    {
      booking_id: "BKG-202610-003",
      vehicle_id: "CAR-001",
      user_name: "นายสมศักดิ์ ขับรถดี",
      department: "ฝ่ายจัดส่ง",
      destination: "ศูนย์กระจายสินค้า วังน้อย จ.อยุธยา",
      purpose: "ส่งมอบสินค้าด่วนล็อตพิเศษ",
      passenger_count: 2,
      start_datetime: "2026-10-13 09:00",
      end_datetime: "2026-10-13 17:30",
      status: "คืนรถแล้ว",
      start_odometer: 44950,
      end_odometer: 45200,
      approved_by: "ผู้จัดการฝ่ายยานพาหนะ",
      created_at: "2026-10-12 11:20"
    }
  ],

  users: [
    {
      user_id: "USR-001",
      username: "admin",
      password: "admin1234",
      fullname: "ผู้ดูแลระบบยานพาหนะ",
      department: "ฝ่ายบริหารยานพาหนะ",
      phone: "081-999-8888",
      role: "admin",
      status: "active"
    },
    {
      user_id: "USR-002",
      username: "driver1",
      password: "driver1234",
      fullname: "นายสมศักดิ์ ขับรถดี",
      department: "ฝ่ายจัดส่งและโลจิสติกส์",
      phone: "082-111-2222",
      role: "driver",
      status: "active"
    },
    {
      user_id: "USR-003",
      username: "staff1",
      password: "staff1234",
      fullname: "นางสาวนิตยา สดใส",
      department: "ฝ่ายขายและการตลาด",
      phone: "083-333-4444",
      role: "staff",
      status: "active"
    }
  ]
};

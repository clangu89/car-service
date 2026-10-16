/**
 * ====================================================================
 * ระบบบริหารจัดการและดูแลรักษารถยนต์ของบริษัท (Corporate Car Service)
 * ไฟล์: js/telegram.js - ผู้ช่วยจัดรูปแบบและทดสอบส่ง Telegram Bot
 * ====================================================================
 */

const TelegramHelper = {
  /**
   * ทดสอบส่งข้อความไปยัง Telegram
   */
  async testConnection(botToken, chatId) {
    if (!botToken || !chatId) {
      return { success: false, message: "กรุณาระบุทั้ง Telegram Bot Token และ Chat ID" };
    }

    // หากเปิด Mock Mode หรือต้องการทดสอบโดยตรงจาก Browser
    if (AppConfig.isMockMode()) {
      try {
        const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId.trim(),
            text: "🚗 <b>Corporate Car Service</b>\n━━━━━━━━━━━━━━━━━━\n✅ <b>ทดสอบการเชื่อมต่อ Telegram Bot สำเร็จ!</b>\nยินดีด้วยครับ ระบบแจ้งเตือนภาษี/พ.ร.บ./งานซ่อม พร้อมใช้งานแล้วครับ",
            parse_mode: "HTML"
          })
        });
        const json = await res.json();
        if (json.ok) {
          return { success: true, message: "ส่งข้อความทดสอบเข้า Telegram เรียบร้อยแล้ว!" };
        } else {
          return { success: false, message: `Telegram Error: ${json.description}` };
        }
      } catch (err) {
        return { success: false, message: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}` };
      }
    }

    // หากเชื่อมต่อผ่าน GAS Backend
    return Api.testTelegram(botToken, chatId);
  }
};

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const adminId = process.env.ADMIN_ID;
const adminPhone = process.env.ADMIN_PHONE || '+998 90 123 45 67';
const availableTime = process.env.AVAILABLE_TIME || 'Dushanba - Juma, 09:00 - 18:00';

if (!token) {
    console.error('BOT_TOKEN topilmadi! .env faylini tekshiring.');
    process.exit(1);
}

if (!adminId) {
    console.error('ADMIN_ID topilmadi! .env faylini tekshiring.');
    process.exit(1);
}

// Botni ishga tushirish
const bot = new TelegramBot(token, { polling: true });

console.log('Bot muvaffaqiyatli ishga tushdi...');

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Start komandasi uchun
    if (text === '/start') {
        const welcomeMessage = `Assalomu alaykum, ${msg.from.first_name}!\n\nBiz bilan bog'langaningizdan xursandmiz. Siz o'z savollaringiz yoki xabaringizni shu yerda qoldirishingiz mumkin. Murojaatingiz tez orada ko'rib chiqiladi.\n\n📞 <b>Aloqa uchun raqam:</b> ${adminPhone}\n🕒 <b>Javob berish vaqtlari:</b> ${availableTime}`;
        
        await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' });
        return;
    }

    // Foydalanuvchi o'z ID sini bilib olishi uchun
    if (text === '/myid') {
        await bot.sendMessage(chatId, `Sizning Telegram ID raqamingiz: <b>${msg.from.id}</b>\n\n(Shu raqamni nusxalab, .env faylidagi ADMIN_ID ga yozing)`, { parse_mode: 'HTML' });
        return;
    }

    // Admin o'ziga kelgan xabarga 'Reply' orqali javob berganda
    if (chatId.toString() === adminId.toString() && msg.reply_to_message) {
        let repliedToText = msg.reply_to_message.text || msg.reply_to_message.caption || '';
        
        // Asl foydalanuvchi ID sini qidirish
        let match = repliedToText.match(/ID:\s*(\d+)/);
        
        if (match && match[1]) {
            const userId = match[1];
            try {
                // Admin yuborgan xabarni (matn, rasm, video va hokazo) nusxalab foydalanuvchiga yuborish
                await bot.copyMessage(userId, chatId, msg.message_id);
                await bot.sendMessage(chatId, "✅ Javobingiz foydalanuvchiga yetkazildi!");
            } catch (error) {
                console.error("Foydalanuvchiga xabar yuborishda xatolik: ", error);
                await bot.sendMessage(chatId, "❌ Xabar yuborishda xatolik yuz berdi. Foydalanuvchi botni bloklagan bo'lishi mumkin.");
            }
        } else {
            await bot.sendMessage(chatId, "⚠️ Men bu xabar qaysi foydalanuvchiga tegishli ekanligini aniqlay olmadim. Iltimos, faqat tepasida foydalanuvchi ID si bor xabarlarga reply qilib javob yozing.");
        }
        return;
    }

    // Agar oddiy foydalanuvchi xabar yozsa va u admin bo'lmasa yoki admin reply qilmagan bo'lsa
    // Xabarni adminga yuborish
    if (chatId.toString() !== adminId.toString()) {
        try {
            const userLink = msg.from.username ? `\n🔗 Username: @${msg.from.username}` : '';
            const userInfoMsg = `📩 <b>Yangi xabar:</b>\n👤 Kimdan: ${msg.from.first_name} ${msg.from.last_name ? msg.from.last_name : ''}${userLink}\n🆔 ID: ${msg.from.id}`;
            
            if (msg.text) {
                await bot.sendMessage(adminId, `${userInfoMsg}\n\n💬 Xabar: ${msg.text}`, { parse_mode: 'HTML' });
            } else {
                // Rasm, video, audio, sticker kabi fayllarni jo'natganda
                const captionMsg = `${userInfoMsg}\n\n👆 Ilova qilingan fayl yoki xabar`;
                await bot.copyMessage(adminId, chatId, msg.message_id, { 
                    caption: captionMsg,
                    parse_mode: 'HTML'
                });
            }
            
            // Foydalanuvchiga xabar qabul qilinganligini bildirish (ixtiyoriy)
            // await bot.sendMessage(chatId, "✅ Xabaringiz qabul qilindi. Tez orada javob beramiz.");
        } catch (error) {
            console.error("Adminga xabarni yetkazishda xatolik: ", error);
        }
    }
});

// Xatolar uchun log
bot.on("polling_error", (err) => console.log(err));

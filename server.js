const { fork } = require('child_process');
const http = require('http');

console.log('Master server ishga tushmoqda...');

// 1-chi botni ishga tushirish (Asosiy bot)
// Agar Renderda BOT_TOKEN_1 o'zgaruvchisi kiritilgan bo'lsa, shuni ishlatadi
const bot1 = fork('index.js', [], {
  env: { ...process.env, BOT_TOKEN: process.env.BOT_TOKEN_1 || process.env.BOT_TOKEN, PORT: 3001 }
});

// 2-chi botni ishga tushirish (Anonim bot)
// Agar Renderda BOT_TOKEN_2 o'zgaruvchisi kiritilgan bo'lsa, shuni ishlatadi
const bot2 = fork('anonim_bot/index.js', [], {
  env: { ...process.env, BOT_TOKEN: process.env.BOT_TOKEN_2 || process.env.BOT_TOKEN, PORT: 3002 }
});

// Render xato bermasligi uchun asosiy veb-server
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Ikkala bot ham bitta joyda 24/7 muvaffaqiyatli ishlamoqda!');
}).listen(PORT, () => {
    console.log(`Render uchun veb-server ${PORT}-portda ishga tushdi.`);
});

// Xatoliklarni ushlab turish
bot1.on('error', (err) => console.error('Bot 1 da xato:', err));
bot2.on('error', (err) => console.error('Bot 2 da xato:', err));

bot1.on('exit', (code) => console.log(`Bot 1 to'xtab qoldi (xato kodi: ${code})`));
bot2.on('exit', (code) => console.log(`Bot 2 to'xtab qoldi (xato kodi: ${code})`));

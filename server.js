const { fork } = require('child_process');
const http = require('http');

console.log('Master server ishga tushmoqda...');

// Botlarni avtomatik qayta ishga tushiruvchi funksiya
function startBot(scriptPath, envToken, port) {
    const env = { ...process.env, BOT_TOKEN: process.env[envToken] || process.env.BOT_TOKEN, PORT: port };
    let botProcess = fork(scriptPath, [], { env });

    botProcess.on('error', (err) => {
        console.error(`${scriptPath} da xato:`, err);
    });

    botProcess.on('exit', (code) => {
        console.log(`⚠️ DIQQAT: ${scriptPath} to'xtab qoldi (xato kodi: ${code}). 5 soniyadan keyin avtomatik qayta ishga tushiriladi...`);
        setTimeout(() => {
            startBot(scriptPath, envToken, port);
        }, 5000);
    });

    return botProcess;
}

// 1-chi botni ishga tushirish (Asosiy bot)
startBot('index.js', 'BOT_TOKEN_1', 3001);

// 2-chi botni ishga tushirish (Anonim bot)
startBot('anonim_bot/index.js', 'BOT_TOKEN_2', 3002);

// Render xato bermasligi uchun asosiy veb-server
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Ikkala bot ham bitta joyda 24/7 muvaffaqiyatli ishlamoqda!');
}).listen(PORT, () => {
    console.log(`Render uchun veb-server ${PORT}-portda ishga tushdi.`);
});

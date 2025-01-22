const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url'); // Для работы с URL

// Создаём HTTP-сервер
const server = http.createServer((req, res) => {
    // Парсим URL, чтобы игнорировать параметры запроса
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname; // Берём только путь без параметров

    // Логируем путь
    console.log(`Запрос: ${pathname}`);

    // Определяем путь к файлу
    const filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

    console.log(`Попытка загрузить файл: ${filePath}`);

    // Проверяем существование файла
    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.error(`Файл не найден: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Файл не найден');
        } else {
            // Определяем MIME-тип содержимого
            const extname = path.extname(filePath);
            let contentType = 'text/html';

            switch (extname) {
                case '.js':
                    contentType = 'application/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.html':
                    contentType = 'text/html';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                    contentType = 'image/jpeg';
                    break;
                case '.svg':
                    contentType = 'image/svg+xml';
                    break;
                default:
                    contentType = 'application/octet-stream';
            }

            res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
            res.end(content, 'utf-8');
        }
    });
});

// Создаём WebSocket сервер поверх HTTP
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Новое соединение установлено.');

    ws.on('message', (message) => {
        console.log('Получено сообщение:', message);

        // Рассылаем сообщение всем подключённым клиентам
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Соединение закрыто.');
    });
});

// Запускаем сервер
server.listen(8080, () => {
    console.log('Сервер запущен на http://localhost:8080');
});

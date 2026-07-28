const PORT = process.env.PORT || 3000; // Берем порт из окружения Render, или 3000 локально
const io = require('socket.io')(PORT, {
    cors: { origin: "*" }
});

let orders = [];

// Функция генерации рандомного ID (например, K077)
function generateRandomId() {
    const letters = "ABEKMHOPCTYX"; // Латиница, похожая на кириллицу
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const number = Math.floor(Math.random() * 900) + 100;
    return `${letter}${number}`;
}

io.on('connection', (socket) => {
    socket.emit('update', orders);

    // Новый заказ из меню
    socket.on('new_order', (items) => {
        const order = {
            id: generateRandomId(),
            items: items,
            status: 'preparing', // готовим
            createdAt: Date.now()
        };
        orders.push(order);
        io.emit('update', orders); // Рассылаем всем
    });

    // Повар пометил "Готов"
    socket.on('mark_ready', (id) => {
        const order = orders.find(o => o.id === id);
        if (order) order.status = 'ready';
        io.emit('update', orders);
    });

    // Повар удалил (заказ забрали)
    socket.on('remove_order', (id) => {
        orders = orders.filter(o => o.id !== id);
        io.emit('update', orders);
    });
});

console.log("Сервер запущен на порту 3000");
const { startEventListen } = require('./listen');
const http = require('http'); // Use the HTTP module to create an HTTP server.
const { Server } = require('socket.io');

// Create an HTTP server
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', [process.env.testlink, process.env.prodlink]);
    // Add other CORS headers as needed (e.g., Access-Control-Allow-Headers, Access-Control-Allow-Methods)
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('CORS configuration for Socket.IO');
});

// Pass the HTTP server to Socket.IO
const io = new Server(server, {
    cors: {
        origin: [process.env.testlink, process.env.prodlink],
        credentials: true
    }
});

io.on('connection', socket => {
    console.log(socket.id, 'connected');
    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
    });
});

if (require.main === module) {
    (async() => {
        await startEventListen(async(data) => {
            io.emit('new-update', data);
            console.log(data.id);
            console.log(data.created_at);
        });
    })();
}

// Listen on the specified port (process.env.PORT or 6464)
const port = process.env.PORT || 6464;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
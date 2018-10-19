const { server: WebSocketServer } = require('websocket');
const { Channel } = require('./models/channel');

const http = require('http');

const PORT = 1337;

const server = http.createServer((request, response) => {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(PORT, () => {
  console.log((new Date()) + ` Server is listening on port ${PORT}`);
});

// create the websocket server
const wsServer = new WebSocketServer({
  httpServer: server
});

const channel = new Channel();

// WebSocket server
wsServer.on('request', (request) => {
  const connection = request.accept(null, request.origin);

  const username = channel.createUserName();
  channel.onUserJoin(username, connection);
  channel.sendWelcomeMessage(username, connection);

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      channel.onMessageReceived(username, JSON.parse(message.utf8Data));
    }
  });
  connection.on('close', (connection) => {
    channel.onUserLeft(username);
  });
});

const { server: WebSocketServer } = require('websocket');
const { Channel } = require('./models/channel');

const http = require('http');

const server = http.createServer((request, response) => {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(1337, () => {
  console.log((new Date()) + ' Server is listening on port 8080');
});

// create the server
const wsServer = new WebSocketServer({
  httpServer: server
});

const channel = new Channel();

// WebSocket server
wsServer.on('request', (request) => {
  const connection = request.accept(null, request.origin);

  const user = channel.createUser();
  channel.addUser(user, connection);
  channel.sendWelcomeMessage(user, connection);
  channel.onUserJoin(user);

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      channel.onMessageReceived(user, JSON.parse(message.utf8Data));
    }
  });
  connection.on('close', (connection) => {
    channel.onUserLeft(user);
  });
});

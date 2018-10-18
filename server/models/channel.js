const SYSTEM_USER = 'system';

const SYSTEM_MESSAGES = {
  JOIN: '%user% has joined the channel',
  LEFT: '%user% has left the channel',
}

const MESSAGE_TYPE = {
  TYPING: 'typing',
  MESSAGE: 'message',
  WELCOME: 'welcome',
}

class Channel {
  constructor() {
    this._conectionsMap = [];
  }
  addUser(user, connection) {
    this._conectionsMap[user] = connection;
  }
  createUser() {
    return 'user' + Math.random().toString(36).substr(2, 6);
  }
  onUserLeft(user) {
    delete this._conectionsMap[user];
    const leftMessage = {
      type: MESSAGE_TYPE.MESSAGE,
      text: SYSTEM_MESSAGES.LEFT.replace('%user%', user),
      user: SYSTEM_USER,
    };
    this._notifyUsers(leftMessage);
  }
  onUserJoin(user) {
    const joinMessage = {
      type: MESSAGE_TYPE.MESSAGE,
      text: SYSTEM_MESSAGES.JOIN.replace('%user%', user),
      user,
    };
    this._notifyUsers(joinMessage);
  }
  onMessageReceived(user, message) {
    const newMessage = {
      ...message,
      user,
    };
    this._notifyUsers(newMessage);
  }
  sendWelcomeMessage(user, connection) {
    const userMessage = {
      type: MESSAGE_TYPE.WELCOME,
      user,
    };
    this._send(connection, userMessage);
  }
  _notifyUsers(message) {
    Object.keys(this._conectionsMap).forEach(connectionUser => {
      const connection = this._conectionsMap[connectionUser];
      this._send(connection, message);
    });
  }

  _send(connection, message) {
    connection.sendUTF(JSON.stringify(message));
  }
}

module.exports = {
  Channel,
}

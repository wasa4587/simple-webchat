const SYSTEM_USER = 'system';

const SYSTEM_MESSAGES = {
  JOIN: '%username% has joined the channel',
  LEFT: '%username% has left the channel',
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

  /**
    * Add username connection in channel
    * @param {string} username
    * @param {object} connection
    * @public
   */
  addUser(username, connection) {
    this._conectionsMap[username] = connection;
  }

  /**
   * Create unique username name
   * @public
   */
  createUserName() {
    return 'username' + Math.random().toString(36).substr(2, 6);
  }

  /**
    * Send message to all the channel when an user left
    * @param {string} username
    * @public
   */
  onUserLeft(username) {
    delete this._conectionsMap[username];
    const leftMessage = {
      type: MESSAGE_TYPE.MESSAGE,
      text: SYSTEM_MESSAGES.LEFT.replace('%username%', username),
      username: SYSTEM_USER,
    };
    this._notifyUsers(leftMessage);
  }

  /**
    * Send message to all the channel when an user join
    * @param {string} username
    * @public
   */
  onUserJoin(username) {
    const joinMessage = {
      type: MESSAGE_TYPE.MESSAGE,
      text: SYSTEM_MESSAGES.JOIN.replace('%username%', username),
      username: SYSTEM_USER,
    };
    this._notifyUsers(joinMessage);
  }

  /**
    * Send message to all the channel when an message arrives
    * @param {string} username
    * @param {object} message
    * @public
   */
  onMessageReceived(username, message) {
    const newMessage = {
      ...message,
      username,
    };
    this._notifyUsers(newMessage);
  }

  /**
    * Send username to an user, should be called once when user just connects
    * @param {string} username
    * @param {object} connection
    * @public
   */
  sendWelcomeMessage(username, connection) {
    const userMessage = {
      type: MESSAGE_TYPE.WELCOME,
      username,
    };
    this._send(connection, userMessage);
  }

  /**
    * Send message to all channel
    * @param {object} message
    * @private
   */
  _notifyUsers(message) {
    Object.keys(this._conectionsMap).forEach(connectionUser => {
      const connection = this._conectionsMap[connectionUser];
      this._send(connection, message);
    });
  }

  /**
    * Send message to a single user
    * @param {string} username
    * @private
   */
  _send(connection, message) {
    connection.sendUTF(JSON.stringify(message));
  }
}

module.exports = {
  Channel,
}

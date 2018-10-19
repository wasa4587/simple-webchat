
export const MESSAGE_TYPE = {
  TYPING: 'typing',
  MESSAGE: 'message',
  WELCOME: 'welcome',
  USER_LIST: 'user_list',
}

export class ChatClient {
  socket;
  observers = [];

  constructor(url) {
    this.socket = new WebSocket(url);
    this.socket.onopen = (event) => {
      this._subcribeMessages();
    }
  }

  /**
    * Add observer
    * @param {function} observer
    * @public
   */
  subcribe(observer) {
    this.observers.push(observer);
  }

  /**
    * Send Typing indicator
    * @public
   */
  sendTyping() {
    var message = {
      type: MESSAGE_TYPE.TYPING,
    };
    this._send(message);
  }

  /**
    * Send message
    * @param {string} text
    * @public
   */
  sendMessage(text) {
    var message = {
      type: MESSAGE_TYPE.MESSAGE,
      text,
      date: Date.now()
    };
    this._send(message);
  }

  /**
    * Send message via WebSocket
    * @param {object} message
    * @private
   */
  _send(message) {
    this.socket.send(JSON.stringify(message));
  }

  /**
    * Notify all observers
    * @param {object} message
    * @private
   */
  _notifyObservers(message) {
    this.observers.forEach(observer => {
      observer(message);
    })
  }

  /**
    * Subcribe websocket, and call _notifyObservers with the received message
    * @private
   */
  _subcribeMessages() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this._notifyObservers(message);
    }
  }
}

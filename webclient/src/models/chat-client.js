
export const MESSAGE_TYPE = {
  TYPING: 'typing',
  MESSAGE: 'message',
  WELCOME: 'welcome',
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

  subcribe(observer) {
    this.observers.push(observer);
  }

  sendTyping() {
    var message = {
      type: MESSAGE_TYPE.TYPING,
    };
    this._send(message);
  }

  sendMessage(text) {
    var message = {
      type: MESSAGE_TYPE.MESSAGE,
      text,
      date: Date.now()
    };
    this._send(message);
  }

  _send(message) {
    this.socket.send(JSON.stringify(message));
  }

  _notifyObservers(message) {
    this.observers.forEach(observer => {
      observer(message);
    })
  }

  _subcribeMessages() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this._notifyObservers(message);
    }
  }
}

import React, { Component } from 'react';
import { MessageList, UserList, NewMessage } from './components';
import { ChatClient, MESSAGE_TYPE } from './models/chat-client'

import './app.scss';


class App extends Component {
  chatClient;
  username;
  timer;
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      isTyping: false,
    };
  }

  componentDidMount() {
    this.chatClient = new ChatClient('ws://localhost:1337');
    this.chatClient.subcribe(this.onChatClientMessageReceived.bind(this));
  }
  onChatClientMessageReceived(message) {
    if (message.type === MESSAGE_TYPE.WELCOME) {
      this.username = message.username;
    }
    if (message.type === MESSAGE_TYPE.TYPING) {
      this.setState({isTyping: true});
    }
    if (message.type === MESSAGE_TYPE.MESSAGE) {
      this.setState((prevState, props) => {
        const messages = [...prevState.messages];
        messages.push(message);
        return {messages};
      });
    }
  }
  sendTyping() {
    this.chatClient.sendTyping();
  }
  sendMessage(message) {
    this.chatClient.sendMessage(message);
  }

  render() {
    return (
      <div className='app'>
        <div className='webchat'>
          <div className='messages-container'>
            <div className='messages-list-container'>
              <MessageList username={this.username} messages={this.state.messages}></MessageList>
            </div>
            <div className='new-message-container'>
              <NewMessage
                onSend={this.sendMessage.bind(this)}
                onTyping={this.sendTyping.bind(this)}>
              </NewMessage>
            </div>
          </div>
          <div className='users-list-container'>
            <UserList></UserList>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

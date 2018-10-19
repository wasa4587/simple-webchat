import React from 'react';
import { Message } from './message';

import './message-list.scss';


export function MessageList(props) {
  const messages = props.messages.map((message, key) => (
    <Message username={props.username} message={message} key={key}></Message>
  ))

  const scrollTopRef = (list) => {
    if(list) {
      list.scrollTop = list.scrollHeight
    }
  };

  return (
    <div className='message-list' ref={scrollTopRef}>
      {messages}
    </div>
  );
}

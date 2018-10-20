import React from 'react';

import './new-message.scss';

export const NewMessage = props => {
  let messageInput;

  const send = () => {
    if (messageInput.value.trim() !== '') {
      props.onSend(messageInput.value);
      messageInput.value = '';
    }
  };

  const handleSubmit = event => {
    event.preventDefault();
    send();
  }
  const handleCtrlEnter = event => {
    if (event.ctrlKey && event.keyCode === 13) {
      send();
    }
  }

  return (
    <div className='new-message'>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder='Type your message'
          ref={message => messageInput = message}
          disabled={props.disabled}
          onKeyPress={props.onTyping}
          onKeyDown={handleCtrlEnter}/>
        <button type="submit" disabled={props.disabled}>Send</button>
      </form>
    </div>
  );
}

import React from 'react';

import './new-message.scss';

export const NewMessage = props => {
  let messageInput;

  const handleSubmit = event => {
      event.preventDefault();
      props.onSend(messageInput.value );
      messageInput.value = '';
  }

  return (
    <div className='new-message'>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder='Type your message'
          ref={message => messageInput = message}
          onKeyPress={props.onTyping}/>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

import React from 'react';

import './message.scss';

const SYSTEM_USER = 'system';

export function Message(props) {
  let className = 'message';
  const you = props.username === props.message.username;
  if (you) {
    className += ' you';
  } else if (props.message.username === SYSTEM_USER) {
    className += ' system';
  }

  return (
    <div className={className}>
      <span className='title'>{you ? 'you' : props.message.username}: </span>
      <span className='text'>{props.message.text}</span>
    </div>
  );
}

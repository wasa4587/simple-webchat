import React from 'react';

import './user.scss';

export function User(props) {
  const className = props.you ? 'user you' : 'user';
  return (
    <div className={className}>
      {props.username} {props.you ? ' (you)' : ''}
    </div>
  );
}

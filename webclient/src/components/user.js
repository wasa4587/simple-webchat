import React from 'react';

import './user.scss';

export function User(props) {
  return (
    <div className='user'>
      {props.username}
    </div>
  );
}

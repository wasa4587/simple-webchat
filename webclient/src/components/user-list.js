import React from 'react';
import { User } from './user';
import './user-list.scss';

export function UserList(props) {
  const users = props.users.map((username, key) => (
    <User username={username} key={key}></User>
  ))
  return (
    <div className="user-list">
      {users}
    </div>
  );
}

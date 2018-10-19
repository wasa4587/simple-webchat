import React from 'react';
import { User } from './user';
import './user-list.scss';

export function UserList(props) {
  const yourUsername = props.username;

  const users = props.users.map((username, key) => (
    <User username={username} you={yourUsername === username} key={key}></User>
  ));

  return (
    <div className="user-list">
      {users}
    </div>
  );
}

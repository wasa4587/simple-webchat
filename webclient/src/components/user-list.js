import React from 'react';
import { User } from './user';
import './user-list.scss';

export function UserList(props) {
  return (
    <div className="user-list">
      <User></User>
      <User></User>
      <User></User>
    </div>
  );
}

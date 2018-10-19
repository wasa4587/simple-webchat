export const UPDATE_USER_LIST = 'UPDATE_USER_LIST';
export const ADD_MESSAGE = 'ADD_MESSAGE';

/**
 * Action to update user list
 * @param {Array<string>} users
 */
export function updateUserList(users) {
  return {
    type: UPDATE_USER_LIST,
    users,
  };
}

/**
  * Add message
  * @param {object} message
 */
export function addMessage(message) {
  return {
    type: ADD_MESSAGE,
    message,
  };
}

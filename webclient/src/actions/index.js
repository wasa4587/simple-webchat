export const WS_UPDATE_USER_LIST = 'WS_UPDATE_USER_LIST';
export const WS_MESSAGE_RECEIVED = 'WS_MESSAGE_RECEIVED';
export const WS_CONNECT_SERVER = 'WS_CONNECT_SERVER';
export const WS_CONNECT_SERVER_SUCCESS = 'WS_CONNECT_SERVER_SUCCESS';
export const WS_WELCOME = 'WS_WELCOME';
export const WS_TYPING_RECEIVED = 'WS_TYPING';
export const WS_SEND_MESSAGE = 'WS_SEND_MESSAGE';
export const WS_SEND_MESSAGE_SUCCESS = 'WS_SEND_MESSAGE_SUCCESS';
export const WS_SEND_TYPING = 'WS_SEND_TYPING';
export const WS_SEND_TYPING_SUCCESS = 'WS_SEND_TYPING_SUCCESS';
export const WS_CLEAR_TYPING_USERS = 'WS_CLEAR_TYPING_USERS';

/**
 * Action to update user list
 * @param {Array<string>} users
 */
export function wsSendMessage(text) {
  return {
    type: WS_SEND_MESSAGE,
    text,
  };
}

/**
 * Action to update user list
 * @param {Array<string>} users
 */
export function wsSendMessageSuccess() {
  return {
    type: WS_SEND_MESSAGE_SUCCESS,
  };
}

/**
 * Action to update user list
 * @param {Array<string>} users
 */
export function wsSendTyping() {
  return {
    type: WS_SEND_TYPING,
  };
}

/**
 * Action to update user list
 * @param {Array<string>} users
 */
export function wsSendTypingSuccess() {
  return {
    type: WS_SEND_TYPING_SUCCESS,
  };
}

/**
 * Action to update user list
 * @param {Array<string>} users
 */
export function wsUpdateUserList(users) {
  return {
    type: WS_UPDATE_USER_LIST,
    users,
  };
}

/**
  * Add message
  * @param {object} message
 */
export function wsMessageReceived(message) {
  return {
    type: WS_MESSAGE_RECEIVED,
    message,
  };
}

/**
  * Add message
  * @param {object} message
 */
export function wsConnectServer(serverUrl) {
  return {
    type: WS_CONNECT_SERVER,
    serverUrl,
  };
}

/**
  * Add message
  * @param {object} message
 */
export function wsConnectServerSuccess(ws) {
  return {
    type: WS_CONNECT_SERVER_SUCCESS,
    ws,
  };
}

/**
  * Add message
  * @param {object} message
 */
export function wsWelcome(username) {
  return {
    type: WS_WELCOME,
    username,
  };
}

/**
  * Add message
  * @param {object} message
 */
export function wsTypingReceived(username) {
  return {
    type: WS_TYPING_RECEIVED,
    username,
  };
}

import { eventChannel, END } from 'redux-saga'
import { takeEvery, put, call, take, select, takeLatest } from 'redux-saga/effects';

import * as ACTIONS from '../actions';


export const MESSAGE_TYPE = {
  TYPING: 'typing',
  MESSAGE: 'message',
  WELCOME: 'welcome',
  USER_LIST: 'user_list',
}

const TYPING_TIMEOUT = 3000;

/**
  * Get the ws object from the state
  * @param {object} state
 */

const getWs = (state) => state.ws;

/**
  * called every ms, used to delay an action for ms time
  * @param {number} ms
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


/**
  * Send message via WebSocket
  * @param {object} message
  * @private
 */
const send = (ws, message) => {
  ws.send(JSON.stringify(message));
}

/**
  * Connect to websocket server and emit actions when messages arrives
  * @param {string} serverUrl
 */
function initWebsocket(serverUrl) {
  return eventChannel(emitter => {
    let ws = new WebSocket(serverUrl);
    ws.onopen = (event) => {
      return emitter({ type: ACTIONS.WS_CONNECT_SERVER_SUCCESS, ws });
    }
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message) {
        switch(message.type) {
          case MESSAGE_TYPE.WELCOME:
            return emitter({ type: ACTIONS.WS_WELCOME, username: message.username });
          case MESSAGE_TYPE.TYPING:
            return emitter({ type: ACTIONS.WS_TYPING_RECEIVED, username: message.username });
          case MESSAGE_TYPE.MESSAGE:
            return emitter({ type: ACTIONS.WS_MESSAGE_RECEIVED, message });
          case MESSAGE_TYPE.USER_LIST:
            return emitter({ type: ACTIONS.WS_UPDATE_USER_LIST, users: message.users });
          default:
        }

      }
    }
    ws.onclose = (event) => {
      return emitter(END);
    }
    // unsubscribe function
    return () => {
      console.log('Socket off')
    }
  })
}

/**
  * Connect to websocket server and listen all events from it
  * @param {object} action
 */
function* wsConnectServer(action) {
  const channel = yield call(initWebsocket, action.serverUrl)
  while (true) {
    const action = yield take(channel)
    yield put(action)
  }
}

/**
  * send message
  * @param {object} action
 */
function* wsSendMessage(action) {
  let ws = yield select(getWs);
  var message = {
    type: MESSAGE_TYPE.MESSAGE,
    text: action.text,
    date: Date.now()
  };
  send(ws, message);
  yield put({type: ACTIONS.WS_SEND_MESSAGE_SUCCESS});
}

/**
  * send typing indicator
  * @param {object} action
 */
function* wsSendTyping(action) {
  let ws = yield select(getWs);
  var message = {
    type: MESSAGE_TYPE.TYPING,
  };
  send(ws, message);
  yield put({type: ACTIONS.WS_SEND_TYPING_SUCCESS});
}


/**
  * after TYPING_TIMEOUT clear typeing list,
  * it can be cancelled if multiple typing message arrives
  * @param {string} username
 */
function * wsTypingReceived(username) {
  yield call(delay, TYPING_TIMEOUT)
  yield put({type: ACTIONS.WS_CLEAR_TYPING_USERS});
}


/*
 * binds actions to generators
 */
export function* wsSaga() {
  yield takeEvery(ACTIONS.WS_CONNECT_SERVER, wsConnectServer);
  yield takeEvery(ACTIONS.WS_SEND_MESSAGE, wsSendMessage);
  yield takeEvery(ACTIONS.WS_SEND_TYPING, wsSendTyping);
  yield takeLatest(ACTIONS.WS_TYPING_RECEIVED, wsTypingReceived);
}

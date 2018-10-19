import { eventChannel } from 'redux-saga'
import { takeEvery, put, call, take, select, takeLatest } from 'redux-saga/effects';

import * as ACTIONS from '../actions';


export const MESSAGE_TYPE = {
  TYPING: 'typing',
  MESSAGE: 'message',
  WELCOME: 'welcome',
  USER_LIST: 'user_list',
}

const TYPING_TIMEOUT = 3000;
const getWs = (state) => state.ws;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


/**
  * Send message via WebSocket
  * @param {object} message
  * @private
 */
const send = (ws, message) => {
  ws.send(JSON.stringify(message));
}

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
    // unsubscribe function
    return () => {
      console.log('Socket off')
    }
  })
}

function* wsConnectServer(action) {
  const channel = yield call(initWebsocket, action.serverUrl)
  while (true) {
    const action = yield take(channel)
    yield put(action)
  }
}

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


function* wsSendTyping(action) {
  let ws = yield select(getWs);
  var message = {
    type: MESSAGE_TYPE.TYPING,
  };
  send(ws, message);
  yield put({type: ACTIONS.WS_SEND_TYPING_SUCCESS});
}


/**
  * Update typing indicator
  * @param {string} username
  * @private
 */
function * wsTypingReceived(username) {
  yield call(delay, TYPING_TIMEOUT)
  yield put({type: ACTIONS.WS_CLEAR_TYPING_USERS});
}


/*
  Starts fetchUser on each dispatched `USER_FETCH_REQUESTED` action.
  Allows concurrent fetches of user.
*/
export function* wsSaga(serverUrl) {
  yield takeEvery(ACTIONS.WS_CONNECT_SERVER, wsConnectServer);
  yield takeEvery(ACTIONS.WS_SEND_MESSAGE, wsSendMessage);
  yield takeEvery(ACTIONS.WS_SEND_TYPING, wsSendTyping);
  yield takeLatest(ACTIONS.WS_TYPING_RECEIVED, wsTypingReceived);
}

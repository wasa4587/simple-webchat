import * as ACTIONS from '../actions';

let newState = {
  users: [],
  messages: [],
  username: '',
  typingUsers: [],
  connected: false,
};

export default function(state, action) {
  switch (action.type) {
    case ACTIONS.WS_UPDATE_USER_LIST: {
      return {
        ...state,
        users: action.users,
      };
    }
    case ACTIONS.WS_MESSAGE_RECEIVED: {
      const messages = [...state.messages];
      messages.push(action.message);

      return {
        ...state,
        messages,
      };
    }
    case ACTIONS.WS_WELCOME: {
      return {
        ...state,
        username: action.username,
      };
    }
    case ACTIONS.WS_CONNECT_SERVER_SUCCESS: {
      return {
        ...state,
        ws: action.ws,
        connected: true,
      };
    }
    case ACTIONS.WS_TYPING_RECEIVED: {
      if (state.username === action.username) {
        return {
          ...state,
        };
      } else {
        const typingUsersSet = new Set(state.typingUsers);
        typingUsersSet.add(action.username);
        const typingUsers = [...typingUsersSet];

        return {
          ...state,
          typingUsers,
        };
      }
    }
    case ACTIONS.WS_CLEAR_TYPING_USERS: {
      return {
        ...state,
        typingUsers: [],
      };
    }
    case ACTIONS.WS_DISCONNECT: {
      const messages = [...state.messages];
      messages.push(action.message);
        return {
          ...state,
          messages,
          connected: false,
        };
    }
    default:
      return state || newState;
  }
}

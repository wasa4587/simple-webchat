import {
  UPDATE_USER_LIST,
  ADD_MESSAGE,
} from '../actions';

let newState = {
  users: [],
  messages: [],
};

export default function(state, action) {
  switch (action.type) {
    case UPDATE_USER_LIST:
      return {
        ...state,
        users: action.users,
      };
    case ADD_MESSAGE:

      const messages = [...state.messages];
      messages.push(action.message);

      return {
        ...state,
        messages,
      };
    default:
      return state || newState;
  }
}

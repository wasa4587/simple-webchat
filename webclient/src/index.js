import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware} from 'redux'
import reducer from './reducers'
import createSagaMiddleware from 'redux-saga'
import { wsSaga } from './sagas'

const sagaMiddleware = createSagaMiddleware()
const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleware)
)
sagaMiddleware.run(wsSaga);

ReactDOM.render(<Provider store={store}><App/></Provider>, document.getElementById('root'));

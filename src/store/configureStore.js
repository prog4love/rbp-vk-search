import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import immutabilityWatcher from 'redux-immutable-state-invariant';
import { createLogger } from 'redux-logger';
// to use with Chrome Extension
// import { composeWithDevTools } from 'redux-devtools-extension';
import { composeWithDevTools } from 'remote-redux-devtools';
import scannerMiddleware from 'middleware/scannerMiddleware';
import rootReducer from '../reducers';

// must be the last middleware in chain
const logger = createLogger({
  duration: true
});

const middleware = process.env.NODE_ENV === 'development'
  ? [immutabilityWatcher(), scannerMiddleware, thunk, logger]
  : [scannerMiddleware, thunk];

export default (preloadedState = {}) => {
  /* eslint-disable no-underscore-dangle */
  /* to use with Chrome Extension without 'redux-devtools-extension' package: */
  // const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ||
  //   compose;
  /* eslint-enable */

  // devTools options object is optional, without it replace "composeEnhancers"
  // call with "composeWithDevTools"
  const composeEnhancers = composeWithDevTools({
    realtime: true // if process.env.NODE_ENV not set as 'development'
    // port setting required to use with local "remotedev-server", OR
    // use remotedev.io/local alternatively
    // set same port in any monitor app (browser/Atom/VS Code extension)
    // port: 8000 // the port local "remotedev-server" is running at
  });

  const store = createStore(
    rootReducer,
    preloadedState,
    composeEnhancers(applyMiddleware(...middleware))
  );

  return store;
};

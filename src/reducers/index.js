import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import auth from './authReducer';
import redirect from './redirectReducer';
import posts from './postsReducer';
import search from './searchReducer';
import requests from './requestsReducer';

// root reducer
export default combineReducers({
  // access token, token expiry and user id returned by vk API
  auth,
  // redirection to authenticate by vk.com
  redirect,
  // found posts from wall
  posts,
  // search status and overall progress
  search,
  // state of multiple search requests
  requests,
  form: formReducer,
});

// TODO: export mainReducer from './mainReducer';

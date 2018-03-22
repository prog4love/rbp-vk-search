import axiosJSONP from 'utils/axiosJSONP';
import fetchJSONP from 'utils/fetchJSONP';
import jsonpPromise from 'utils/jsonpPromise';
import prepareWallPosts from 'utils/responseHandling';

export const CALL_API = 'Call API';

export const kindsOfRequest = {
  wallPosts: 'WALL_POSTS'
  // wallComments: 'WALL_COMMENTS'
};

const onRequestStart = (next, offset, attempt) => {
  const key = `offset_${offset}`;

  next({
    type: 'REQUEST_START',
    id: key,
    offset,
    startTime: Date.now(),
    attempt,
  });
};

// remove successful request obj from "requests"
const onRequestSuccess = (next, getState, offset) => (response) => {
  const { search } = getState();
  const key = `offset_${offset}`;

  if (!search.isActive) {
    throw Error(`Needless response, offset: ${offset}, search is over`);
  }

  next({
    type: 'REQUEST_SUCCESS',
    id: key,
  });
  // TODO: stop passing state further, use selectors here and there
  // add searchState for chained further onSearchProgress handler
  return response;
};

// add failed request obj with isPending: false to "requests"
const onRequestFail = (next, getState, offset, attempt) => (e) => {
  const { search, requests } = getState();
  const key = `offset_${offset}`;

  if (!search.isActive) {
    throw Error(`Needless failed request ${offset}, search is over already`);
  }

  next({
    type: 'REQUEST_FAIL',
    id: key,
    offset,
    startTime: requests[key].startTime,
    attempt,
  });
  throw Error(`Request with ${offset} offset failed, ${e.message}`);
};

const onSearchProgress = (next, getState, offset, offsetModifier, type) => (
  (response) => {
    const { total, processed, progress } = getState().search;

    console.log('search progress state: ', getState().search);
    // to get updated "total"
    const nextTotal = response && response.count ? response.count : total;
    const itemsLength = response && response.items && response.items.length;

    let nextProcessed = processed;

    if (itemsLength) {
      nextProcessed += itemsLength;
    }

    if (nextTotal !== total || nextProcessed !== processed) {
      // TODO: remove progress from state, count it by selector
      let nextProgress = progress;
      // count progress in percents
      if (Number.isInteger(nextTotal) && Number.isInteger(nextProcessed)) {
        // return Number(((nextProcessed / nextTotal) * 100).toFixed());
        nextProgress = Math.round(((nextProcessed / nextTotal) * 100));
      }
      console.info(`next processed ${nextProcessed}, total ${nextTotal} ` +
        ` and progress ${nextProgress}`);
      next({
        type,
        total: nextTotal,
        processed: nextProcessed,
        progress: nextProgress,
      });
    }
    return response;
  }
);

const savePartOfResults = (next, limit, addResultsType) => (chunk) => {
  if (chunk && chunk.length > 0) {
    next({
      type: addResultsType,
      results: chunk,
      limit,
    });
  }
  return chunk;
};

export default ({ getState, dispatch }) => next => (action) => {
  const callAPIParams = action[CALL_API];
  // const { kindOfRequest } = action;
  const { types } = action;

  if (typeof callAPIParams === 'undefined') {
    return next(action);
  }

  // const { types, endpoint } = callAPIParams;
  const {
    url, offset, attempt, offsetModifier, authorId, resultsLimit,
  } = callAPIParams;

  if (Array.isArray(types) && types.length !== 5) {
    throw new Error('Expected an array of five action types');
  }
  // if (!kindOfRequest) {
  //   throw new Error('Specify one of the exported kinds of requests');
  // }
  if (!types.every(t => typeof t === 'string')) {
    throw new Error('Expected action types to be strings');
  }
  if (typeof url !== 'string') {
    throw new Error('Specify a string request URL');
  }
  if (!Number.isInteger(offset)) {
    throw new Error('Expected offset to be integer');
  }
  if (!Number.isInteger(attempt)) {
    throw new Error('Expected attempt to be integer');
  }
  // let { endpoint } = callAPIParams
  // if (typeof endpoint === 'function') {                                       !!!
  //   endpoint = endpoint(store.getState())
  // }

  // const API_ROOT = 'https://api.github.com/';

  const [requestType, successType, failureType, resType, updateType] = types;
  // add request obj with isPending: true to "requests"
  onRequestStart(next, offset, attempt);

  // NOTE: in all next chain must be used offset value that was actual
  // at interval tick moment, i.e. passed to "makeCallToAPI"
  jsonpPromise(url)
    .then(
      // TODO: maybe it will be rational to get attempt value from
      //  existing request with same key
      onRequestSuccess(next, getState, offset),
      onRequestFail(next, getState, offset, attempt),
    )
    .then(onSearchProgress(
      next,
      getState,
      offset,
      offsetModifier,
      updateType,
    ))
    // TODO: change to more generic then(transformResponse(schema))
    .then(prepareWallPosts(authorId))
    .then(savePartOfResults(next, resultsLimit, resType))
    .catch(e => console.error(e));
};

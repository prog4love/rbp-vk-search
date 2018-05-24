// TODO: replace next dependency to configureStore
import { maxAttempts as maxAttemptsDefault } from 'config/common';
import {
  TERMINATE_SEARCH, SEARCH_START, SEARCH_SET_OFFSET, SEARCH_END,
  SEARCH_REQUEST, SEARCH_REQUEST_SUCCESS, SEARCH_REQUEST_FAIL,
} from 'constants/actionTypes';
import {
  getAccessToken, getSearchTotal, getSearchOffset,
  getRequestsById, getIdsOfFailed, getIdsOfPending,
} from 'selectors';
// TODO: pass with action
import { API_CALL_PARAMS } from 'middleware/callAPI';

export const SEARCH_CONFIG = 'SEARCH::Config'; // TODO: rename to search parameters

// IDEA
export const kindsOfData = {
  wallPosts: 'WALL_POSTS',
  // wallComments: 'WALL_COMMENTS'
};

// const determineNextActionOnIntervalTick = () => {}; // TODO:

// TODO: not repeat pending, just make them failed instead; Belated Overdue
// const checkAndRepeatFailed = () => {}

const searchProcessor = ({ dispatch, getState }) => {
  let searchIntervalId;
  // const search = {
  //   isActive: false,
  //   offset: 0
  //   total: undefined, // total amount of items to search among
  //   processed: 0,
  // };

  // const requests = {
  //   'offset_400': {
  //     id: 'offset_400'
  //     offset: 400,
  //     attempt: 1, // how many times request was sent/sent again
  //     startTime: integer // Date.now() value
  //     isPending: true, // failed request will get "false" value here
  //   }
  // };

  return next => (action) => {
    const accessToken = getAccessToken(getState());
    // TODO: destructure from action callAPI and handleResponse functions with
    // imported defaults
    const { type, types, getNumberOfResults } = action;
    const searchConfig = action[SEARCH_CONFIG];

    if (typeof searchConfig === 'undefined' && type !== TERMINATE_SEARCH) {
      return next(action);
    }
    if (!types && type !== TERMINATE_SEARCH) {
      return next(action);
    }
    if (type === TERMINATE_SEARCH) {
      clearInterval(searchIntervalId);
      return next(action); // TODO: pass limit to cut extra results ?
    }

    if (!Array.isArray(types) || types.length !== 1) {
      throw new Error('Expected an array of 1 action types.');
    }
    if (typeof searchConfig !== 'object') {
      throw new Error('Expected an object with search config params');
    }
    if (typeof getNumberOfResults !== 'function') {
      throw new Error('Expected "getNumberOfResults" to be function');
    }
    if (!types.every(t => typeof t === 'string')) {
      throw new Error('Expected action types to be strings');
    }
    if (typeof accessToken !== 'string' || !accessToken.length) {
      throw new Error('Expected access token to be not empty string');
    }

    const [
      // requestType,
      // successType,
      // failType, // TODO: make it interval const
      resultsType,
    ] = types;

    // TODO: import offsetModifier, requestInterval
    // from common config and set as defaults here
    const {
      // TODO: not destructure authorId here and pass whole searchConfig obj to
      // handleResponse(transformResponse)
      authorId,
      baseAPIReqUrl,
      searchResultsLimit,
      // TODO: retrieve defaults of next 3 from options passed to middleware factory
      offsetModifier, // should be equal to request url "count" param value
      requestInterval,
      maxAttempts = maxAttemptsDefault,
    } = searchConfig;

    // TODO: validate authorId, baseAPIReqUrl

    // doublecheck
    clearInterval(searchIntervalId);
    // to notify reducers about search start
    // will also clear "requests" in store
    next({ type: SEARCH_START, limit: searchResultsLimit });

    // let checkpoint = performance.now(); // TEMP:
    // let checkpoint2 = performance.now(); // TEMP:

    // TODO: replace to top level
    const makeCallToAPI = (offset = 0, attempt = 1) => {
      // const tempCheckpoint2 = checkpoint2;
      // checkpoint2 = performance.now();
      // console.warn(`NEW REQUEST with ${offset} offset, attempt: ` +
      //   `${attempt}, interval: ${checkpoint2 - tempCheckpoint2} and
      //    shift: ${performance.now() - checkpoint}`);
      // add request obj with isPending: true to "requests"
      // onRequestStart(next, offset, attempt);

      const currentAPIReqUrl = `${baseAPIReqUrl}&offset=${offset}` +
        `&access_token=${accessToken}`;

      // dispatch({
      //   type: 'SEARCH::Call-API',
      //   endpoint: currentAPIReqUrl,
      // });

      dispatch({
        types: [
          SEARCH_REQUEST, SEARCH_REQUEST_SUCCESS, SEARCH_REQUEST_FAIL, resultsType,
        ],
        [API_CALL_PARAMS]: {
          url: currentAPIReqUrl,
          offset,
          // attempt,
          authorId,
          resultsLimit: searchResultsLimit, // TODO: remove, passed at start
        },
      });
    };
    // first request before timer tick
    makeCallToAPI();

    searchIntervalId = setInterval(() => {
      // const tempCheckpoint = checkpoint;
      // checkpoint = performance.now();
      // console.warn(`NEW interval TICK: ${checkpoint - tempCheckpoint}`);

      // total is equivalent of "count" field in response from vk API
      const state = getState();
      const resultsCount = getNumberOfResults(state);
      const offset = getSearchOffset(state);
      const total = getSearchTotal(state);
      const reqs = getRequestsById(state);
      // const failed = requests.failedIds;
      // const pending = requests.pendingIds;
      const failed = getIdsOfFailed(state);
      const pending = getIdsOfPending(state);

      // NOTE: max number of parallel requests/connections ~ 6-8 / 17
      // TODO: maxPendingCount ~ 6

      // TODO: increase attempt in reducer

      // requests that reach maxAttempts limit are considered completely failed
      // next failed requests should be sent again
      const toSendAgain = failed.filter(id => reqs[id].attempt < maxAttempts);

      // repeat first of failed requests
      if (toSendAgain.length > 0) {
        const [nextId] = toSendAgain;
        const requestToRepeat = reqs[nextId];
        console.log(`Repeat FAILED with ${requestToRepeat.offset} ` +
          `offset and attempt ${requestToRepeat.attempt + 1} `);

        // makeCallToAPI(reqs[nextId].offset, reqs[nextId].attempt + 1);
        makeCallToAPI(requestToRepeat.offset);
        return;
      }

      const nextOffset = offset + offsetModifier;

      // TODO: resolve case with count: 0

      // request next portion of items using increased offset
      if (
        (!searchResultsLimit || resultsCount < searchResultsLimit) &&
        (!total || nextOffset <= total)
      ) {
        next({ type: SEARCH_SET_OFFSET, offset: nextOffset });
        makeCallToAPI(nextOffset);
        return;
      }

      // end search
      if (pending.length === 0) {
        clearInterval(searchIntervalId);
        next({ type: SEARCH_END });
      }
    }, requestInterval);
    // NOTE: return was added for eslint, maybe replace it with
    // next(initialAction); OR next({ type: requestType });
    return null;
  };
};

export default searchProcessor;

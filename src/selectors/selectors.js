import { createSelector } from 'reselect';
// import { createSelectorWithDependencies as createSelector } from 'reselect-tools';
import sortBy from 'lodash-es/sortBy';
// import { sortItemsByNumField } from 'utils/sorting';
import * as fromAuth from 'reducers/authReducer';
import * as fromSearch from 'reducers/searchReducer';
import * as fromRequests from 'reducers/requestsReducer';
import * as fromPosts from 'reducers/postsReducer';

// const state = {
//   auth,
//   posts,
//   search,
//   requests,
//   form,
// };

// ------------------------------ AUTH ----------------------------------------
export const getAuthData = state => state.auth;
// export const getUserId = state => fromAuth.getUserId(state.auth);
export const getUserName = state => fromAuth.getUserName(state.auth);
export const getUserPageHref = state => fromAuth.getUserPageHref(state.auth);
export const isLoggedInSelector = state => fromAuth.isLoggedIn(state.auth);
export const isAuthenticatingSelector = state => (
  fromAuth.isAuthenticating(state.auth)
);

// TODO: extract "isTokenExpired" as separate selector ?
// export const getAccessToken = createSelector(
//   getAuthData,
//   ({ accessToken, tokenExpiresAt }) => {
//     const TEN_MINUTES = 10 * 60 * 1000;
//
//     if (!accessToken) {
//       return null;
//     }
//     if (tokenExpiresAt < Date.now() - TEN_MINUTES) {
//       return null;
//     }
//     return accessToken;
//   },
// );

// export const getDelayedAuthOfferFlag = state => (
//   fromAuth.getDelayedAuthOffer(state.auth)
// );
export const getAuthOffer = state => fromAuth.hasAuthOffer(state.auth);
export const getAuthOfferDelay = state => (
  fromAuth.getAuthOfferDelay(state.auth)
);

// ------------------------------ SEARCH --------------------------------------
export const getSearchIsActive = state => fromSearch.getIsActive(state.search);
export const getIsCompleted = state => fromSearch.getIsCompleted(state.search);
export const getSearchOffset = state => fromSearch.getOffset(state.search);
export const getSearchTotal = state => fromSearch.getTotal(state.search);
export const getSearchProcessed = state => fromSearch.getProcessed(state.search);
export const getSearchErrorCode = state => fromSearch.getErrorCode(state.search);

export const getSearchProgress = createSelector(
  getSearchTotal,
  getSearchProcessed,
  // count progress in percents
  (total, processed) => {
    if (total === null && processed === 0) {
      return 0;
    }
    if (total && Number.isInteger(total) && Number.isInteger(processed)) {
      // return Number(((processed / total) * 100).toFixed());
      return Math.round(((processed / total) * 100));
    }
    return null;
  },
);

// ------------------------------ REQUESTS ------------------------------------
export const getRequestsByOffset = state => (
  fromRequests.getAllByOffset(state.requests)
);
// single request obj
export const getRequestByOffset = (state, offset) => (
  getRequestsByOffset(state)[offset]
);
export const getPendingList = state => fromRequests.getPending(state.requests);
export const getFailedList = state => fromRequests.getFailed(state.requests);

// ------------------------------ POSTS ---------------------------------------
export const getPostsById = state => fromPosts.getAllById(state.posts);
// single post
export const getPostById = (state, id) => getPostsById(state)[id];
export const getIdsOfPosts = state => fromPosts.getIds(state.posts);
export const getPostsSortOrder = state => fromPosts.getSortOrder(state.posts);
export const getPostsFilterText = state => fromPosts.getFilterText(state.posts);
export const getPostsLimit = state => fromPosts.getLimit(state.posts);

// NOTE: consider alternative: sorting by timestamp before filtering by text

export const getFilteredByTextPosts = createSelector(
  [getPostsById, getPostsFilterText],
  (postsById, filterText) => {
    const num = Math.random().toFixed(4);
    console.time(`--- FILTER BY TEXT ${num} ---`);
    if (!postsById) {
      console.timeEnd(`--- FILTER BY TEXT ${num} ---`);
      return null;
    }
    const arrayOfPosts = Object.values(postsById);
    const updFilterText = filterText.trim().toLowerCase();

    if (updFilterText === '') {
      console.timeEnd(`--- FILTER BY TEXT ${num} ---`);
      return arrayOfPosts;
    }
    const result = arrayOfPosts.filter(post => (
      post.text.toLowerCase().includes(updFilterText)
    ));

    console.timeEnd(`--- FILTER BY TEXT ${num} ---`);

    return result;
  },
);

export const getSortedByTimestampPosts = createSelector(
  getFilteredByTextPosts,
  (filteredPosts) => {
    console.time('--- SORT ---');
    if (!filteredPosts) {
      console.timeEnd('--- SORT ---');
      return null;
    }
    const sorted = sortBy(filteredPosts, ['timestamp']); // => new array

    console.timeEnd('--- SORT ---');

    return sorted;
  },
);

export const getVisiblePosts = createSelector(
  [getSortedByTimestampPosts, getPostsSortOrder, getPostsLimit],
  // (state, sortOrder = 'descend') => sortOrder,
  (sortedPosts, sortOrder, limit) => {
    console.time('--- REVERSE ---');

    if (!sortedPosts) {
      console.timeEnd('--- REVERSE ---');
      return null;
    }
    const limitedPosts = limit ? sortedPosts.slice(0, limit) : sortedPosts;
    const result = sortOrder === 'descend'
      ? [].concat(limitedPosts).reverse() // NOTE: think over lodash's "orderBy"
      : limitedPosts;

    console.timeEnd('--- REVERSE ---');

    return result;
  },
);

export const getVisiblePostsIds = createSelector(
  getVisiblePosts,
  visiblePosts => visiblePosts.map(post => post.id),
);

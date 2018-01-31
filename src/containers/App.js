import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import Home from 'containers/Home';
import WallPostsSearch from 'containers/WallPostsSearch';
import NotFoundPage from 'components/NotFoundPage';
import configureStore from 'store/configureStore';

const results = [
  {
    timestamp: 1582357458,
    fromId: 413870329,
    postId: 54525,
    text: 'Мне 29 лет симпатичная девушка. Ищу партнёра для интим отношений ' +
    'только постоянного, за материальную поддержку',
    link: 'https://vk.com/club75465366?w=wall-75465366_37844%2Fall'
  },
  {
    timestamp: 1323574580,
    fromId: 247772351,
    postId: 13585,
    text: 'Я ищу спонсора на длительные отношения, я без опыта, ' +
    'полненькая но не сильно, общительная. Пишите в л/с',
    link: 'https://vk.com/club75465366?w=wall-75465366_37824%2Fall'
  }
];

const store = configureStore({
  results
});

// store.subscribe(() => console.log('Updated state ', store.getState()));

const App = () => (
  <Provider store={store}>
    <Router>
      <Switch>
        {/* <Route component={Home} exact path="/" /> */}
        {/* <Route component={WallPostsSearch} path="/wall-posts" /> */}
        <Route component={WallPostsSearch} exact path="/" />
        <Route component={NotFoundPage} />
      </Switch>
    </Router>
  </Provider>
);

export default App;
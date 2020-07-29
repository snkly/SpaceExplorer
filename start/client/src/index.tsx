import { 
  ApolloClient, 
  ApolloProvider, 
  InMemoryCache, 
  NormalizedCacheObject, 
  gql 
} from '@apollo/client';

import React from 'react';
import ReactDOM from 'react-dom'; 
import Pages from './pages';
import injectStyles from './styles';

//import gql from 'graphql-tag';

const cache = new InMemoryCache();

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache,
  uri: 'http://localhost:4000/'
});

client
  .query({
    query: gql`
      query GetLaunch {
        launch(id: 56) {
          id
          mission {
            name
          }
        }
      }
    `
  })
  .then(result => console.log(result));

injectStyles();
ReactDOM.render(
  <ApolloProvider client={client}>
    <Pages />
  </ApolloProvider>, 
  document.getElementById('root')
);
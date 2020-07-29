import React from 'react';
import ReactDOM from 'react-dom'; 
import Pages from './pages';
import injectStyles from './styles';
import { 
  ApolloClient, 
  ApolloProvider, 
  InMemoryCache, 
  NormalizedCacheObject, 
  gql 
} from '@apollo/client';

const cache = new InMemoryCache();

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache,
  // uri that we pass in is the URL of the server
  uri: 'http://localhost:4000/'
});

// client.query(), Query our graph's API
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

/**
 * Connecting Apollo Client to our React app 
 * allows us to easily bind GraphQL operations to our UI.
 * The ApolloProvider component is similar to React’s context provider. 
 * It wraps your React app and places the client on the context, 
 * which allows you to access it from anywhere in your component tree.
 */
 ReactDOM.render(
  <ApolloProvider client={client}>
    <Pages />
  </ApolloProvider>, 
  document.getElementById('root')
);
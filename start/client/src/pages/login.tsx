import React from 'react';
import { useApolloClient, useQuery, useMutation, gql } from '@apollo/client'

import { LoginForm, Loading } from '../components';
import * as LoginTypes from './__generated__/login';

export const LOGIN_USER = gql`
  mutation login($email: String!) {
    login(email: $email)
  }
`;

/**
 * Our useMutation hook returns a mutate function (login) 
 * and the data object returned from the mutation that we destructure from the tuple. 
 * Finally, we pass our login function to the LoginForm component.
 */
export default function Login() {
  const [login, { data }] = useMutation<LoginTypes.login, LoginTypes.loginVariables>(LOGIN_USER);
  return <LoginForm login={login} />;
}
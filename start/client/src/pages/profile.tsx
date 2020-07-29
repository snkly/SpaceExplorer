import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { useQuery, gql } from '@apollo/client'

import { Loading, Header, LaunchTile } from '../components';
import { LAUNCH_TILE_DATA } from './launches';
import * as GetMyTripsTypes from './__generated__/GetMyTrips';

export const GET_MY_TRIPS = gql`
  query GetMyTrips {
    me {
      id
      email
      trips {
        ...LaunchTile
      }
    }
  }
  ${LAUNCH_TILE_DATA}
`;

interface ProfileProps extends RouteComponentProps {}

/**
 * Next, let's render a component with useQuery to fetch a logged in user's list of trips. 
 * By default, Apollo Client's fetch policy is cache-first, which means 
 * it checks the cache to see if the result is there before making a network request. 
 * Since we want this list to always reflect the newest data from our graph API, 
 * we set the fetchPolicy for this query to network-only:
 */
const Profile: React.FC<ProfileProps> = () => {
  const { data, loading, error } = useQuery<GetMyTripsTypes.GetMyTrips, any>(
    GET_MY_TRIPS,
    { fetchPolicy: "network-only" }
  );
  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;
  if (data === undefined) return <p>ERROR</p>;

  return (
    <>
      <Header>My Trips</Header>
      {data.me && data.me.trips.length ? (
        data.me.trips.map((launch: any) => (
          <LaunchTile key={launch.id} launch={launch} />
        ))
      ) : (
        <p>You haven't booked any trips</p>
      )}
    </>
  );
}

export default Profile;
import React, { useState } from 'react'
import { RouteComponentProps } from '@reach/router'
import { useQuery, gql } from '@apollo/client'

import { LaunchTile, Header, Button, Loading } from '../components'
import * as GetLaunchListTypes from './__generated__/GetLaunchList'

/**
 * We define a GraphQL fragment by giving it a name (LaunchTile) 
 * and defining it on a type on our schema (Launch). 
 * The name we give our fragment can be anything, 
 * but the type must correspond to a type in our schema.
 */
export const LAUNCH_TILE_DATA = gql`
fragment LaunchTile on Launch {
  __typename
  id
  isBooked
  rocket {
    id
    name
  }
  mission {
    name
    missionPatch
  }
}
`;

/**
 * Here, we're defining a query to fetch a list of launches 
 * by calling the launches query from our schema.
 * 
 * The launches query returns an object type with a list of launches, 
 * in addition to the cursor of the paginated list and 
 * whether or not the list hasMore launches. 
 * 
 * We need to wrap the query with the gql function in order to parse it into an AST
 */

export const GET_LAUNCHES = gql`
query GetLaunchList($after: String) {
  launches(after: $after) {
    cursor
    hasMore
    launches {
      ...LaunchTile
    }
  }
}
${LAUNCH_TILE_DATA}
`;

interface LaunchesProps extends RouteComponentProps { }

/**
 * Pagination: Using Apollo fetchMore, connect it to a 'Load More button' to get more items when clicked. 
 * Specify an updateQuery function on the return object from fetchMore 
 * that tells the Apollo cache how to update our query with the new items we're fetching.
 * 
 * 1. First, we check to see if we have more launches available in our query. 
 *    If we do, we render a button with a click handler that calls the fetchMore function from Apollo. 
 *    The fetchMore function receives new variables for the list of launches query, which is represented by our cursor.
 * 
 * 2. We also define the updateQuery function to tell Apollo how to update the list of launches in the cache. 
 *    To do this, we take the previous query result and combine it with the new query result from fetchMore.
 */
const Launches: React.FC<LaunchesProps> = () => {
  const {
    data,
    loading,
    error,
    fetchMore
  } = useQuery<
    GetLaunchListTypes.GetLaunchList,
    GetLaunchListTypes.GetLaunchListVariables
  >(GET_LAUNCHES);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  if (loading) return <Loading />;
  if (error || !data) return <p>ERROR</p>;

  return (
    <>
      <Header />
      {data.launches &&
        data.launches.launches &&
        data.launches.launches.map((launch: any) => (
          <LaunchTile key={launch.id} launch={launch} />
        ))}
      {data.launches &&
        data.launches.hasMore && (
          <Button
            onClick={() =>
              fetchMore({
                variables: {
                  after: data.launches.cursor,
                },
                updateQuery: (prev, { fetchMoreResult, ...rest }) => {
                  if (!fetchMoreResult) return prev;
                  return {
                    ...fetchMoreResult,
                    launches: {
                      ...fetchMoreResult.launches,
                      launches: [
                        ...prev.launches.launches,
                        ...fetchMoreResult.launches.launches,
                      ],
                    },
                  };
                },
              })
            }
          >
            Load More
          </Button>
        )
      }
    </>
  );
}

export default Launches;

const { paginateResults } = require('./utils');

/**
 * A resolver is a function that's responsible for 
 * populating the data for a single field in your schema. 
 * Whenever a client queries for a particular field, 
 * the resolver for that field fetches the requested data 
 * from the appropriate data source.
 * 
 * A resolver function returns one of the following:
 * 1. Data of the type required by the resolver's corresponding schema field (string, integer, object, etc.)
 * 2. A promise that fulfills with data of the required type
 * 
 * fieldName: (parent, args, context, info) => data;
 */

module.exports = {
  Query: {
    launches: async (_, { pageSize = 20, after }, { dataSources }) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      // we want these in reverse chronological order
      allLaunches.reverse();
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches
      });
      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        // if the cursor at the end of the paginated results is the same as the
        // last item in _all_ results, then there are no more results after this
        hasMore: launches.length
          ? launches[launches.length - 1].cursor !==
            allLaunches[allLaunches.length - 1].cursor
          : false
      };
    },
    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser()
  },
  Mutation: {
    /**
     * Login resolver takes an email address and 
     * and returns a login token for a corresponding user entity. 
     * If a user entity doesn't yet exist for this email address, 
     * one is created.
     */
    login: async (_, { email }, { dataSources }) => {
      const user = await dataSources.userAPI.findOrCreateUser({ email });
      if (user) return Buffer.from(email).toString('base64');
    }, 
    /**
     * To match our schema, bookTrips and cancelTrips resolvers 
     * both return an object that conform to the structure of the 
     * TripUpdateResponse type:  
     * 1. Success indicator,
     * 2. A status message, 
     * 3. An array of launches that the mutation either booked or canceled.
     *  
     * The bookTrips resolver needs to account for the possibility of a partial success, 
     * where some launches are booked successfully and others fail. 
     * The code below indicates a partial success in the message field.
     */
    bookTrips: async (_, { launchIds }, { dataSources }) => {
      const results = await dataSources.userAPI.bookTrips({ launchIds });
      const launches = await dataSources.launchAPI.getLaunchesByIds({
        launchIds,
      });
  
      return {
        success: results && results.length === launchIds.length,
        message:
          results.length === launchIds.length
            ? 'trips booked successfully'
            : `the following launches couldn't be booked: ${launchIds.filter(
                id => !results.includes(id),
              )}`,
        launches,
      };
    },
    cancelTrip: async (_, { launchId }, { dataSources }) => {
      const result = await dataSources.userAPI.cancelTrip({ launchId });
  
      if (!result)
        return {
          success: false,
          message: 'failed to cancel trip',
        };
  
      const launch = await dataSources.launchAPI.getLaunchById({ launchId });
      return {
        success: true,
        message: 'trip cancelled',
        launches: [launch],
      };
    },
  },
  /**
   * This resolver obtains a large or small patch from mission, 
   * which is the object returned by the default resolver 
   * or the parent field in our schema, Launch.mission. 
   */
  Mission: {
    // The default size is 'LARGE' if not provided
    missionPatch: (mission, { size } = { size: 'LARGE' }) => {
      return size === 'SMALL'
        ? mission.missionPatchSmall
        : mission.missionPatchLarge;
    },
  },
  Launch: {
    isBooked: async (launch, _, { dataSources }) =>
      dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id }),
  },
  User: {
    trips: async (_, __, { dataSources }) => {
      // Get ids of launches by user
      const launchIds = await dataSources.userAPI.getLaunchIdsByUser();
      if (!launchIds.length) return [];
      // Look up those launches by their ids
      return (
        dataSources.launchAPI.getLaunchesByIds({
          launchIds,
        }) || []
      );
    },
  },
};
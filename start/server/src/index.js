const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const { createStore } = require('./utils');
const resolvers = require('./resolvers');

const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');

const store = createStore();

const isEmail = require('isemail');

/**
 * If you use this.context in a datasource, 
 * it's critical to create a new instance in the dataSources function, 
 * rather than sharing a single instance.
 * Otherwise, initialize might be called during 
 * the execution of asynchronous code for a particular user, 
 * replacing this.context with the context of another user.
 */
const server = new ApolloServer({
  context: async ({ req }) => {
    // simple auth check on every request
    const auth = req.headers && req.headers.authorization || '';
    const email = Buffer.from(auth, 'base64').toString('ascii');
    if (!isEmail.validate(email)) return { user: null };
    // Find a user by their email
    const users = await store.users.findOrCreate({ where: { email } });
    const user = users && users[0] || null;
    return { user: { ...user.dataValues } };
  },
  typeDefs,
  resolvers,
  engine: {
    reportSchema: true
  },
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  })
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
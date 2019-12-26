import express from 'express';
import dotenv from 'dotenv';
import { ApolloServer, gql } from 'apollo-server-express';
import mongooseConnect from './config/mongoose';
import corsOptions from './config/corsOptions';
import rootSchema from './features/rootSchema';
import rootModels from './features/rootModels';
import getUser from './auth/getUser';

dotenv.config();

const SERVER_PORT = process.env.SERVER_PORT || 4000;
const app: express.Application = express();

const server = new ApolloServer({
  schema: rootSchema,
  context: ({ req }) => {
    const token = req.headers.authentication || '';
    const user = getUser(token);
    return {
      user,
      models: rootModels,
    };
  },
  formatError: err => {
    if (err.message.startsWith('Database Error: ')) {
      return new Error('Internal server error');
    }
    return err;
  },
});

// MongoDB connection status
mongooseConnect();
server.applyMiddleware({ app, cors: corsOptions });
app.listen({ port: SERVER_PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:${SERVER_PORT}${server.graphqlPath}`)
);

import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';


import constants from '../config/constants';
import typeDefs from '../graphql/schema';
import resolvers from '../graphql/resolvers';
import { decodeToken } from '../services/auth';


const schema = makeExecutableSchema({
    typeDefs,
    resolvers
 });

 async function auth(req, res, next) {
     try {
         const token = req.headers.authorization;
         if(token != null){
            const user = await decodeToken(token);
            req.user = user;
         } else {
             req.user = null;
         }
         return next();
     } catch(err){
         throw err;
     }
 }

export default app => {
    app.use(bodyParser.json());
    app.use(auth);
    app.use('/graphiql', graphiqlExpress({
        endpointURL: constants.GRAPHQL_PATH
    }));

    app.use(constants.GRAPHQL_PATH, graphqlExpress(req => ({
        schema,
        context:{
            user: req.user
        }
    })));
}
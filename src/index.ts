import "reflect-metadata";
import { __prod__ } from "./constants";
import express from 'express'
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import {createConnection} from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

const main = async () => {
    const conn = createConnection({
        type: 'postgres',
        database: 'kredentpost',
        username: 'postgres',
        password: 'postgresql',
        logging: true,
        synchronize: true,
        entities: [Post, User]
    });

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}) => ({ req, res })
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('Server started on localhost:4000');
    })
};

main().catch((err) => {
    console.error(err);
});



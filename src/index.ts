import 'dotenv/config';
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
import { createAccessToken, createRefreshToken } from './auth';
import { verify } from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

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
    app.use(cookieParser());
    
    // This route is specifically designed to handle refreshing the JWT Token
    // "/refreshtoken"
    app.post("/refreshtoken", async (req,res) => {
        console.log(req.cookies);
        console.log(req.headers);
        const token = req.cookies.jid;
        if(!token) {
            return res.send({ ok: false, accessToken: "" });
        }

        let payload: any = null;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
        } catch(err) {
            console.log(err);
            return res.send({ ok: false, accessToken: "" });
        }

        // If the token is valid, then we can send back an access token
        const user = await User.findOne({ id: payload.userId });

        if(!user) {
            return res.send({ ok: false, accessToken: "" });
        }

        res.cookie('jid', createRefreshToken(user),
            {
                httpOnly: true
            });

            

        return res.send({ ok: true, accessToken: createAccessToken(user) });
    });

    // console.log(process.env.ACCESS_TOKEN_SECRET);
    // console.log(process.env.REFRESH_TOKEN_SECRET);

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



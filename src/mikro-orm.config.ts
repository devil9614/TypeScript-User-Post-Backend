import { Post } from "./entities/Post";
import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';
import { User } from "./entities/User";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/
    },
    entities: [Post, User],
    type: 'postgresql',
    user: 'postgres',
    password: 'postgresql',
    dbName: 'typeserver',
    debug: !__prod__
} as Parameters<typeof MikroORM.init>[0];

import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    //Creating a Post into DB
    // const post = orm.em.create(Post, {title: 'my first post'});
    // await orm.em.persistAndFlush(post);

    //Finding the post from the DB
    const posts = await orm.em.find(Post, {});
    console.log(posts);
};

main().catch((err) => {
    console.error(err);
});


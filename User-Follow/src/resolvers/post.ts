import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";
@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(): Promise<Post[]>{
        return Post.find();  
    }

    @Query(() => Post, {nullable: true})
    post(@Arg('id') id: number): Promise<Post | undefined>{
        return Post.findOne(id);  
    }

    @Mutation(() => Post)
    async createPost(@Arg('title') title: string): Promise<Post> {
        // Two SQL queries - 1. to insert 2. to select
        return Post.create({title}).save();  
    }

    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, {nullable: true}) title: string,
        ): Promise<Post | null> {
            //1 SQL Query - To fetch the post
            const post = await Post.findOne(id);
            if(!post) {
                return null;
            }
            if(typeof title !== "undefined"){
            // 2 SQL Query - To update the post based on ID and TITLE
                await Post.update({ id }, { title });
            }
            return post;  
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg('id') id: number): Promise<Boolean> {
            await Post.delete(id);
            return true;  
    }
}
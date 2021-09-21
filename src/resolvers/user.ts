import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import bcrypt from 'bcryptjs';
// import argon2 from "argon2"

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => User, {nullable: true})
    user?: User
}

@Resolver()
export class UserResolver{
    // @Field()
    // username: string
    // @Field()
    // password: string

    @Mutation(() => User)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        // @Arg('username') username: string,
        // @Arg('password') password: string,
        @Ctx() {em}: MyContext
    ){
        const hashedPassword = bcrypt.hashSync(options.password, 5);
        const user = em.create(User, {
            username: options.username, 
            password: hashedPassword,
        });
        await em.persistAndFlush(user);
        return user;
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, {username: options.username});
        if(!user){
            return {
                errors: [{
                    field: "username",
                    message: "Username does not exist"
                    },
                ],
            };
        }
        const valid = bcrypt.compareSync(user.password, options.password);
        if(!valid){
            return {
                errors: [{
                    field: "password",
                    message: "Incorrect Password"
                    },
                ],
            };
        } 
        return {
            user
        };
    }
}
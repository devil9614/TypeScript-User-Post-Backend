import { User } from "../entities/User";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
import bcrypt from 'bcryptjs';
import { getConnection } from "typeorm";
import { MyContext } from "../MyContext";
import { createAccessToken, createRefreshToken } from "../auth";
import { isAuth } from "../isAuth";


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
class LoginResponse{
    @Field()
    accessToken: string
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
    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput
    ): Promise<UserResponse>{
        if(options.username.length <= 2){
            return {
                errors: [{
                    field: "username",
                    message: "length must be greater than 2"
                }],
            };
        }

        if(options.password.length <= 5){
            return {
                errors: [{
                    field: "password",
                    message: "length must be greater than 5"
                }],
            };
        }

        const hashedPassword = bcrypt.hashSync(options.password, 5);
        let user;
        try {
            // Inserting User
            // User.create({}).save()
            const result = await getConnection().createQueryBuilder().insert().into(User).values({
                username: options.username,
                password: hashedPassword
            }).returning('*').execute();
            console.log("result: ", result);
            user = result.raw[0];
        } catch(err) {
            // console.log("err: ", err);
            //Duplicate username error
            if(err.code === '23505'){
                return {
                    errors: [{
                        field: 'username',
                        message: 'username already exists'
                    }]
                };                
            }
        }
        
        return { user };
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() {res}: MyContext
    ): Promise<LoginResponse> {
        // const user = await User.findOne(User);
        const user = await User.findOne({where: {username: options.username}});
        if(!user){
            throw new Error("User does not exist");
        }
        const valid = bcrypt.compareSync(options.password, user.password);
        if(!valid){
            throw new Error("Incorrect Password");
        } 

        res.cookie(
            'jid', 
            createRefreshToken(user),
            {
                httpOnly: true
            }
        );

        return {
            accessToken: createAccessToken(user)
        };
    }

    @Query(() => String)
    @UseMiddleware(isAuth)
    validUser(
        @Ctx() {payload}: MyContext
    ){
        console.log(payload);
        return `You are Authorize User! Your USER ID is: ${payload?.userId}`;
    }
}
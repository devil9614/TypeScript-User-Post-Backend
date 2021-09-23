import { User } from "../entities/User";
import { Arg, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import bcrypt from 'bcryptjs';
import { getConnection } from "typeorm";


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

    @Mutation(() => UserResponse)
    async login(
        @Arg("options") options: UsernamePasswordInput
    ): Promise<UserResponse> {
        // const user = await User.findOne(User);
        const user = await User.findOne({where: {username: options.username}});
        if(!user){
            return {
                errors: [{
                    field: "username",
                    message: "Username does not exist"
                    },
                ],
            };
        }
        const valid = bcrypt.compareSync(options.password, user.password);
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
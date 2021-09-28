import { Mutation, Query, Resolver } from "type-graphql";

const User = require('../entities/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {UserInputError} = require('apollo-server');
// const {SECRET_KEY} = require('../../config');
const {SECRET_KEY} = require('../config');
// const checkAuth = require('../../check-auth');
const checkAuth = require('../check-auth');

const {validateRegisterInput,validateLoginInput} = require('../validation')


function generateToken(user: { id: any; email: any; username: any; }) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username
      },
      SECRET_KEY
    );
  }

@Resolver()
export class UserResolver {
    @Query((() => User))
        async getFollowers(_: any, { username }: any) {
            try {
              const user = await User.findOne({username});
              if (user) {
                return user;
              } else {
                throw new Error('User not found');
              }
            } catch (err) {
              throw new Error(err);
            }
        }


    @Mutation((() => User))

        async follow(_: any, {username}: any,context: any){

            const users = checkAuth(context);
            const name = users.username
            
            const user = await User.findOne({username});
            const user1 = await User.findOne({username: name})

            if(users){
                if(user.followers.find((follower: { username: any; }) => follower.username === name)){
                    user.followers = user.followers.filter((follower: { username: any; }) => follower.username !== users.username)
                    user1.following = user1.following.filter((follower: { username: any; }) => follower.username !== user.username)
                }
                else{
                    user.followers.push({
                        username: name
                    })
                    user1.following.push({
                        username: user.username
                    })
                }
                await user.save();
                await user1.save();
                // return user,user1;
            }
            else{
                throw new UserInputError('Please Login');
            }
        }

        async login(_: any,{username,password}: any){
            const {errors,valid} = validateLoginInput(username, password);
            if(!valid){
                throw new UserInputError('Errors',{
                    errors
                })
            }

            const user = await User.findOne({username});
            if(!user){
                errors.general = "User not found";
                throw new UserInputError('user not found',{
                    errors
                })
            }

            const match = await bcrypt.compare(password,user.password);
            if(!match){
                errors.general = "Wrong Data";
                throw new UserInputError('Wrong Data',{
                    errors
                })
            }

            const token = generateToken(user);
            return{
                ...user._doc,
                id: user._id,
                token
            };
        }


        async register(_: any,{registerInput : { username, email, password, confirmPassword}}: any,context: any,info: any){

            const {errors,valid} = validateRegisterInput(username, email, password, confirmPassword);
            if(!valid){
                throw new UserInputError('Errors',{
                    errors
                })
            }

            const user = await User.findOne({username})
            const email1 = await User.findOne({email})
            if(user || email1)
            {
                throw new UserInputError('Username or Email is already taken',{
                    errors:{
                        username: "Username or Email is already taken"
                    }
                })
            }

            password = await bcrypt.hash(password,12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res);

            return{
                ...res._doc,
                id: res._id,
                token
            };
        }
    }    

module.exports = {
    
} 



































// import { User } from "../entities/User";
// import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
// import bcrypt from 'bcryptjs';
// import { getConnection } from "typeorm";
// import { MyContext } from "../MyContext";
// import { createAccessToken, createRefreshToken } from "../auth";
// import { isAuth } from "../isAuth";



// @InputType()
// class UsernamePasswordInput {
//     @Field()
//     username: string
//     @Field()
//     password: string
// }

// @ObjectType()
// class FieldError {
//     @Field()
//     field: string
//     @Field()
//     message: string
// }

// @ObjectType()
// class LoginResponse{
//     @Field()
//     accessToken: string
// }

// @ObjectType()
// class getFollowers{
//     @Field()
//     username: string
// }

// type Query = {
//     getFollowers(username: String): User
// }

// @ObjectType()
// class UserResponse {
//     @Field(() => [FieldError], {nullable: true})
//     errors?: FieldError[]

//     @Field(() => User, {nullable: true})
//     user?: User
// }

// @Resolver()
// export class UserResolver{
//     @Mutation(() => UserResponse)
//     async register(
//         @Arg("options") options: UsernamePasswordInput
//     ): Promise<UserResponse>{
//         if(options.username.length <= 2){
//             return {
//                 errors: [{
//                     field: "username",
//                     message: "length must be greater than 2"
//                 }],
//             };
//         }

//         if(options.password.length <= 5){
//             return {
//                 errors: [{
//                     field: "password",
//                     message: "length must be greater than 5"
//                 }],
//             };
//         }

//         const hashedPassword = bcrypt.hashSync(options.password, 5);
//         let user;
//         try {
//             // Inserting User
//             // User.create({}).save()
//             const result = await getConnection().createQueryBuilder().insert().into(User).values({
//                 username: options.username,
//                 password: hashedPassword
//             }).returning('*').execute();
//             console.log("result: ", result);
//             user = result.raw[0];
//         } catch(err) {
//             // console.log("err: ", err);
//             //Duplicate username error
//             if(err.code === '23505'){
//                 return {
//                     errors: [{
//                         field: 'username',
//                         message: 'username already exists'
//                     }]
//                 };                
//             }
//         }
        
//         return { user };
//     }

//     @Mutation(() => LoginResponse)
//     async login(
//         @Arg("options") options: UsernamePasswordInput,
//         @Ctx() {res}: MyContext
//     ): Promise<LoginResponse> {
//         // const user = await User.findOne(User);
//         const user = await User.findOne({where: {username: options.username}});
//         if(!user){
//             throw new Error("User does not exist");
//         }
//         const valid = bcrypt.compareSync(options.password, user.password);
//         if(!valid){
//             throw new Error("Incorrect Password");
//         } 

//         res.cookie(
//             'jid', 
//             createRefreshToken(user),
//             {
//                 httpOnly: true
//             }
//         );

//         return {
//             accessToken: createAccessToken(user)
//         };
//     }

//     // //Follow User Mutation
//     // @Mutation(() => LoginResponse)
//     // async follow(
//     //     @Arg("options") options: UsernamePasswordInput
//     // )

//     @Query(() => String)
//     @UseMiddleware(isAuth)
//     validUser(
//         @Ctx() {payload}: MyContext
//     ){
//         console.log(payload);
//         return `You are Authorize User! Your USER ID is: ${payload?.userId}`;
//     }


//     // Get Followers Query
//     @Query(() => String)
//     @UseMiddleware(isAuth)
    
//     async getFollowers(
//         @Arg('username') options: getFollowers
//         ): Promise<getFollowers> {
//         try {
//             const user = await User.findOne({where: {username: options.username}});
//             if(user) {
//                 return (user);
//             } else {
//                 throw new Error('User Not Found');
//             }
//         } catch (err) {
//             throw new Error(err);
//         }
    
//     }
// }
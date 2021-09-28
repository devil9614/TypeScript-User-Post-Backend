import gql from 'graphql-tag';

module.exports = gql`
    type Post{
        id: ID!
        createdAt: String!
        updatedAt: String!
        username: String!
    }

    type User{
        id: ID!
        username: String!
        token: String!
        createdAt: String!
        followers: [follower]!
        following: [following]!
        followCount: Int!
        followingCount: Int!
    }

    type follower{
        username: String!
    }

    type following{
        username: String!
    }

    input RegisterInput {
        username: String!
        password: String!
        confirmPassword: String!
    }

    type Query{
        getPosts: [Post]
        getPost(postId: ID!): Post
        getFollowers(username: String!): User
    }
    
    type Mutation{
        register(registerInput: RegisterInput): User!
        login(username: String!, password: String!): User!
        createPost(body: String!): Post
        deletePost(postId: ID!): String!
        follow(username: String!): User!
    }
`;
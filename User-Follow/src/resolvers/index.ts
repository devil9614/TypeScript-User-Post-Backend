const postsResolvers = require('./posts')
const usersResolvers = require('./users')
const commentResolvers = require('./comment')

module.exports = {
    Post:{
        likeCount: (parent: { likes: string | any[] }) => parent.likes.length,
        commentCount: (parent: { comments: string | any[] }) => parent.comments.length
    },

    User:{
        followCount: (parent: { followers: string | any[] }) => parent.followers.length,
        followingCount: (parent: { following: string | any[] }) => parent.following.length
    },

    Query:{
        ...postsResolvers.Query,
        ...usersResolvers.Query
    },

    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentResolvers.Mutation
    }
}
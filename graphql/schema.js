const users = require('../database/Users.json');
const posts = require('../database/Posts.json');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLSchema,
    GraphQLList,
    GraphQLEnumType
} = require("graphql");


//% Types
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        phone: { type: GraphQLString }
    })
});

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: { type: GraphQLID },
        userId: { type: GraphQLID },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        user: { // Relazione con UserType
            type: UserType,
            //resolve: (parent, args) => User.findById(parent.userId)
        }
    })
});


//% Queries
const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        users: {
            type: new GraphQLList(UserType),
            resolve: () => users
        },
        user: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve: (parent, args) => User.findById(args.id)
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve: () => posts
        },
        post: {
            type: PostType,
            args: { id: { type: GraphQLID } },
            resolve: (parent, args) => Post.findById(args.id)
        },
    }
});


//% Mutations
const RootMutation = new GraphQLObjectType({
    name: 'RootMutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                id: { type: GraphQLID },
                name: { type: GraphQLString },
                email: { type: GraphQLString },
                phone: { type: GraphQLString }
            },
            resolve: async (parent, args) => {
                const user = await User.create({
                    name: args.name,
                    email: args.email,
                    phone: args.phone
                });
                return user;
            }
        },
        updateUser: {
            type: UserType,
            args: {
                id: { type: GraphQLID },
                name: { type: GraphQLString },
                email: { type: GraphQLString },
                phone: { type: GraphQLString }
            },
            resolve: async (parent, args) => {
                const user = await User.findByIdAndUpdate(args.id, args, { new: true });
                return user;
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: GraphQLID }
            },
            resolve: async (parent, args) => {
                const user = await User.findByIdAndDelete(args.id);
                return user;
            }
        },
        addPost: {
            type: PostType,
            args: {
                id: { type: GraphQLID },
                userId: { type: GraphQLID },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                status: {
                    type: new GraphQLEnumType({
                        name: 'PostStatus',
                        values: {
                            PENDING: { value: 'pending' },
                            COMPLETED: { value: 'completed' },
                            CANCELLED: { value: 'cancelled' }
                        }
                    }),
                    defaultValue: 'pending'
                },
                userId: { type: GraphQLID }
            },
            resolve: async (parent, args) => {
                const post = await Post.create({
                    userId: args.userId,
                    name: args.name,
                    description: args.description,
                    status: args.status
                });
                return post;
            }
        },
        updatePost: {
            type: PostType,
            args: {
                id: { type: GraphQLID },
                userId: { type: GraphQLID },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                status: { type: GraphQLString }
            },
            resolve: async (parent, args) => {
                const post = await Post.findByIdAndUpdate(args.id, args, { new: true });
                return post;
            }
        },
        deletePost: {
            type: PostType,
            args: {
                id: { type: GraphQLID }
            },
            resolve: async (parent, args) => {
                const post = await Post.findByIdAndDelete(args.id);
                return post;
            }
        }
    }
});


module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});
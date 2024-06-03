const users = require('../database/Users.json');
const posts = require('../database/Posts.json');
const fs = require('fs');
const path = require('path');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
    GraphQLEnumType,
} = require("graphql");


//% GraphQL Schema
/* const { buildSchema } = require("graphql");
const UserType = buildSchema(`
    type User {
        id: ID
        name: String
        email: String
        phone: String
    }

    type Query {
        users: [User]
        user(id: ID): User
    }
`); */


//% Object Types
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
        user: { //* Relazione con UserType
            type: UserType,
            resolve: (parent, args) => {
                console.log("Parent:", parent);
                const user = users.find(user => user.id.toString() == parent.userId);
                console.log("Matching user:", user);
                return user;
            }
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
            resolve: (parent, args) => users.find(user => user.id.toString() == args.id)
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve: () => posts
        },
        post: {
            type: PostType,
            args: { id: { type: GraphQLID } },
            resolve: (parent, args) => posts.find(post => post.id.toString() === args.id)
        }
    }
});


//% Mutations
const RootMutation = new GraphQLObjectType({
    name: 'RootMutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
                phone: { type: GraphQLString }
            },
            resolve: (parent, args) => {
                const newUser = {
                    id: args.id || Date.now().toString(),
                    name: args.name,
                    email: args.email,
                    password: args.password,
                    phone: args.phone
                };
                users.push(newUser);
                fs.writeFile(
                    path.join(__dirname, '../database/Users.json'),
                    JSON.stringify(users, null, 2),
                    err => {
                        if (err) {
                            console.error('Error writing file:', err);
                        }
                    }
                );
                return newUser;
            }
        },
        updateUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
                phone: { type: GraphQLString }
            },
            resolve: (parent, args) => {
                const user = users.find(user => user.id === args.id);
                if (!user) {
                    throw new Error('User not found');
                }
                Object.keys(args).forEach(key => {
                    if (args[key] !== undefined) {
                        user[key] = args[key];
                    }
                });
                fs.writeFile(
                    path.join(__dirname, '../database/Users.json'),
                    JSON.stringify(users, null, 2),
                    err => {
                        if (err) {
                            console.error('Error writing file:', err);
                        }
                    }
                );
                return user;
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: (parent, args) => {
                const index = users.findIndex(user => user.id === args.id);
                if (index === -1) {
                    throw new Error('User not found');
                }
                const deletedUsers = users.splice(index, 1);
                fs.writeFile(
                    path.join(__dirname, '../database/Users.json'),
                    JSON.stringify(users, null, 2),
                    err => {
                        if (err) {
                            console.error('Error writing file:', err);
                        }
                    }
                );
                return deletedUsers[0];
            }
        },
        addPost: {
            type: PostType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                userId: { type: new GraphQLNonNull(GraphQLID) },
                title: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLString }
            },
            resolve: (parent, args) => {
                const newPost = {
                    id: args.id || Date.now().toString(),
                    userId: args.userId,
                    title: args.title,
                    description: args.description
                };
                posts.push(newPost);
                fs.writeFile(
                    path.join(__dirname, '../database/Posts.json'),
                    JSON.stringify(posts, null, 2),
                    err => {
                        if (err) {
                            console.error('Error writing file:', err);
                        }
                    }
                );
                return newPost;
            }
        },
        updatePost: {
            type: PostType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                userId: { type: GraphQLID },
                title: { type: GraphQLString },
                description: { type: GraphQLString }
            },
            resolve: (parent, args) => {
                const post = posts.find(post => post.id === args.id);
                if (!post) {
                    throw new Error('Post not found');
                }
                Object.keys(args).forEach(key => {
                    if (args[key] !== undefined) {
                        post[key] = args[key];
                    }
                });
                fs.writeFile(
                    path.join(__dirname, '../database/Posts.json'),
                    JSON.stringify(posts, null, 2),
                    err => {
                        if (err) {
                            console.error('Error writing file:', err);
                        }
                    }
                );
                return post;
            }
        },
        deletePost: {
            type: PostType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: (parent, args) => {
                const index = posts.findIndex(post => post.id === args.id);
                if (index === -1) {
                    throw new Error('Post not found');
                }
                const deletedPosts = posts.splice(index, 1);
                fs.writeFile(
                    path.join(__dirname, '../database/Posts.json'),
                    JSON.stringify(posts, null, 2),
                    err => {
                        if (err) {
                            console.error('Error writing file:', err);
                        }
                    }
                );
                return deletedPosts[0];
            }
        },
    }
});


module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});
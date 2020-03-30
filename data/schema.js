const { makeExecutableSchema } = require("graphql-tools");
const { gql } = require("apollo-server-express");
const resolvers = require("./resolvers");

// Define our schema using the GraphQL schema language
const typeDefs = gql`
  type Todo {
    userId: ID!
    title: String!
  }

  type Query {
    myTodos: [Todo]
  }

  type Mutation {
    addTodo(title: String!): Todo
  }
`;

module.exports = { typeDefs, resolvers };

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./data/schema");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwksClient = require("jwks-rsa");

const PORT = 3000;

// create our express app
const app = express();

// enable CORS
app.use(cors());

const client = jwksClient({
  jwksUri: `${process.env.AUTH0_ISSUER}.well-known/jwks.json`
});

function getKey(header, cb) {
  client.getSigningKey(header.kid, function(err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    cb(null, signingKey);
  });
}

const options = {
  aud: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_ISSUER,
  algorithms: ["RS256"]
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // simple auth check on every request
    const token = req.headers.authorization;
    console.log("token", token);
    const user = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, options, (err, decoded) => {
        if (err) {
          return reject(err);
        }
        console.log("decoded:", decoded);
        resolve(decoded);
      });
    });
    console.log(user);
    return {
      user
    };
  }
});

apolloServer.applyMiddleware({ app, cors: false });

app.listen(PORT, () => {
  console.log(`The GraphQL server is running on http://localhost:${PORT}/api`);
});

var express = require("express");
var { createHandler } = require("graphql-http/lib/use/express");
var { ruruHTML } = require("ruru/server");
const schema = require("./graphql/schema");
const PORT = 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// La root fornisce una funzione di risoluzione per ciascun endpoint API
var root = {
    hello() {
        return "Hello world!"
    },
}
// Creare un GraphQL endpoint
app.all(
    "/graphql",
    createHandler({
        schema: schema,
        //rootValue: root,
        //graphiql: true,
    })
);
// Servire l'IDE di GraphQL
app.get("/", (_req, res) => {
    res.type("html");
    res.end(ruruHTML({ endpoint: "/graphql" }));
});

try {
    app.listen(PORT, console.log(`Server started on http://localhost:${PORT}`));
    console.log(`Running a GraphQL API server at http://localhost:${PORT}/graphql`);
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
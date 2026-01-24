import { ApolloClient, InMemoryCache } from "@apollo/client"
import { createHttpLink } from "@apollo/client/link/http"

const httpLink = createHttpLink({
    uri: "http://localhost:3001/graphql",
})

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
})

export default client

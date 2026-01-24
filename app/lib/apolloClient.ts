import { ApolloClient, InMemoryCache } from "@apollo/client"
import { createHttpLink } from "@apollo/client/link/http"

const httpLink = createHttpLink({
    uri: "/api/graphql",
})

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
})

export default client

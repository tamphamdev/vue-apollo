import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import AuthPlugin from "./plugins/auth";
import { WebSocketLink } from "apollo-link-ws";
import ApolloClient from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import VueApollo from "vue-apollo";
Vue.use(AuthPlugin);
Vue.config.productionTip = false;

const getHeader = () => {
  const headers = {};
  const token = window.localStorage.getItem("apollo-token");
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  return headers;
};

const link = new WebSocketLink({
  uri: "wss://hasura.io/learn/graphql",
  options: {
    reconnect: true,
    timeout: 3000,
    connectionParams: () => {
      return {
        headers: getHeader()
      };
    }
  }
});

const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    addTypename: true
  })
});

const apolloProvider = new VueApollo({
  defaultClient: client
});
Vue.use(VueApollo);
new Vue({
  router,
  apolloProvider,
  render: h => h(App)
}).$mount("#app");

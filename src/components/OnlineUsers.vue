<template>
  <div class="sliderMenu grayBgColor">
    <div class="sliderHeader">
      Online users - {{ online_list.length }}
    </div>
    <div
      class="userInfo"
      v-for="user in online_list"
      v-bind:key="user.user.name"
    >
      <div class="userImg">
        <i class="far fa-user" />
      </div>
      <div class="userName">
        {{ user.user.name }}
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag"
export default {
  data () {
    return {
      online_list: [
        { user: { name: "someUser1" } },
        { user: { name: "someUser2" } }
      ]
    };
  },
  mounted () {
    const UPDATE_LASTSEEN_MUTATION = gql`
      mutation updateLastSeen($now: timestamptz!) {
      update_users(where: {}, _set : {last_seen: $now}) {
        affected_rows
        }
      }
    `
    setInterval(() => {
      this.$apollo.mutate({
        muations: UPDATE_LASTSEEN_MUTATION,
        variables: {
          now: new Date().toISOString()
        }
      })
    }, 30000);
  }
}

</script>

<template>
  <div>
    <div class="todoListwrapper">
      <div
        class="loadMoreSection"
        v-if="newTodosCount"
        v-on:click="loadMoreClicked"
      >
        New tasks have arrived! ({{ newTodosCount }})
      </div>
      <TodoItem
        v-bind:todos="todos"
        v-bind:type="type"
      />
      <div
        class="loadMoreSection"
        v-if="olderTodosAvailable"
        v-on:click="loadOlderClicked"
      >
        Load older tasks
      </div>
    </div>
  </div>
</template>

<script>
import TodoItem from "../components/TodoItem";
import TodoFilters from "../components/TodoFilters";
import gql from "graphql-tag"
const NOTIFY_NEW_PUBLIC_TODOS = gql`
  subscription notifyNewPublicTodos {
	todos(where:{is_public: {_eq: true}}, order_by: {created_at:desc}, limit: 1) {
    id,title,
    user{
      name
    },
    created_at
  }
}`

const GET_OLD_PUBLIC_TODOS = gql`
  query getOldPublicTodos($oldestTodoId: Int) {
  todos(where: {is_public: {_eq: true}, id: {_lt: $oldestTodoId}}, limit: 7, order_by: {created_at:desc}) {
    id,title,created_at,is_public, user {name}
  }
}`

const GET_NEW_PUBLIC_TODOS = gql`
query getNewPublicTodos($latestTodoVisibleId: Int!) {
  todos(where: {is_public: {_eq: true}, id:{_gt: $latestTodoVisibleId}},order_by: {created_at: desc}) {
    id,title,created_at, is_public, user{name}
  }
}`
export default {
  components: {
    TodoItem, TodoFilters
  },
  data: function () {
    return {
      olderTodosAvailable: true,
      newTodosCount: 1,
      limit: 7,
      todos: [
        {
          id: "1",
          title: "This is public todo 1",
          is_public: true,
          user: {
            name: "someUser1"
          }
        },
        {
          id: "2",
          title: "This is public todo 2",
          is_completed: false,
          is_public: true,
          user: {
            name: "someUser2"
          }
        },
        {
          id: "3",
          title: "This is public todo 3",
          is_public: true,
          user: {
            name: "someUser3"
          }
        },
        {
          id: "4",
          title: "This is public todo 4",
          is_public: true,
          user: {
            name: "someUser4"
          }
        }
      ],
      type: "public"
    }
  },
  mounted () {
    const that = this
    this.$apollo.query({
      query: GET_OLD_PUBLIC_TODOS
    }).then(({ data }) => {
      this.todos = data.todos
      this.$apollo.subscribe({ query: NOTIFY_NEW_PUBLIC_TODOS }).subscribe({
        next ({ data }) {
          if (data.todos.length) {
            if (data.todos[0] !== that.todos[0].id) {
              that.newTodosCount = that.newTodosCount + data.todos.length
            }
          }
        },
        error (err) {
          //eslint-disable-next-line
          console.log('err :', err);
        }
      })
    })
  },
  methods: {
    loadMoreClicked: function () {
      this.newTodosCount = 0
      this.$apollo.query({
        query: GET_NEW_PUBLIC_TODOS,
        variables: {
          latestTodoVisibleId: this.todos.length ? this.todos[0].id : null
        }
      }).then(({ data }) => {
        //eslint-disable-next-line
        console.log('worked from load more :', data);
        if (data.todos.length) {
          const mergedTodos = data.todos.concat(this.todos)
          this.todos = mergedTodos
        } else {
          this.olderTodosAvailable = false
        }
      })
    },
    loadOlderClicked: function () {
      //eslint-disable-next-line
      console.log('worked :');
      this.$apollo.query({
        query: GET_OLD_PUBLIC_TODOS,
        variables: {
          oldestTodoId: this.todos.length ? this.todos[this.todos.length - 1].id : null
        }
      }).then(({ data }) => {
        if (data.todos.length) {
          const mergedTodos = this.todos.concat(data.todos)
          this.todos = mergedTodos
        } else {
          this.olderTodosAvailable = false
        }
      })
    }
  }
}
</script>

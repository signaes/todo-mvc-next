import { Machine, assign } from 'xstate'

export const resolveVisible = (visibility, todos) => {
  switch (visibility) {
    case 'SHOW.ALL':
      return todos
      break
    case 'SHOW.ACTIVE':
      return todos.filter(todo => todo.complete === false)
      break
    case 'SHOW.COMPLETE':
      return todos.filter(todo => todo.complete)
  }
}

const removeItemAction = (context, event) => {
  const todos = context.todos.filter(todo => todo.id !== event.id)

  return {
    ...context,
    todos,
    visibleTodos: resolveVisible(context.visibility, todos)
  }
}

const todosMachine = Machine({
  id: 'todos',
  initial: 'idle',
  context: {
    retries: 0,
    todos: [],
    // states: 'SHOW.ALL', 'SHOW.ACTIVE', 'SHOW.COMPLETE'
    visibility: 'SHOW.ALL',
    error: null,
    currentlyUpdatingId: null
  },
  states: {
    idle: {
      on: {
        FETCH: 'loading'
      }
    },
    loading: {
      on: {
        RESOLVE: {
          target: 'success.idle',
          actions: assign((context, { todos }) => {
            return {
              ...context,
              todos,
              visibleTodos: todos
            }
          })
        },
        REJECT: 'failure'
      }
    },
    failure: {
      on: {
        RETRY: {
          target: 'loading',
          actions: assign({
            retries: (context, event) => context.retries + 1
          })
        }
      }
    },
    success: {
      states: {
        idle: {
          on: {
            'ADD': {
              target: 'addItem',
              actions: assign((context, event) => {
                const todos = [...context.todos, event.todo]

                return {
                  ...context,
                  todos,
                  visibleTodos: resolveVisible(context.visibility, todos)
                }
              })
            },
            'REMOVE': {
              target: 'removeItem',
              actions: assign(removeItemAction)
            },
            'UPDATE.START': {
              target: 'update',
              actions: assign((context, event) => {
                return {
                  ...context,
                  currentlyUpdatingId: event.id || null
                }
              })
            },
            'SHOW.ALL': {
              target: 'showAll',
              actions: assign(context => {
                return {
                  ...context,
                  visibility: 'SHOW.ALL'
                }
              })
            },
            'SHOW.ACTIVE': {
              target: 'showActive',
              actions: assign(context => {
                return {
                  ...context,
                  visibility: 'SHOW.ACTIVE'
                }
              })
            },
            'SHOW.COMPLETE': {
              target: 'showComplete',
              actions: assign(context => {
                return {
                  ...context,
                  visibility: 'SHOW.COMPLETE'
                }
              })
            }
          }
        },
        addItem: {
          on: {
            'FAIL': 'idle',
            'SUCCESS': 'idle',
          }
        },
        removeItem: {
          on: {
            'FAIL': 'idle',
            'SUCCESS': 'idle'
          }
        },
        update: {
          on: {
            'FAIL': 'idle',
            'SUCCESS': 'idle',
            'ABORT': 'idle',
            'REMOVE': {
              target: 'removeItem',
              actions: assign(removeItemAction)
            },
            'UPDATE': {
              target: 'update',
              actions: assign((context, { id, title, complete }) => {
                const update = todo => {
                  if (todo.id !== id) {
                    return todo;
                  }

                  return { id, title, complete }
                }

                return {
                  ...context,
                  todos: context.todos.map(update),
                  currentlyUpdatingId: null
                }
              })
            },
            'TOGGLE.ALL': {
              target: 'idle',
              actions: assign(context => {
                const { todos } = context
                const someIncomplete = todos.some(todo => todo.complete === false)

                return {
                  ...context,
                  todos: someIncomplete
                    ? todos.map(todo => ({ ...todo, complete: true }))
                    : todos.map(todo => ({ ...todo, complete: false }))
                }
              })
            },
            'DESTROY.COMPLETED': {
              target: 'idle',
              actions: assign(context => {
                return {
                  ...context,
                  todos: context.todos.filter(todo => todo.complete === false)
                }
              })
            }
          }
        },
        showAll: {
          on: {
            'SUCCESS': 'idle'
          }
        },
        showActive: {
          on: {
            'SUCCESS': 'idle'
          }
        },
        showComplete: {
          on: {
            'SUCCESS': 'idle'
          }
        }
      }
    },
  }
});

export default todosMachine

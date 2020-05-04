import { Machine, assign, spawn, sendParent } from 'xstate'

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
  }
}

const todoMachine = Machine({
  id: 'todoMachine',
  initial: 'idle',
  context: {
    complete: false,
    editing: false,
    title: ''
  },
  states: {
    idle: {
      on: {
        TOGGLE: {
          target: 'idle',
          actions: assign(context => ({
            ...context,
            complete: !context.complete
          }))
        },
        EDIT: {
          target: 'editing',
          actions: sendParent('UPDATE.START')
        },
      },
      states: {
        hist: {
          history: true
        }
      }
    },
    editing: {
      on: {
        'EDITING.COMPLETE': {
          target: 'idle',
          actions: [
            assign((context, event) => ({
              ...context,
              title: event.title
            })),
            sendParent('SUCCESS')
          ]
        },
        ABORT: {
          target: 'idle',
          actions: sendParent('ABORT')
        }
      }
    }
  }
})

const todosMachine = Machine({
  id: 'todos',
  initial: 'idle',
  context: {
    retries: 0,
    todos: [],
    // states: 'SHOW.ALL', 'SHOW.ACTIVE', 'SHOW.COMPLETE'
    visibility: 'SHOW.ALL',
    error: null,
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
          target: 'success',
          actions: assign((context, { todos }) => {
            return {
              ...context,
              todos: todos.map(todo => ({
                ...todo,
                ref: spawn(todoMachine.withContext(todo), todo.id)
              })),
            }
          })
        },
        REJECT: 'failure'
      },
      meta: {
        message: 'Loading'
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
      },
      meta: {
        message: 'Something went wrong'
      }
    },
    success: {
      type: 'parallel',
      states: {
        ui: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                'ADD': {
                  target: 'addItem',
                  actions: assign((context, event) => {
                    const todos = [...context.todos, {
                      ...event.todo,
                      ref: spawn(todoMachine.withContext(event.todo), event.todo.id)
                    }]

                    return {
                      ...context,
                      todos,
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
                'FAIL': {
                  target: 'idle',
                },
                'SUCCESS': {
                  target: 'idle',
                },
                'ABORT': {
                  target: 'idle',
                },
                'REMOVE': {
                  target: 'removeItem',
                  actions: assign(removeItemAction)
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
        sync: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                SYNC: 'loading'
              }
            },
            loading: {
              on: {
                SUCCESS: 'idle',
                FAILURE: 'retry'
              }
            },
            retry: {
              on: {
                SUCCESS: 'idle',
                FAILURE: 'retry'
              }
            }
          }
        }
      }
    },
  }
});

export default todosMachine

import { Machine, assign, spawn, send, sendParent } from 'xstate'
import Todo from '../../../models/todo'
import todoMachine from '../todo'

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
                id: todo.id,
                ref: spawn(todoMachine.withContext(todo), { id: todo.id, sync: true })
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
                      ref: spawn(todoMachine.withContext(event.todo), { sync: true })
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
                  target: 'update'
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
                    const allComplete = todos.filter(({ ref }) => ref.state.context.complete === false).length === 0
                    const complete = allComplete ? false : true;

                    context.todos.forEach(todo => todo.ref.send({ type: 'UPDATE.COMPLETENESS', complete }));

                    return context
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
                SYNC: 'loading',
                'TOGGLE.ALL': {
                  target: 'idle',
                  actions: [
                    assign(async ({ todos }) => {
                      const complete = todos[0].ref.state.context.complete

                      try {
                        await Todo.updateAll(complete)
                        send('SUCCESS')
                      } catch (err) {
                        console.error(err);
                        send('FAILURE', { error: err })
                      }
                    })
                  ]
                },
                'DESTROY.COMPLETED': {
                  target: 'idle',
                  actions: [
                    assign(async () => {
                      try {
                        await Todo.destroyCompleted();
                        send('SUCCESS');
                      } catch (err) {
                        console.error(err);
                        send('FAILURE', { error: 'err' });
                      }
                    })
                  ],
                }
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

import { Machine, assign, spawn, send, sendParent, sendUpdate } from 'xstate'

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
          actions: [
            assign(context => ({
              ...context,
              complete: !context.complete
            })),
          ]
        },
        'UPDATE.COMPLETENESS': {
          target: 'idle',
          actions: [
            assign((context, { complete }) => {
              return {
                ...context,
                complete
              }
            }),
            sendParent('SUCCESS'),
          ]
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

export default todoMachine

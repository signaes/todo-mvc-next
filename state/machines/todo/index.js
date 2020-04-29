import { Machine, assign } from 'xstate'

const toggleCompleteAction = context => {
  return {
    ...context,
    complete: !context.complete
  }
}

const todoMachine = ({ id, complete }) => Machine({
  id,
  initial: complete ? 'complete' : 'incomplete',
  context: {
    complete
  },
  states: {
    incomplete: {
      on: {
        TOGGLE: {
          target: 'complete',
          actions: assign(toggleCompleteAction)
        }
      }
    },
    complete: {
      on: {
        TOGGLE: {
          target: 'incomplete',
          actions: assign(toggleCompleteAction)
        }
      }
    }
  }
})

export default todoMachine

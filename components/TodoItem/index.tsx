import { useMachine } from '@xstate/react';
import { Machine, StateValueMap } from 'xstate';

type CompletionState = 'complete' | 'incomplete';

const COMPLETE: CompletionState = 'complete';
const INCOMPLETE: CompletionState = 'incomplete';

const setDone: (state: string) => boolean = state => state === INCOMPLETE;

const todoMachine = ({ id, done }: { id: string; done: boolean }) => Machine({
  id,
  initial: done ? COMPLETE : INCOMPLETE,
  states: {
    incomplete: {
      on: { TOGGLE: COMPLETE }
    },
    complete: {
      on: { TOGGLE: INCOMPLETE }
    }
  }
});

const TodoItem = ({ id, title, done, handleToggle, handleDelete }) => {
  const [state, send] = useMachine(todoMachine({ id, done }));
  const toggle = () => {
    send('TOGGLE');
    handleToggle({ id, done: setDone(state.value as string) });
  };
  const del = () => handleDelete(id);

  return (
    <div>
      { state.value === COMPLETE
        ? 'Feito'
        : 'A fazer'
      }
      <button onClick={toggle}>
        Done
      </button>
      <div>
        { title }
      </div>
      <button onClick={del}>
        Delete todo
      </button>
    </div>
  );
};

export default TodoItem;

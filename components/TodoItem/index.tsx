import { useState, useRef } from 'react';
import { useMachine } from '@xstate/react';
import { Machine, StateValueMap } from 'xstate';
import TodoInput from '../TodoInput';

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

const TodoItem = ({ id, title, done, handleDelete, handleUpdate }) => {
  const [ currentTitle, setTitle ] = useState(title);
  const [ state, send ] = useMachine(todoMachine({ id, done }));
  const [ updating, setUpdating ] = useState(false);
  const inputRef = useRef(null);
  const toggle = () => {
    send('TOGGLE');
    handleUpdate({ id, done: setDone(state.value as string) });
  };
  const del = () => handleDelete(id);
  const update = (value) => {
    setTitle(value);
    setUpdating(false);
    handleUpdate({ id, title: value });
  };
  const startUpdating = () => {
    setUpdating(true)

    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };
  const handleChange = value => setTitle(value);

  return (
    <div>
      { state.value === COMPLETE
        ? 'Feito'
        : 'A fazer'
      }
      <button onClick={toggle}>
        Done
      </button>
      <div style={{ position: 'relative', height: '2em' }}>
        <div style={{
          position: 'absolute',
          height: '2em',
          opacity: updating ? '100' : '0',
          pointerEvents: updating ? 'all' : 'none'
        }}>
          <TodoInput
            initialValue={currentTitle}
            currentValue={currentTitle}
            onChange={handleChange}
            onEnter={update}
            ref={inputRef}
          />
        </div>
        <div onClick={startUpdating} style={{
          position: 'absolute',
          height: '2em',
          opacity: updating ? '0' : '100',
          pointerEvents: updating ? 'none' : 'all'
        }}>
          <span>{ currentTitle }</span>
        </div>
      </div>
      <button onClick={del}>
        Delete todo
      </button>
    </div>
  );
};

export default TodoItem;

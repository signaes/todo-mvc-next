import { useState, useRef } from 'react';
import { useMachine } from '@xstate/react';
import { Machine } from 'xstate';
import TodoInput from '../TodoInput';

type CompletionState = 'complete' | 'incomplete';

const COMPLETE: CompletionState = 'complete';
const INCOMPLETE: CompletionState = 'incomplete';

const setDone: (state: string) => boolean = state => state === INCOMPLETE;

const todoMachine = ({ id, complete }: { id: string; complete: boolean }) => Machine({
  id,
  initial: complete ? COMPLETE : INCOMPLETE,
  states: {
    incomplete: {
      on: { TOGGLE: COMPLETE }
    },
    complete: {
      on: { TOGGLE: INCOMPLETE }
    }
  }
});

const TodoItem = ({ id, title, complete, handleDelete, handleUpdate, handleFocus }) => {
  const [ initialTitle, setInitialTitle ] = useState(title);
  const [ currentTitle, setTitle ] = useState(title);
  const [ state, send ] = useMachine(todoMachine({ id, complete }));
  const [ updating, setUpdating ] = useState(false);
  const inputRef = useRef(null);
  const toggle = () => {
    send('TOGGLE');
    handleUpdate({ id, complete: setDone(state.value as string) });
  };
  const del = () => handleDelete(id);
  const update = (value) => {
    const title = value.trim();

    if (title) {
      setInitialTitle(title);
      setTitle(title);
      handleUpdate({ id, title });
    } else {
      del();
    }

    setUpdating(false);
  };
  const startUpdating = () => {
    setUpdating(true)

    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };
  const handleChange = value => setTitle(value);
  const handleEsc = () => {
    setTitle(initialTitle);
    setUpdating(false);
  }

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
            onFocus={handleFocus}
            onChange={handleChange}
            onEnter={update}
            onEsc={handleEsc}
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

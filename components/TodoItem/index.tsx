import styles from './styles.module.scss';
import { useState, useRef } from 'react';
import TodoInput from '../TodoInput';

const TodoItem = ({
  id,
  title,
  complete,
  onDelete: handleDelete,
  onUpdate: handleUpdate,
  onEsc,
  onFocus: handleFocus,
  isIdle
}) => {
  const [ initialTitle, setInitialTitle ] = useState(title);
  const [ currentTitle, setTitle ] = useState(title);
  const [ updating, setUpdating ] = useState(false);
  const inputRef = useRef(null);

  const toggle = () => {
    handleUpdate({ id, complete: !complete });
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
    if (!isIdle) {
      return;
    }

    setUpdating(true);

    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };
  const handleChange = value => setTitle(value);
  const handleEsc = () => {
    setTitle(initialTitle);
    setUpdating(false);
    onEsc();
  }

  const checkboxContainerClassName = updating
    ? styles.completeCheckContainerDisabled
    : styles.completeCheckContainer

  return (
    <div className={styles.container}>
      <div
        className={checkboxContainerClassName}
      >
        <input
          id={`completeCheck-${id}`}
          type="checkbox"
          disabled={!isIdle}
          onChange={toggle}
          checked={complete}
        />
        <label htmlFor={`completeCheck-${id}`} />
      </div>
      <div className={styles.titleContainer} data-disabled={!updating && !isIdle}>
        <div className={styles.titleInputContainer} style={{
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
        <div className={styles.titleTextContainer} onClick={startUpdating} style={{
          opacity: updating ? '0' : '100',
          pointerEvents: updating ? 'none' : 'all'
        }}>
          <span>{ currentTitle }</span>
        </div>
      </div>
      <button className={styles.destroyButton} onClick={del} disabled={!isIdle}>
        ×
      </button>
    </div>
  );
};

export default TodoItem;

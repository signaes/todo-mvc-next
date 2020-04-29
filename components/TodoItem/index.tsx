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
  isIdle,
  isUpdating
}: {
  id: string;
  title: string;
  complete: boolean;
  onDelete: (id: string) => void;
  onUpdate: (item: { id: string, title?: string, complete?: boolean }) => void;
  onEsc: () => void;
  onFocus: () => void;
  isIdle: boolean;
  isUpdating: boolean;
}) => {
  const [ initialTitle, setInitialTitle ] = useState(title);
  const [ currentTitle, setTitle ] = useState(title);
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
      handleUpdate({ id, title, complete });
    } else {
      del();
    }
  };
  const startUpdating = e => {
    if (!isIdle) {
      return;
    }

    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };
  const handleChange = value => setTitle(value);
  const handleEsc = () => {
    setTitle(initialTitle);
    onEsc();
  }

  const checkboxContainerClassName = isUpdating
    ? styles.completeCheckContainerDisabled
    : styles.completeCheckContainer

  return (
    <div
      className={styles.container}
    >
      <div
        className={checkboxContainerClassName}
      >
        <input
          id={`completeCheck-${id}`}
          type="checkbox"
          disabled={!isIdle || isUpdating}
          onChange={toggle}
          checked={complete}
        />
        <label htmlFor={`completeCheck-${id}`} />
      </div>
      <div
        onClick={startUpdating}
        className={styles.titleContainer}
        data-disabled={!isUpdating && !isIdle}
      >
        <div className={styles.titleInputContainer} style={{
          opacity: isUpdating ? '100' : '0',
          pointerEvents: isUpdating ? 'all' : 'none'
        }}>
          <TodoInput
            initialValue={currentTitle}
            currentValue={currentTitle}
            onFocus={handleFocus}
            onChange={handleChange}
            onEnter={update}
            onEsc={handleEsc}
            onBlur={handleEsc}
            ref={inputRef}
          />
        </div>
        <div className={styles.titleTextContainer} style={{
          opacity: isUpdating ? '0' : '100',
          pointerEvents: isUpdating ? 'none' : 'all'
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

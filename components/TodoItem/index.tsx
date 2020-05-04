import styles from './styles.module.scss';
import { useService } from '@xstate/react'
import { KEYS } from '../../constants';
import { useState, useRef } from 'react';
import TodoInput from '../TodoInput';

const TodoItem = ({
  onDelete: handleDelete,
  onUpdate: handleUpdate,
  service,
}: {
  onDelete: (id: string) => void;
  onUpdate: (item: { id: string, title?: string, complete?: boolean }) => void;
  service: any;
}) => {
  const [ current, send ] = useService(service);
  const { context: { title, complete, id } } = current as any;
  const [ tempTitle, setTempTitle ] = useState(title);
  const inputRef = useRef(null);

  const toggle = () => {
    send('TOGGLE');
    handleUpdate({ id, complete: !complete });
  };
  const del = () => handleDelete(id);
  const update = (value) => {
    const title = value.trim();

    if (!title) {
      del();
    }

    send('EDITING.COMPLETE', { title });
    setTempTitle(title);
    handleUpdate({ id, title, complete });
  };
  const startUpdating = e => {
    send('EDIT');

    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };
  const handleChange = value => {
    setTempTitle(value.trim());
  };
  const handleEsc = () => {
    setTempTitle(title);
    send('ABORT');
  }

  const checkboxContainerClassName = current.matches('editing')
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
          disabled={current.matches('editing')}
          onChange={toggle}
          checked={complete}
        />
        <label htmlFor={`completeCheck-${id}`} />
      </div>
      <div
        onClick={startUpdating}
        className={styles.titleContainer}
        data-disabled={current.matches('editing')}
      >
        <div className={styles.titleInputContainer} style={{
          opacity: current.matches('editing') ? '100' : '0',
          pointerEvents: current.matches('editing') ? 'all' : 'none'
        }}>
          <input
            value={tempTitle}
            onChange={({ target: { value } }) => handleChange(value)}
            onKeyUp={(e) => {
              switch (e.key) {
                case KEYS.ENTER:
                  update(tempTitle);
                  break;
                case KEYS.ESC:
                  handleEsc();
              }
            }}
            onBlur={handleEsc}
            ref={inputRef}
          />
        </div>
        <div className={styles.titleTextContainer} style={{
          opacity: current.matches('editing') ? '0' : '100',
          pointerEvents: current.matches('editing') ? 'none' : 'all'
        }}>
          <span>{ title }</span>
        </div>
      </div>
      <button className={styles.destroyButton} onClick={del} disabled={!current.matches('idle')}>
        ×
      </button>
    </div>
  );
};

export default TodoItem;

import React, { useState, forwardRef, Ref } from 'react';
import styles from './styles.module.css';
import { KEYS } from '../../constants';

interface Input {
  initialValue?: string;
  currentValue?: string;
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onEnter: (value: string) => void;
  onEsc?: () => void;
  placeholder?: string;
}

const TodoInput = React.forwardRef((props: Input, ref: React.Ref<HTMLInputElement>) => {
  const {
    initialValue = '',
    currentValue,
    onChange,
    onEnter: handleEnter,
    onEsc: handleEsc,
    onFocus: handleFocus,
    placeholder = 'What needs to be complete?',
  } = props;
  const [value, setValue] = useState(initialValue);

  if (!!currentValue && !onChange) {
    throw new Error('To use currentValue onChange have to be passed to handle updating it');
  }

  const handleChange = ({ target: { value } }) => {
    if (onChange) {
      return onChange(value);
    }

    setValue(value);
  }

  return (
    <input
      ref={ref}
      type="text"
      placeholder={placeholder}
      className={styles.input}
      value={currentValue !== null && currentValue !== undefined ? currentValue : value}
      onChange={handleChange}
      onFocus={() => {
        if (typeof handleFocus === 'function') {
          handleFocus();
        }
      }}
      onKeyUp={({ key }) => {
        switch (key) {
          case KEYS.ENTER:
            handleEnter(currentValue !== null && currentValue !== undefined ? currentValue : value);
            setValue(currentValue !== null && currentValue !== undefined ? currentValue : initialValue);
            break;
          case KEYS.ESC:
            if (typeof handleEsc === 'function') {
              handleEsc();
            }
        }
      }}
    />
  );
});

export default TodoInput;

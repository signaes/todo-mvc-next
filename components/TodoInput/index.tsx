import React, { useState, forwardRef, Ref } from 'react';
import styles from './styles.module.css';
import { ENTER } from '../../constants';

interface Input {
  initialValue?: string;
  currentValue?: string;
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void;
  onEnter: (value: string) => void;
  placeholder?: string;
}

const TodoInput = React.forwardRef((props: Input, ref: React.Ref<HTMLInputElement>) => {
  const {
    initialValue = '',
    currentValue,
    onChange,
    onEnter: handleEnter,
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
      onKeyUp={({ key }) => {
        if (key === ENTER) {
          handleEnter(currentValue !== null && currentValue !== undefined ? currentValue : value);
          setValue(currentValue !== null && currentValue !== undefined ? currentValue : initialValue);
        }
      }}
    />
  );
});

export default TodoInput;

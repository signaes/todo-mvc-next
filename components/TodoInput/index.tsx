import React, { useState, forwardRef, Ref } from 'react';
import styles from './styles.module.scss';
import { KEYS } from '../../constants';

interface Input {
  initialValue?: string;
  currentValue?: string;
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
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
    onEsc: handleEsc = () => null,
    onFocus: handleFocus = () => null,
    onBlur: handleBlur = () => null,
    placeholder = 'What needs to be done?',
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
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyUp={(e) => {
        switch (e.key) {
          case KEYS.ENTER:
            handleEnter(currentValue !== null && currentValue !== undefined ? currentValue : value);
            setValue(currentValue !== null && currentValue !== undefined ? currentValue : initialValue);
            break;
          case KEYS.ESC:
            handleEsc();
        }
      }}
    />
  );
});

export default TodoInput;

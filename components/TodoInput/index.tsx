import React, { useState } from 'react';
import styles from './styles.module.css';
import { ENTER } from '../../constants';

interface Input {
  onEnter: (value: string) => void;
  placeholder?: string;
}

const TodoInput: React.SFC<Input> = ({
  onEnter: handleEnter,
  placeholder = 'What needs to be done?'
}) => {
  const [value, setValue] = useState('');

  return (
    <input
      type="text"
      placeholder={placeholder}
      className={styles.input}
      value={value}
      onChange={({ target: { value } }) => setValue(value)}
      onKeyUp={({ key }) => {
        if (key === ENTER) {
          handleEnter(value);
          setValue('');
        }
      }}
    />
  );
};

export default TodoInput;

import styles from './styles.module.css';
import { useState, useEffect } from 'react'
import { useMachine } from '@xstate/react'
import Head from 'next/head'
import TodoInput from '../../components/TodoInput'
import TodoItem from '../../components/TodoItem'
import Todo, { TodoInterface } from '../../models/todo'
import todosMachine, {
  resolveVisible,
} from '../../state/machines/todos'


const Index = () => {
  const [ current, send ] = useMachine(todosMachine);

  useEffect(() => {
    (async function getData() {
      send('FETCH')

      try {
        const todos = await Todo.all();
        send('RESOLVE', { todos });
      } catch (err) {
        console.error(err);
        send('REJECT', { error: err });
      }
    }());
  }, []);

  const { context: { todos, visibility } } = current;

  const visibleTodos = resolveVisible(visibility, todos);

  const handleEnter = async (title: string) => {
    const cleanValue = title.trim();

    if (!cleanValue) {
      return;
    }

    const todo = new Todo(title);

    send('ADD', { todo });

    try {
      const todo = await Todo.add(title);
      send('SUCCESS');
    } catch (err) {
      send('FAIL', { error: err });
    }
  };

  const handleDelete = async (id: string) => {
    send('REMOVE', { id });

    try {
      await Todo.destroy(id);
      send('SUCCESS');
    } catch (err) {
      console.error(err);
      send('FAIL', { error: err });
    }
  };

  const handleUpdate = async ({ id, title, complete }) => {
    send('UPDATE', { id, title, complete });

    try {
      await Todo.update({ id, title, complete });
      send('SUCCESS');
    } catch (err) {
      console.error(err);
      send('FAIL', { error: err });
    }
  };

  const handleVisibility = (type) => () => {
    send(`SHOW.${type}`);
    send('SUCCESS');
  };

  const showAll = handleVisibility('ALL');
  const showActive = handleVisibility('ACTIVE');
  const showComplete = handleVisibility('COMPLETE');

  return (
    <>
      <Head>
        <title>Todos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1>Todos</h1>
        <TodoInput onEnter={handleEnter} />
        { current.matches('loading') && 'Loading' }
        { current.matches('failure') && 'Something went wrong' }
        { current.matches('success') && (
          <div>
            {
              visibleTodos.map(({ id, title, complete }: TodoInterface, idx) => (
                <TodoItem
                  key={id}
                  id={id}
                  title={title}
                  complete={complete}
                  handleFocus={() => send('UPDATE.START')}
                  handleUpdate={handleUpdate}
                  handleDelete={handleDelete}
                />
              ))
            }
            <div>
              <button
                onClick={showAll}
                disabled={!current.matches('success.idle')}
              >
                Show all
              </button>
              <button
                onClick={showActive}
                disabled={!current.matches('success.idle')}
              >
                Show active
              </button>
              <button
                onClick={showComplete}
                disabled={!current.matches('success.idle')}
              >
                Show complete
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default Index

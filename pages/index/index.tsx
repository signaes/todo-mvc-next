import styles from './styles.module.scss';
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

  const { context: { todos, visibility, currentlyUpdatingId } } = current;
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
    send('UPDATE.START', { id });
    send('UPDATE', { id, title, complete });

    try {
      await Todo.update({ id, title, complete });
      send('SUCCESS');
    } catch (err) {
      console.error(err);
      send('FAIL', { error: err });
    }
  };

  const handleToggleAll = async () => {
    if (todos.length === 0) {
      return;
    }

    send('UPDATE.START');
    send('TOGGLE.ALL');

    try {
      await Todo.updateAll(todos[0].complete);
      send('SUCCESS')
    } catch (err) {
      console.error(err);
      send('FAIL', { error: err });
    }
  }

  const handleDestroyCompleted = async () => {
    if (todos.length === 0) {
      return;
    }

    send('UPDATE.START');
    send('DESTROY.COMPLETED');

    try {
      await Todo.destroyCompleted();
      send('SUCCESS');
    } catch (err) {
      console.error(err);
      send('FAIL', { error: 'err' });
    }
  }

  const handleVisibility = (type) => () => {
    send(`SHOW.${type}`);
    send('SUCCESS');
  };

  const showAll = handleVisibility('ALL');
  const showActive = handleVisibility('ACTIVE');
  const showComplete = handleVisibility('COMPLETE');

  const remaining = todos.filter(todo => !todo.complete).length;
  const completed = todos.filter(todo => todo.complete).length;

  return (
    <>
      <Head>
        <title>Todos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1>Todos</h1>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.toggleAllContainer}>
              <input
                id="toggleAll"
                type="checkbox"
                checked={!todos.some(todo => todo.complete === false)}
                onChange={handleToggleAll}
              />
              <label htmlFor="toggleAll" />
            </div>
            <TodoInput onEnter={handleEnter} />
          </div>
          { current.matches('loading') && 'Loading' }
          { current.matches('failure') && 'Something went wrong' }
          { current.matches('success') && (
            <section>
              {
                visibleTodos.map(({ id, title, complete }: TodoInterface, idx) => (
                  <TodoItem
                    key={id}
                    id={id}
                    title={title}
                    complete={complete}
                    onFocus={() => send('UPDATE.START', { id })}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onEsc={() => send('ABORT')}
                    isIdle={current.matches('success.idle')}
                  />
                ))
              }
              <footer className={styles.footer}>
                <span>{ todos.filter(todo => !todo.complete).length } items left</span>
                <div className={styles.filters}>
                  <button
                    data-selected={visibility === 'SHOW.ALL'}
                    onClick={showAll}
                    disabled={!current.matches('success.idle')}
                  >
                    All
                  </button>
                  <button
                    data-selected={visibility === 'SHOW.ACTIVE'}
                    onClick={showActive}
                    disabled={!current.matches('success.idle')}
                  >
                    Active
                  </button>
                  <button
                    data-selected={visibility === 'SHOW.COMPLETE'}
                    onClick={showComplete}
                    disabled={!current.matches('success.idle')}
                  >
                    Completed
                  </button>
                </div>
                <button
                  className={styles.clearCompletedButton}
                  disabled={completed === 0 || !current.matches('success.idle')}
                  onClick={handleDestroyCompleted}
                >
                  Clear completed
                </button>
              </footer>
            </section>
          )}

        </div>
      </div>
    </>
  );
}

export default Index

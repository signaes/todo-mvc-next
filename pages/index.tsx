import { useState, useEffect } from 'react';
import Head from 'next/head'
import TodoInput from '../components/TodoInput'
import TodoItem from '../components/TodoItem'
import Todo, { TodoInterface } from '../models/todo'

const Index = () => {
  const [ loading, setLoading ] = useState(true);
  const [ todos, setTodos ] = useState([]);
  const [ error, setError ] = useState(null);

  useEffect(() => {
    (async function getData() {
      try {
        const data = await Todo.getTodos();
        setTodos(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    }());
  }, []);

  const handleEnter = async (value: string) => {
    const cleanValue = value.trim();
    setLoading(true);

    if (cleanValue) {
      const todosList = await Todo.newTodo(value);
      setTodos(todosList);
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    setTodos(todos.filter((todo: TodoInterface) => todo.id !== id));

    try {
      await Todo.deleteTodo(id);
    } catch (err) {
      console.error(err);
      setError(err);
    }
  }

  return (
    <>
      <Head>
        <title>Todos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1>todo mvc</h1>
        <TodoInput onEnter={handleEnter} />
        { loading && 'Loading' }
        { error
          ? 'Algo deu errado'
          : !loading && todos && todos.length && todos.map(({ id, title, done }: TodoInterface, idx) => (
            <TodoItem
              key={id}
              id={id}
              title={title}
              done={done}
              handleUpdate={Todo.updateTodo}
              handleDelete={handleDelete}
            />
          )) || null
        }
      </div>
    </>
  );
}

export default Index

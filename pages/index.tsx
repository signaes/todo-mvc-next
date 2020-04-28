import { useState, useEffect } from 'react'
import { useMachine } from '@xstate/react'
import Head from 'next/head'
import TodoInput from '../components/TodoInput'
import TodoItem from '../components/TodoItem'
import Todo, { TodoInterface } from '../models/todo'
import todosMachine, {
  todosMachineLoadingEvents,
  // todosMachineReadyEvents,
  todosMachineReadyCreatingEvents,
} from '../state/machines/todos'


const Index = () => {
  const [ loading, setLoading ] = useState(true);
  const [ todos, setTodos ] = useState([]);
  const [ error, setError ] = useState(null);

  const [ current, send ] = useMachine(todosMachine);

  useEffect(() => {
    (async function getData() {
      try {
        const data = await Todo.getTodos();
        setTodos(data);
        setLoading(false);
        send(todosMachineLoadingEvents.LOADED, { data });
      } catch (err) {
        console.error(err);
        setError(err);
        setLoading(false);
        send(todosMachineLoadingEvents.FAILED, { error: err });
      }
    }());
  }, []);

  const { context: { visibleData } } = current;

  console.log('current.value', current.value)
  console.log('current.context', current.context)

  const handleEnter = async (value: string) => {
    const cleanValue = value.trim();
    // send(todosMachineReadyEvents.LOAD);
    setLoading(true);

    if (!cleanValue) {
      setLoading(false);
      return;
    }

    try {
      // send('LOADED')
      const newTodo = await Todo.newTodo(value);
      console.log('newTodo', newTodo)
      send(todosMachineReadyCreatingEvents.CREATED, { data: newTodo });
      setLoading(false);
    } catch (err) {
      send(todosMachineLoadingEvents.FAILED, { error: err });
      setLoading(false);
    }

    // if (cleanValue) {
    //   const todosList = await Todo.newTodo(value);
    //   setTodos(todosList);
    //   setLoading(false);
    // }
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
        { current.matches('loading') && 'Loading' }
        { current.matches('failure') && 'Something went wrong' }
        { current.matches('complete') && visibleData.map(({ id, title, complete }: TodoInterface, idx) => (
            <TodoItem
              key={id}
              id={id}
              title={title}
              complete={complete}
              handleUpdate={Todo.updateTodo}
              handleDelete={handleDelete}
            />
          )) }

      </div>
    </>
  );
}

export default Index

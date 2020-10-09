import { useState, useEffect } from 'react'
import { useMachine } from '@xstate/react'
import Head from 'next/head'
import TodoInput from '../../components/TodoInput'
import TodoItem from '../../components/TodoItem'
import Todo, { TodoInterface } from '../../models/todo'
import { useQuery, queryCache, useMutation } from 'react-query'

const QUERY_KEY = 'todos'

const Index = () => {
  const [text, setText] = useState('')
  const { data, isFetching } = useQuery(QUERY_KEY, Todo.all)
  const [add, { status, isLoading }] = useMutation(Todo.add, {
    onSuccess: response => {
      console.log('SUCCESS', response)
      queryCache.setQueryData(QUERY_KEY, (prevData: any) => {
        console.log('prevData', prevData)

        return {
          ...prevData,
          data: prevData.data.concat(response.data),
        }
      })
    },
  })
  const todos = data?.data || []

  console.log('data', todos)

  const addTodo = () => add(text)

  return (
    <>
      <Head>
        <title>Todos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1>Todos</h1>
        <div>
          <ul>
            {todos.map(todo => (
              <li key={todo.id}>{ todo.title }</li>
            ))}
          </ul>
        </div>
        <div>


          <input type="text" onChange={e => setText(e.target.value)}/>
          <button onClick={addTodo}>Add todo</button>

        </div>
      </div>
    </>
  );
}

export default Index


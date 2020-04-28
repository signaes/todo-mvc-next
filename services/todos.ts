import { v4 as uuid } from 'uuid';
import Todo, { TodoInterface } from '../models/todo';
import { DATA_FILE_PATH, REQUEST_METHOD } from '../constants';
import { readFile, writeFile, message } from '../utils';

export const getTodos = () => readFile(DATA_FILE_PATH);
export const addNewTodo = async (todoTitle) => {
  try {
    const data = await getTodos();
    const todo = new Todo(todoTitle);
    const { id, title, complete }: TodoInterface = todo;
    const newData: TodoInterface[] = JSON.parse(data);
    newData.push({ id, title, complete });

    await writeFile(DATA_FILE_PATH, JSON.stringify(newData));

    return todo;
  } catch (err) {
    console.error(err);

    throw new Error(err);
  }
}
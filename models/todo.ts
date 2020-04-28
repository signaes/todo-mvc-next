import axios from 'axios';

export interface TodoInterface {
  id: string;
  title: string;
  complete: boolean;
}

export default class Todo {
  public static async getTodos() {
    try {
      const { data } = await axios.get('/api/todos');

      return data;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  public static async newTodo(title: string) {
    try {
      const { data } = await axios.post('/api/todos', { title });

      return data;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

public static async updateTodo({ id, title, complete }: { id: string; title?: string, complete?: boolean }) {
    try {
      const { data } = await axios.patch(`/api/todo/${id}`, { title, complete });

      return data;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  public static async deleteTodo(id: string) {
    try {
      const { data } = await axios.delete(`/api/todo/${id}`);

      return data;
    } catch (err) {
      console.error(err);
      return err;
    }
  }
}

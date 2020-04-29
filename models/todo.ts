import axios from 'axios';
import { v4 as uuid } from 'uuid';

export interface TodoInterface {
  id: string;
  title: string;
  complete: boolean;
}

export default class Todo {
  public id
  public complete = false;

  constructor(public title) {
    this.id = uuid();
  }

  public static async all() {
    try {
      const { data } = await axios.get('/api/todos');

      return data;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  public static async add(title: string) {
    try {
      const { data } = await axios.post('/api/todos', { title });

      return data;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  public static async update({ id, title, complete }: { id: string; title?: string, complete?: boolean }) {
    try {
      const { data } = await axios.patch(`/api/todo/${id}`, { title, complete });

      return data;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  public static async destroy(id: string) {
    try {
      const { data } = await axios.delete(`/api/todo/${id}`);

      return data;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  public static async updateAll(complete: boolean) {
    try {
      await axios.patch('api/todos', { complete });
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  public static async destroyCompleted() {
    try {
      await axios.delete('api/todos/completed');
    } catch (err) {
      console.error(err);
      return err;
    }
  }
}

import axios from 'axios';
import { v4 as uuid } from 'uuid';

export interface TodoData {
  id: string;
  title: string;
  complete: boolean;
}

export interface TodoInterface extends TodoData {
  ref: any;
}

export default class Todo {
  public id
  public complete = false;

  constructor(public title) {
    this.id = uuid();
  }

  public static all() {
    return axios.get('/api/todos');
  }

  public static add(title: string) {
    return axios.post('/api/todos', { title });
  }

  public static update({ id, title, complete }: { id: string; title?: string, complete?: boolean }) {
    return axios.patch(`/api/todo/${id}`, { title, complete });
  }

  public static destroy(id: string) {
    return axios.delete(`/api/todo/${id}`);
  }

  public static async updateAll(complete: boolean) {
    return axios.patch('api/todos', { complete });
  }

  public static async destroyCompleted() {
    return await axios.delete('api/todos/completed');
  }
}

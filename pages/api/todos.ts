import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuid } from 'uuid';
import { TodoData } from '../../models/todo';
import { REQUEST_METHOD } from '../../constants';
import { message } from '../../utils';
import { getTodos, addNewTodo, updateAllTodos } from '../../services/todos';

const get = async (res: NextApiResponse<string>) => {
  try {
    const data = await getTodos();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const post = async (req: NextApiRequest, res: NextApiResponse<TodoData>) => {
  const { body: { title } } = req;

  if (!title) {
    res.status(400).end();
  }

  try {
    const newTodo = await addNewTodo(title);

    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(newTodo);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }

}

const patch = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body: { complete } } = req;

  try {
    await updateAllTodos(complete);

    res.setHeader('Content-Type', 'application/json');
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case REQUEST_METHOD.POST:
      post(req, res);
      break;
    case REQUEST_METHOD.GET:
      get(res);
      break;
    case REQUEST_METHOD.PUT:
    case REQUEST_METHOD.PATCH:
      patch(req, res);
      break;
    default:
      res.status(405).end(message.methodNotAllowed(req.method));
  }
};

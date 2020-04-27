import { NextApiRequest, NextApiResponse } from 'next';
import { TodoInterface } from '../../../models/todo';
import { DATA_FILE_PATH, REQUEST_METHOD } from '../../../constants';
import { readFile, writeFile, message } from '../../../utils';

const patch = async ({ id, title, done }: { id: string, title?: string, done?: boolean }, res: NextApiResponse) => {
  try {
    const data = await readFile(DATA_FILE_PATH);
    const newTitle = title && title.trim();
    const updatedData: TodoInterface[] = JSON.parse(data)
      .map((item: TodoInterface) => {
        if (item.id === id) {
          return {
            ...item,
            title: newTitle ? newTitle : item.title,
            done: done !== undefined && done !== null ? done : item.done
          }
        }

        return item;
      });
    await writeFile(DATA_FILE_PATH, JSON.stringify(updatedData));

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const del = async (id: string, res: NextApiResponse) => {
  try {
    const data = await readFile(DATA_FILE_PATH);
    const updatedData: TodoInterface[] = JSON.parse(data)
      .filter((item: TodoInterface) => item.id !== id);
    await writeFile(DATA_FILE_PATH, JSON.stringify(updatedData));

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { id },
    body: { title, done },
    method
  } = req;

  switch (method) {
    case REQUEST_METHOD.PUT:
    case REQUEST_METHOD.PATCH:
      patch({ id, title, done }, res);
      break;
    case REQUEST_METHOD.DELETE:
      del(id, res);
      break;
    default:
      res.status(405).end(message.methodNotAllowed(req.method));
  }
}

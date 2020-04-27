import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuid } from 'uuid';
import { TodoInterface } from '../../models/todo';
import { DATA_FILE_PATH, REQUEST_METHOD } from '../../constants';
import { readFile, writeFile, message } from '../../utils';

const get = async (res: NextApiResponse<string>) => {
  try {
    const data = await readFile(DATA_FILE_PATH);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

const post = async (req: NextApiRequest, res: NextApiResponse<TodoInterface[]>) => {
  const { body: { title } } = req;

  if (!title) {
    res.status(400).end();
  }

  try {
    const data = await readFile(DATA_FILE_PATH);
    const newData: TodoInterface[] = JSON.parse(data);
    newData.push({ id: uuid(), title, done: false });
    await writeFile(DATA_FILE_PATH, JSON.stringify(newData));

    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(newData);
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
    default:
      res.status(405).end(message.methodNotAllowed(req.method));
  }
};

import { NextApiRequest, NextApiResponse } from 'next';
import { REQUEST_METHOD } from '../../../constants';
import { message } from '../../../utils';
import { destroyCompleted } from '../../../services/todos';

const destroy = async (res: NextApiResponse) => {
  try {
    await destroyCompleted();

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case REQUEST_METHOD.DELETE:
      destroy(res);
      break;
    default:
      res.status(405).end(message.methodNotAllowed(req.method));
  }
};


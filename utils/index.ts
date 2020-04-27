import fs from 'fs';
import { promisify } from 'util';

export const readFile = (path: string) => promisify(fs.readFile)(path, 'utf8');
export const writeFile = (path: string, content: string) =>
  promisify(fs.writeFile)(path, content, 'utf8');

/**
  * Messages
  */

export const message = {
  methodNotAllowed: (method: string) => `Method ${method} not allowed.`
}

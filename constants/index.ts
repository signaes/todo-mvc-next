import path from 'path';
import process from 'process';

export const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'todos.json');

/*
 * Keyboard keys
 */
export const KEYS = {
  ENTER: 'Enter',
  ESC: 'Escape'
};

/*
 * HTTP Request methods
*/

export const REQUEST_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

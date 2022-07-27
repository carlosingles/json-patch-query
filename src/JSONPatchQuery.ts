import { JSONPath } from 'jsonpath-plus';
import get from 'lodash.get';
import set from 'lodash.set';
import unset from 'lodash.unset';

export interface BaseOperation {
  path: string;
}
export interface AddOperation<T> extends BaseOperation {
  op: 'add';
  value: T;
}
export interface RemoveOperation extends BaseOperation {
  op: 'remove';
}
export interface ReplaceOperation<T> extends BaseOperation {
  op: 'replace';
  value: T;
}
export interface MoveOperation extends BaseOperation {
  op: 'move';
  from: string;
}
export interface CopyOperation extends BaseOperation {
  op: 'copy';
  from: string;
}
export interface TestOperation<T> extends BaseOperation {
  op: 'test';
  value: T;
}
export interface GetOperation<T> extends BaseOperation {
  op: '_get';
  value: T;
}
export type Operation = AddOperation<any> | RemoveOperation |
ReplaceOperation<any> | MoveOperation | CopyOperation | TestOperation<any> | GetOperation<any>;

export default class JSONPatchQuery {
  static apply(document: any, patch: Operation[]): any {
    patch.forEach((operation) => {
      const results: string[] = JSONPath({ path: operation.path, json: document, resultType: 'path' });
      let paths = results.map((result) => JSONPath.toPathArray(result) as string[]);
      // when it's an add operation and there is no matching path
      // try to see if there is a valid path on the parent
      // and add the property that doesn't exist
      if (paths.length === 0 && operation.op === 'add') {
        // check to see if the path does end in a static property (case where final node is a query)
        if (!/^(.*)\.[a-z]*$/i.test(operation.path)) {
          throw new Error(`Provided JSON Path did not resolve any nodes, path: ${operation.path}`);
        }
        const pathArray = operation.path.split('.');
        const addition = { key: pathArray.pop(), path: pathArray.join('.') };
        const addResults: string[] = JSONPath({ path: addition.path, json: document, resultType: 'path' });
        const additionPaths = addResults.map((result) => JSONPath.toPathArray(result) as string[]);
        if (additionPaths.length > 0 && addition.key) {
          const additionPath = additionPaths[0].filter((p) => p !== '$');
          const element = get(document, additionPath);
          set(document, additionPath, { ...element, [addition.key]: undefined });
          const match: string[] = JSONPath({ path: operation.path, json: document, resultType: 'path' });
          paths = match.map((result) => JSONPath.toPathArray(result) as string[]);
        }
      }
      if (paths.length === 0) {
        throw new Error(`Provided JSON Path did not resolve any nodes, path: ${operation.path}`);
      }
      paths.forEach((_path) => {
        const path = _path.filter((p) => p !== '$');
        const element = get(document, path);
        const parentPath = path.slice(0, -1);
        const [elementKey] = path.slice(-1);
        const parent = get(document, parentPath);
        let newValue;
        switch (operation.op) {
          case 'add':
            if (Array.isArray(element)) {
              newValue = [...element, operation.value];
            } else if (typeof element === 'object') {
              newValue = { ...element, ...operation.value };
            } else {
              newValue = operation.value;
            }
            set(document, path, newValue);
            break;
          case 'remove':
            if (Array.isArray(parent)) {
              parent.splice(parseInt(elementKey, 10), 1);
              set(document, parentPath, parent);
            } else {
              unset(document, path);
            }
            break;
          case 'replace':
            set(document, path, operation.value);
            break;
          default:
            break;
        }
      });
    });
    return document;
  }
}

import jp from 'jsonpath';
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
      const paths = jp.paths(document, operation.path);
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
              parent.splice(elementKey as number, 1);
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

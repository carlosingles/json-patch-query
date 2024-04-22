import { JSONPath } from 'jsonpath-plus';
import lodash from 'lodash';
const { get, set, unset, isEqual } = lodash;

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
export interface GetOperation extends BaseOperation {
  op: '_get';
}
export type Operation = AddOperation<any> | RemoveOperation |
  ReplaceOperation<any> | MoveOperation | CopyOperation | TestOperation<any> | GetOperation;

/**
 * Takes a dot notation path and tries to resolve the array path if it is an array of objects
 * @param path The dot notation path to resolve
 * @returns Either the array path or the same path if not
 */
function resolveArrayPath(path: string) {
  let arrayPath = path;
  const pindex = path.match(/\d+/g)?.pop();
  if (pindex) {
    const positionOfIndex = path.lastIndexOf(`${pindex}.`);
    arrayPath = path.substring(0, pindex.length + positionOfIndex);
  }
  return arrayPath;
}

/**
 * Takes a TMF format path and expands it into lodash format, for all matching paths.
 * Path must use dot notation for separators.
 * @param path A dot notation path, that ignores array indexes
 * @param obj The document to run the path against
 * @param options.startingPath Used for recursion, if starting at top level provide ''
 * @param options.includeIndex Whether or not to include array indexes
 * useful for adding non-existent properties or removing values from an array
 * @returns An array of matching paths in lodash format (with index)
 */
export function expandPaths(
  path: string,
  document: any,
  options: { startingPath: string, includeIndex?: boolean },
) {
  const props = path.split('.');
  let expanded: Set<string> = new Set();
  let absolutePath = options.startingPath;
  props.forEach((prop, i, arr) => {
    // append the next property, so we always track the absolute path
    absolutePath += absolutePath ? `.${prop}` : prop;
    if (Object.prototype.hasOwnProperty.call(document, prop)) {
      const propValue = document[prop];
      const nextProp = arr.slice(i + 1);
      // if the property is an array, we will need to iterate through the array
      if (Array.isArray(propValue)) {
        propValue.forEach((arrVal: any, j) => {
          // check if its an object or just a primitive value
          if (arrVal && arrVal === Object(arrVal)) {
            // if we are inspecting a value in the array, expand those paths
            if (nextProp.length > 0) {
              const arrayValuePaths = expandPaths(nextProp.join('.'), arrVal, {
                // pass the array index to the starting path
                startingPath: `${absolutePath}.${j}`,
                includeIndex: options.includeIndex,
              });
              expanded = new Set([...expanded, ...arrayValuePaths]);
            } else if (options.includeIndex) {
              // in cases of primitive value, we only care about the index when removing
              expanded.add(`${absolutePath}.${j}`);
            } else {
              expanded.add(absolutePath);
            }
          } else if (options.includeIndex) {
            // in cases of primitive value, we only care about the index when removing
            expanded.add(`${absolutePath}.${j}`);
          } else {
            expanded.add(absolutePath);
          }
        });
      }
      // if there's more props to follow its a nested object
      if (nextProp.length > 0) {
        const nestedPaths = expandPaths(nextProp.join('.'), propValue, {
          // pass the array index to the starting path
          startingPath: `${absolutePath}`,
          includeIndex: options.includeIndex,
        });
        expanded = new Set([...expanded, ...nestedPaths]);
      } else {
        expanded.add(absolutePath);
      }
    }
  });
  return [...expanded];
}

/**
 * Find paths that match the map of key value pairs against a document, expanded in lodash format
 * @param matchers A map of key value pairs where the key is the path
 * in dot notation, and the value is the value to match against
 * @param document The document to match paths against
 * @returns An array of matching paths in lodash format (with index)
 */
export function findPaths(query: { [matcher: string]: string }, document: any) {
  const matched: string[][] = [];
  let matchingValueInArray;
  Object.keys(query).forEach((param) => {
    const matchValue = query[param];
    const expanded = expandPaths(param, document, { startingPath: '' });
    const pathsThatMatched = expanded.filter((exp) => {
      const matchedValue = get(document, exp);
      if (Array.isArray(matchedValue)) {
        const index = matchedValue.findIndex((val) => val === matchValue);
        if (index === -1) {
          return false;
        }
        matchingValueInArray = `${exp}.${index}`;
        return true;
      }
      return matchedValue === matchValue;
    });
    matched.push(pathsThatMatched);
  });
  if (matched.length === 0) return [];
  if (matchingValueInArray) matched[0].push(matchingValueInArray);
  return matched.flatMap((matches) => matches.filter((mpath) => {
    const marrayPath = resolveArrayPath(mpath);
    return matched.every((marray) => marray.some((path) => {
      // get the path of the array if the path contains an array
      const arrayPath = resolveArrayPath(path);
      if (arrayPath.length >= marrayPath.length) {
        return path.includes(marrayPath);
      }
      return marrayPath.includes(arrayPath);
    }));
  }));
}

/**
   * Resolves a path against a document and returns an array of path strings in dot notation
   * @param path A TMF path that uses TMF Path Query syntax
   * @param document The document to run the path against
   * @returns
   */
export function resolveTMFPath(path: string, document: any, includeIndex = false): string[][] {
  const { searchParams, pathname } = new URL(path, 'https://www.example.com');
  const pathProps = pathname.replace(/\//g, '.').slice(1);
  const pathMap = Object.fromEntries(searchParams.entries());
  // If no query was passed, just use the raw path
  if (Object.keys(pathMap).length === 0) {
    return [pathProps.split('.')];
  }

  const expandedPaths = expandPaths(pathProps, document, { startingPath: '', includeIndex });
  const matchedPaths = findPaths(pathMap, document);
  if (matchedPaths.length === 0) return [];
  return expandedPaths.filter((epath) => matchedPaths.every((mpath) => {
    const lastArrayIndex = mpath.match(/\d+/g)?.pop();
    if (lastArrayIndex) {
      // if it does, get the parent and match against that
      const positionOfIndex = mpath.lastIndexOf(`.${lastArrayIndex}`);
      const parent = mpath.substring(0, 1 + lastArrayIndex.length + positionOfIndex);
      return epath.includes(parent);
    }
    return epath.includes(mpath);
  })).map((s) => s.split('.'));
}

const REMOVED_ELEMENT = Symbol('removed element');
const ADDING_ELEMENT = Symbol('adding element');

export default class JSONPatchQuery {
  /**
   * Legacy Content-Type: application/json-patch-query+json
   *
   * Ideally this should not be used any longer,
   * instead application/json-patch+query should be used instead.
   *
   * @param document The document to apply the patch operation to
   * @param patch An array of patch operations to perform
   * @returns The modified document
   */
  static applyLegacy(document: any, patch: Operation[]): any {
    patch.forEach((operation) => {
      let paths = resolveTMFPath(operation.path, document, operation.op === 'remove');
      // when it's an add operation and there is no matching path
      // try to see if there is a valid path on the parent
      // and add the property that doesn't exist
      if (paths.length === 0 && operation.op === 'add') {
        const { searchParams, pathname } = new URL(operation.path, 'https://www.example.com');
        const pathArray = pathname.split('/');
        const addition = { key: pathArray.pop() as string, path: `${pathArray.join('/')}?${decodeURI(searchParams.toString().replace(/\+/g, '%20'))}` };
        // include indexes when adding a non existent property
        const additionPaths = resolveTMFPath(addition.path, document, true);
        if (additionPaths.length > 0 && addition.key) {
          additionPaths.forEach((additionPath) => {
            const element = get(document, additionPath);
            set(document, additionPath, { ...element, [addition.key]: undefined });
          });
          paths = resolveTMFPath(operation.path, document);
        }
      }
      if (paths.length === 0) {
        throw new Error(`Provided JSON Path did not resolve any nodes, path: ${operation.path}`);
      }
      // track array elements that have had elements removed
      const modifiedArrays = new Set<string[]>();
      paths.forEach((path) => {
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
              // put a placeholder, since removing the element now will effect further indexes
              parent.splice(parseInt(elementKey, 10), 1, REMOVED_ELEMENT);
              modifiedArrays.add(parentPath);
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
      // iterate through the modified arrays and remove the symbols
      if (modifiedArrays.size > 0) {
        const it = modifiedArrays.values();
        let result = it.next();
        while (!result.done) {
          const modifiedArrayPath = result.value;
          let modifiedArray = get(document, modifiedArrayPath);
          modifiedArray = modifiedArray.filter((val: unknown) => val !== REMOVED_ELEMENT);
          set(document, modifiedArrayPath, modifiedArray);
          result = it.next();
        }
      }
    });
    return document;
  }

  /**
   * Content-Type: application/json-patch+query
   * @param document The document to apply the patch operation to
   * @param patch An array of patch operations to perform
   * @returns The modified document
   */
  static apply(document: any, patch: Operation[]): any {
    patch.forEach((operation) => this.applyOperation(document, operation));
    // handle document being an array with elements removed
    if (Array.isArray(document)) {
      return document.filter((val) => val !== REMOVED_ELEMENT);
    }
    return document;
  }

  private static applyOperation(document: any, operation: GetOperation): any;

  private static applyOperation(document: any, operation: Operation): void;

  private static applyOperation(document: any, operation: Operation): any | void {
    // perform a get and add for copy
    if (operation.op === 'copy') {
      const value = this.applyOperation(document, { op: '_get', path: operation.from });
      this.applyOperation(document, { op: 'add', path: operation.path, value });
      return;
    }
    // perform a get, remove and add for move
    if (operation.op === 'move') {
      const value = this.applyOperation(document, { op: '_get', path: operation.from });
      this.applyOperation(document, { op: 'remove', path: operation.from });
      this.applyOperation(document, { op: 'add', path: operation.path, value });
      return;
    }
    const results: string[] = JSONPath({ path: operation.path, json: document, resultType: 'path' });
    let paths = results.map((result) => JSONPath.toPathArray(result) as string[]);
    // when it's an add operation and there is no matching path
    // try to see if there is a valid path on the parent
    // and add the property that doesn't exist
    if (paths.length === 0 && operation.op === 'add') {
      // check to see if the path does end in a static property (case where final node is a query)
      if (!/^(.*)\.[`\w@#\-$]*$/i.test(operation.path)) {
        throw new Error(`Provided JSON Path did not resolve any nodes, path: ${operation.path}`);
      }
      const pathArray = operation.path.split('.');
      const addition = { key: pathArray.pop()?.replace(/^`/, ''), path: pathArray.join('.') };
      const addResults: string[] = JSONPath({ path: addition.path, json: document, resultType: 'path' });
      const additionPaths = addResults.map((result) => JSONPath.toPathArray(result) as string[]);
      if (additionPaths.length > 0 && addition.key) {
        const additionPath = additionPaths[0].filter((p) => p !== '$');
        if (additionPath.length > 0) {
          const element = get(document, additionPath);
          set(document, additionPath, { ...element, [addition.key]: ADDING_ELEMENT });
          const match: string[] = JSONPath({ path: operation.path, json: document, resultType: 'path' });
          paths = match.map((result) => JSONPath.toPathArray(result) as string[]);
        } else {
          set(document, addition.key, ADDING_ELEMENT);
          const match: string[] = JSONPath({ path: operation.path, json: document, resultType: 'path' });
          paths = match.map((result) => JSONPath.toPathArray(result) as string[]);
        }
      }
    }
    if (paths.length === 0) {
      throw new Error(`Provided JSON Path did not resolve any nodes, path: ${operation.path}`);
    }
    // when performing a _get ensure there is only one matching value
    if (operation.op === '_get') {
      if (paths.length > 1) {
        throw new Error(`Provided JSON Path "from" value resolved multiple nodes. Ensure the path only resolves to one node, path: ${operation.path}`);
      }
      const path = paths[0].filter((p) => p !== '$');
      return get(document, path);
    }
    // track array elements that have had elements removed
    const modifiedArrays = new Set<string[]>();
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
          } else if (typeof element === 'object' && typeof operation.value === 'object') {
            newValue = { ...element, ...operation.value };
          } else {
            newValue = operation.value;
          }
          set(document, path, newValue);
          break;
        case 'remove':
          if (Array.isArray(parent)) {
            // put a placeholder, since removing the element now will effect further indexes
            parent.splice(parseInt(elementKey, 10), 1, REMOVED_ELEMENT);
            modifiedArrays.add(parentPath);
            set(document, parentPath, parent);
          } else if (Array.isArray(document) && !parent) { // case where there's no parent since its the root
            modifiedArrays.add([]); // empty array since the path is the root
            set(document, path, REMOVED_ELEMENT);
          } else {
            unset(document, path);
          }
          break;
        case 'replace':
          set(document, path, operation.value);
          break;
        case 'test':
          if (!isEqual(get(document, path), operation.value)) {
            throw new Error(`test operation failed, seeking value: ${JSON.stringify(operation.value)} at path: ${operation.path}`);
          }
          break;
        default:
          break;
      }
    });
    // iterate through the modified arrays and remove the symbols
    if (modifiedArrays.size > 0) {
      const it = modifiedArrays.values();
      let result = it.next();
      while (!result.done) {
        const modifiedArrayPath = result.value;
        let modifiedArray = get(document, modifiedArrayPath, document);
        modifiedArray = modifiedArray.filter((val: unknown) => val !== REMOVED_ELEMENT);
        set(document, modifiedArrayPath, modifiedArray);
        result = it.next();
      }
    }
  }
}

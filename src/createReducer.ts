export type ExtractPayload<T> = T extends { payload: infer P } ? P : null;

export type ObjectOnly<S, T> = S extends Array<any> ? never : T;
export type ArrayOnly<S, T> = S extends Array<any> ? T : never;

export type ArrayItem<T> = T extends Array<infer TItem> ? TItem : T;

export type AC = (...args: any[]) => any;

export type Flatten<T> = { [K in keyof T]: T[K] };

export type Handler<S, T extends AC, R> = (
  payload: ExtractPayload<ReturnType<T>>,
  state: S,
  action: Flatten<ReturnType<T> & { type: string }>,
) => R;

export type MergeFn<S> = {
  <T extends AC>(actionCreator: T, fn: Handler<S, T, Partial<S>>): InnerReducer<
    S
  >;
  <T extends AC, T2 extends AC>(
    actionCreator: [T, T2],
    fn: Handler<S, T | T2, Partial<S>>,
  ): InnerReducer<S>;
};

export type ReplaceFn<S> = <T extends AC>(
  actionCreator: T,
  fn: Handler<S, T, S>,
) => InnerReducer<S>;

export type AddItemFn<S> = <T extends AC>(
  actionCreator: T,
  fn: Handler<S, T, ArrayItem<S>>,
) => InnerReducer<S>;

export type FilterFn<S> = <T extends AC>(
  actionCreator: T,
  fn: Handler<S, T, ArrayIterator<S, boolean>>,
) => InnerReducer<S>;

export type MapFn<S> = {
  <T extends AC>(
    actionCreator: T,
    fn: Handler<S, T, ArrayIterator<S, ArrayItem<S>>>,
  ): InnerReducer<S>;
  <T extends AC, T2 extends AC>(
    actionCreator: [T, T2],
    fn: Handler<S, T | T2, ArrayIterator<S, ArrayItem<S>>>,
  ): InnerReducer<S>;
};

export type ArrayIterator<T, R> = (
  item: ArrayItem<T>,
  index: number,
  items: T,
) => R;

export type AttachFn<S> = {
  <T extends keyof S>(
    prop: T,
    fn: (state: S[T], action: object) => S[T],
  ): InnerReducer<S>;
  (fn: (state: S, action: object) => S): InnerReducer<S>;
};

export type InnerReducer<S> = {
  (state: S, action: object): S;
  merge: ObjectOnly<S, MergeFn<S>>;
  push: ArrayOnly<S, AddItemFn<S>>;
  unshift: ArrayOnly<S, AddItemFn<S>>;
  filter: ArrayOnly<S, FilterFn<S>>;
  reject: ArrayOnly<S, FilterFn<S>>;
  map: ArrayOnly<S, MapFn<S>>;
  replace: ReplaceFn<S>;

  attach: AttachFn<S>;

  nested: <T extends keyof S>(
    prop: T,
    fn: (reducer: InnerReducer<S[T]>) => InnerReducer<S[T]>,
  ) => InnerReducer<S>;
};

const toArray = <T>(input: T | T[]): T[] =>
  Array.isArray(input) ? input : [input];

type Action = {
  type: string;
  payload?: any;
};

type ReducerMap<S> = {
  [action: string]: Array<(state: S, action: Action) => S>;
};

const getTransformer = <S>(reducerMap: ReducerMap<S>) => (
  actionCreators: AC | AC[],
  reducerFn: (state: S, action: Action) => S,
) => {
  const actionTypes = toArray(actionCreators).map(ac => ac.toString());
  actionTypes.forEach(action => {
    if (!reducerMap[action]) {
      reducerMap[action] = [];
    }
    reducerMap[action].push(reducerFn);
  });
};

export function createReducer<S>(initial: S): InnerReducer<S> {
  const reducerMap: ReducerMap<S> = {};
  const transform = getTransformer(reducerMap);

  const innerReducer = ((state: S = initial, action: Action) => {
    const reducers = reducerMap[action.type];
    if (!reducers) {
      return state;
    }
    return reducers.reduce((prev, fn) => fn(prev, action), state);
  }) as Partial<InnerReducer<S>>;

  innerReducer.merge = ((
    actionCreators: AC | AC[],
    fn: Handler<S, AC, Partial<S>>,
  ) => {
    transform(actionCreators, (state, action) => {
      const values = fn(action.payload, state, action);
      if (values == null || typeof values !== 'object') {
        throw new Error(`Merge should return an object. Received ${values}.`);
      }
      if (Array.isArray(values)) {
        throw new Error(`Merge should return an object. Received an array.`);
      }
      return Object.assign({}, state, values);
    });
    return innerReducer;
  }) as any;

  innerReducer.replace = ((
    actionCreators: AC | AC[],
    fn: Handler<S, AC, S>,
  ) => {
    transform(actionCreators, (state, action) =>
      fn(action.payload, state, action),
    );
    return innerReducer;
  }) as any;

  innerReducer.push = ((actionCreators: AC | AC[], fn: Handler<S, AC, S>) => {
    transform(
      actionCreators,
      (state: any, action) =>
        [...state, fn(action.payload, state, action) as any] as any,
    );
    return innerReducer;
  }) as any;

  innerReducer.unshift = ((
    actionCreators: AC | AC[],
    fn: Handler<S, AC, any>,
  ) => {
    transform(
      actionCreators,
      (state: any, action) =>
        [fn(action.payload, state, action), ...state] as any,
    );
    return innerReducer;
  }) as any;

  innerReducer.reject = ((
    actionCreators: AC | AC[],
    fn: Handler<S, AC, ArrayIterator<any, boolean>>,
  ) => {
    transform(actionCreators, (state: any, action) => {
      const handler = fn(action.payload, state, action);
      const filter: ArrayIterator<any, boolean> = (item, index, array) =>
        !handler(item, index, array);
      return state.filter(filter);
    });
    return innerReducer;
  }) as any;

  innerReducer.filter = ((
    actionCreators: AC | AC[],
    fn: Handler<S, AC, ArrayIterator<any, boolean>>,
  ) => {
    transform(actionCreators, (state: any, action) => {
      const handler = fn(action.payload, state, action);
      return state.filter(handler);
    });
    return innerReducer;
  }) as any;

  innerReducer.map = ((
    actionCreators: AC | AC[],
    fn: Handler<S, AC, ArrayIterator<any, any>>,
  ) => {
    transform(actionCreators, (state: any, action) => {
      const handler = fn(action.payload, state, action);
      return state.map(handler);
    });
    return innerReducer;
  }) as any;
  return innerReducer as InnerReducer<S>;
}

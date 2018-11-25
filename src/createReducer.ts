import { AC, Flatten, ExtractPayload } from './types';
import { produce } from 'immer';
import { Reducer, AnyAction } from 'redux';
import { toArray } from './utils';

export type OnHandler<S, T extends AC> = (
  state: S,
  payload: ExtractPayload<ReturnType<T>>,
  action: Flatten<ReturnType<T> & { type: string }>
) => void;

export type ReplaceHandler<S, T extends AC> = (
  state: S,
  payload: ExtractPayload<ReturnType<T>>,
  action: Flatten<ReturnType<T> & { type: string }>
) => S;

export type AttachFn<S> = {
  <T extends keyof S>(prop: T, fn: Reducer<S[T]>): ChainedReducer<S>;
  (fn: Reducer<S>): ChainedReducer<S>;
};

export type ChainedReducer<S> = {
  (state: S, action: object): S;
  on: <T extends AC>(
    actionCreator: T,
    fn: OnHandler<S, T>
  ) => ChainedReducer<S>;
  replace: <T extends AC>(
    actionCreator: T,
    fn: ReplaceHandler<S, T>
  ) => ChainedReducer<S>;
  mergePayload: <T extends (...args: any[]) => { payload: Partial<S> }>(
    actionCreator: T
  ) => ChainedReducer<S>;

  attach: AttachFn<S>;

  nested: <T extends keyof S>(
    prop: T,
    fn: (reducer: ChainedReducer<S[T]>) => ChainedReducer<S[T]>
  ) => ChainedReducer<S>;
};

type ReducerMap<S> = {
  [action: string]: Array<(state: S, action: AnyAction) => S>;
};

const getTransformer = <S>(reducerMap: ReducerMap<S>) => (
  actionCreators: AC | AC[],
  reducerFn: (state: S, action: AnyAction) => S
) => {
  const actionTypes = toArray(actionCreators).map(ac => ac.toString());
  actionTypes.forEach(action => {
    if (!reducerMap[action]) {
      reducerMap[action] = [];
    }
    reducerMap[action].push(reducerFn);
  });
};

const createNestedReducer = <S, P extends keyof S>(
  prop: P,
  reducer: Reducer<S[P]>
) => (state: S, action: AnyAction) => {
  const subState = reducer(state[prop], action);
  if (state[prop] !== subState) {
    // tslint:disable-next-line:prefer-object-spread
    return Object.assign({}, state, {
      [prop]: subState,
    });
  }
  return state;
};

export function createReducer<S>(initial: S): ChainedReducer<S> {
  const reducerMap: ReducerMap<S> = {};
  const defaultReducers: Array<(state: S, action: AnyAction) => S> = [];
  const transform = getTransformer(reducerMap);

  const chainedReducer = ((state: S = initial, action: AnyAction) => {
    const reducers = (reducerMap[action.type] || []).concat(defaultReducers);
    if (!reducers.length) {
      return state;
    }
    return reducers.reduce((prev, fn) => fn(prev, action), state);
  }) as Partial<ChainedReducer<S>>;

  chainedReducer.on = ((actionCreators: AC, fn: OnHandler<S, AC>) => {
    transform(actionCreators, (state, action: AnyAction) =>
      produce(state, draft => fn(draft as S, action.payload, action))
    );
    return chainedReducer;
  }) as any;

  chainedReducer.replace = ((actionCreators: AC, fn: ReplaceHandler<S, AC>) => {
    transform(actionCreators, (state, action: AnyAction) =>
      produce(state, draft => fn(draft as S, action.payload, action))
    );
    return chainedReducer;
  }) as any;

  chainedReducer.mergePayload = ((actionCreators: AC, fn: OnHandler<S, AC>) => {
    transform(actionCreators, (state, action: AnyAction) =>
      Object.assign({}, state, action.payload)
    );
    return chainedReducer;
  }) as any;

  chainedReducer.nested = (<T extends keyof S>(
    prop: T,
    fn: (reducer: ChainedReducer<S[T]>) => ChainedReducer<S[T]>
  ) => {
    const nested = fn(createReducer(initial[prop]));
    defaultReducers.push(createNestedReducer(prop, nested));
    return chainedReducer;
  }) as any;

  chainedReducer.attach = (<T extends keyof S>(
    prop: T | Reducer<S>,
    fn?: Reducer<S[T]>
  ) => {
    if (typeof prop === 'function') {
      defaultReducers.push(prop);
    } else {
      defaultReducers.push(createNestedReducer(prop, fn));
    }
    return chainedReducer;
  }) as any;

  return chainedReducer as ChainedReducer<S>;
}

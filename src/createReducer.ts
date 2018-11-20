import { Reducer } from 'redux'

export type ExtractPayload<T> = T extends { payload: infer P } ? P : null

export type ObjectOnly<S, T> = S extends any[] ? never : T
export type ArrayOnly<S, T> = S extends any[] ? T : never

export type ArrayItem<T> = T extends Array<infer TItem> ? TItem : T

export type AC = (...args: any[]) => any

export type Flatten<T> = { [K in keyof T]: T[K] }

export type Handler<S, T extends AC, R> = (
  payload: ExtractPayload<ReturnType<T>>,
  state: S,
  action: Flatten<ReturnType<T> & { type: string }>
) => R

export type OnHandler<S, T extends AC, R> = (
  state: S,
  action: Flatten<ReturnType<T> & { type: string }>
) => R

export type MergeFn<S> = {
  <T extends AC>(
    actionCreator: T,
    fn: Handler<S, T, Partial<S>>
  ): ChainedReducer<S>
  <T extends AC, T2 extends AC>(
    actionCreator: [T, T2],
    fn: Handler<S, T | T2, Partial<S>>
  ): ChainedReducer<S>
}

export type ReplaceFn<S> = <T extends AC>(
  actionCreator: T,
  fn: Handler<S, T, S>
) => ChainedReducer<S>

export type OnFn<S> = <T extends AC>(
  actionCreator: T,
  fn: OnHandler<S, T, S>
) => ChainedReducer<S>

export type AddItemFn<S> = <T extends AC>(
  actionCreator: T,
  fn: Handler<S, T, ArrayItem<S>>
) => ChainedReducer<S>

export type FilterFn<S> = <T extends AC>(
  actionCreator: T,
  fn: Handler<S, T, ArrayIterator<S, boolean>>
) => ChainedReducer<S>

export type MapFn<S> = {
  <T extends AC>(
    actionCreator: T,
    fn: Handler<S, T, ArrayIterator<S, ArrayItem<S>>>
  ): ChainedReducer<S>
  <T extends AC, T2 extends AC>(
    actionCreator: [T, T2],
    fn: Handler<S, T | T2, ArrayIterator<S, ArrayItem<S>>>
  ): ChainedReducer<S>
}

export type ArrayIterator<T, R> = (
  item: ArrayItem<T>,
  index: number,
  items: T
) => R

export type AttachFn<S> = {
  <T extends keyof S>(prop: T, fn: Reducer<S[T]>): ChainedReducer<S>
  (fn: Reducer<S>): ChainedReducer<S>
}

export type ChainedReducer<S> = {
  (state: S, action: object): S
  merge: ObjectOnly<S, MergeFn<S>>
  push: ArrayOnly<S, AddItemFn<S>>
  unshift: ArrayOnly<S, AddItemFn<S>>
  filter: ArrayOnly<S, FilterFn<S>>
  reject: ArrayOnly<S, FilterFn<S>>
  map: ArrayOnly<S, MapFn<S>>
  replace: ReplaceFn<S>
  on: OnFn<S>

  attach: AttachFn<S>

  nested: <T extends keyof S>(
    prop: T,
    fn: (reducer: ChainedReducer<S[T]>) => ChainedReducer<S[T]>
  ) => ChainedReducer<S>
}

const toArray = <T>(input: T | T[]): T[] =>
  Array.isArray(input) ? input : [input]

type Action = {
  type: string
  payload?: any
}

type ReducerMap<S> = {
  [action: string]: Array<(state: S, action: Action) => S>
}

const getTransformer = <S>(reducerMap: ReducerMap<S>) => (
  actionCreators: AC | AC[],
  reducerFn: (state: S, action: Action) => S
) => {
  const actionTypes = toArray(actionCreators).map(ac => ac.toString())
  actionTypes.forEach(action => {
    if (!reducerMap[action]) {
      reducerMap[action] = []
    }
    reducerMap[action].push(reducerFn)
  })
}

const createNestedReducer = <S, P extends keyof S>(
  prop: P,
  reducer: Reducer<S[P]>
) => (state: S, action: Action) => {
  const subState = reducer(state[prop], action)
  if (state[prop] !== subState) {
    // tslint:disable-next-line:prefer-object-spread
    return Object.assign({}, state, {
      [prop]: subState
    })
  }
  return state
}

export function createReducer<S>(initial: S): ChainedReducer<S> {
  const reducerMap: ReducerMap<S> = {}
  const defaultReducers: Array<(state: S, action: Action) => S> = []
  const transform = getTransformer(reducerMap)

  const chainedReducer = ((state: S = initial, action: Action) => {
    const reducers = (reducerMap[action.type] || []).concat(defaultReducers)
    if (!reducers.length) {
      return state
    }
    return reducers.reduce((prev, fn) => fn(prev, action), state)
  }) as Partial<ChainedReducer<S>>

  chainedReducer.merge = ((
    actionCreators: AC | AC[],
    fn: Handler<S, AC, Partial<S>>
  ) => {
    transform(actionCreators, (state, action) => {
      const values = fn(action.payload, state, action)
      if (values == null || typeof values !== 'object') {
        throw new Error(`Merge should return an object. Received ${values}.`)
      }
      if (Array.isArray(values)) {
        throw new Error(`Merge should return an object. Received an array.`)
      }
      // tslint:disable-next-line:prefer-object-spread
      return Object.assign({}, state, values)
    })
    return chainedReducer
  }) as any

  chainedReducer.replace = ((
    actionCreators: AC | AC[],
    fn: Handler<S, AC, S>
  ) => {
    transform(actionCreators, (state, action) =>
      fn(action.payload, state, action)
    )
    return chainedReducer
  }) as any

  chainedReducer.on = ((actionCreators: AC | AC[], fn: OnHandler<S, AC, S>) => {
    transform(actionCreators, (state, action) => fn(state, action))
    return chainedReducer
  }) as any

  chainedReducer.push = ((actionCreators: AC | AC[], fn: Handler<S, AC, S>) => {
    transform(
      actionCreators,
      (state: any, action) =>
        [...state, fn(action.payload, state, action) as any] as any
    )
    return chainedReducer
  }) as any

  chainedReducer.unshift = ((
    actionCreators: AC | AC[],
    fn: Handler<S, AC, any>
  ) => {
    transform(
      actionCreators,
      (state: any, action) =>
        [fn(action.payload, state, action), ...state] as any
    )
    return chainedReducer
  }) as any

  chainedReducer.reject = ((
    actionCreators: AC | AC[],
    fn: Handler<S, AC, ArrayIterator<any, boolean>>
  ) => {
    transform(actionCreators, (state: any, action) => {
      const handler = fn(action.payload, state, action)
      const filter: ArrayIterator<any, boolean> = (item, index, array) =>
        !handler(item, index, array)
      return state.filter(filter)
    })
    return chainedReducer
  }) as any

  chainedReducer.filter = ((
    actionCreators: AC | AC[],
    fn: Handler<S, AC, ArrayIterator<any, boolean>>
  ) => {
    transform(actionCreators, (state: any, action) => {
      const handler = fn(action.payload, state, action)
      return state.filter(handler)
    })
    return chainedReducer
  }) as any

  chainedReducer.map = ((
    actionCreators: AC | AC[],
    fn: Handler<S, AC, ArrayIterator<any, any>>
  ) => {
    transform(actionCreators, (state: any, action) => {
      const handler = fn(action.payload, state, action)
      return state.map(handler)
    })
    return chainedReducer
  }) as any

  chainedReducer.nested = (<T extends keyof S>(
    prop: T,
    fn: (reducer: ChainedReducer<S[T]>) => ChainedReducer<S[T]>
  ) => {
    const nested = fn(createReducer(initial[prop]))
    defaultReducers.push(createNestedReducer(prop, nested))
    return chainedReducer
  }) as any

  chainedReducer.attach = (<T extends keyof S>(
    prop: T | Reducer<S>,
    fn?: Reducer<S[T]>
  ) => {
    if (typeof prop === 'function') {
      defaultReducers.push(prop)
    } else {
      defaultReducers.push(createNestedReducer(prop, fn))
    }
    return chainedReducer
  }) as any

  return chainedReducer as ChainedReducer<S>
}

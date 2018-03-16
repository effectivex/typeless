import { createActions } from './createActions';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const {
  addTodo,
  deleteTodo,
  editTodo,
  completeTodo,
  completeAll,
  clearCompleted,
  clearAll,
} = createActions('ns', {
  addTodo: (text: string) => ({ payload: { text } }),
  deleteTodo: (id: number) => ({ payload: { id } }),
  editTodo: (id: number, text: string) => ({ payload: { id, text } }),
  completeTodo: (id: number) => ({ payload: { id } }),
  completeAll: null,
  clearCompleted: null,
  clearAll: null,
  // addManyTodos: (todos: Todo[]) => ({ payload: todos }),
  // toggleTodo: (index: number) => ({ payload: index }),
  // setVisibilityFilter: (filter: string) => ({ payload: filter }),
  // setVisibilityFilter2: (filter: string) => ({ payload: filter }),
});

// const empty = {};
// type A2 = typeof empty;

// const f1 = <T extends {[K in keyof A2]: never}>(input: T) => input;
// f1(rest);

// type Exact<A, B extends Difference<A, B>> = AssertPassThrough<Difference<A, B>, A, B>
// type ExactReturn<A, B extends Difference<A, B>> = B & Exact<A, B>

// type AssertPassThrough<Actual, Passthrough, Expected extends Actual> = Passthrough;
// type Difference<A, Without> = {
//   [P in DiffUnion<keyof A, keyof Without>]: A[P];
// }
// type DiffUnion<T extends string, U extends string> =
//   ({[P in T]: P } &
//   { [P in U]: never } &
//   { [k: string]: never })[T];

// guardFinal(rest);

// guard3(guard(rest));

// let f1 = guard(rest);
// // const f2: typeof f1 = {};

// function guard3(a: never) {
//   return a;
// }

// // if (f) {
// //   throw new Error('a');
// // }

// type Props<T> = { [P in keyof T]: T[P] }[keyof T];

// type B = [keyof typeof rest];

// type CheckNonEmpty<T> = [keyof T] extends undefined[] ? never : T;

// type C = CheckNonEmpty<typeof rest>;

// function guard<T, R>(items: T): CheckNonEmpty<T> {
//   return items as any;
// }

// function guard2(items: object) {
//   return items;
// }

// function guardFinal<T>(items: CheckNonEmpty<T>): never {
//   return items;
// }

// const a = {
//   [show.getType()]: () => 12,
// };

// type ActionTypes<T> = T extends { type: infer K } ? K : never;

// const symbolA = Symbol('a');
// const symbolB = Symbol('b');

// type Actions =
//   | { type: typeof symbolA; payload: 'a' }
//   | { type: typeof symbolB; payload: 'b' };

// type Reducer = {
//   [s in ActionTypes<Actions>]?: (state: VisitState) => VisitState
// };

// type Reducer<T extends (...args: any[]) => any> = ReturnType<T> extends RootAction
//   ? [T, (state: VisitState, action: ReturnType<T>) => VisitState]
//   : never;

// type Reducer2 =
// [

// ];

// type Show = ((id: string) => { type: 'visit/SHOW'; payload: string });

// const r: Reducer<typeof show> = [show, (state, action) => state];

// const makeReducer = <T extends (...args: any[]) => any>(input: Reducer<T>) => input;

// const r2 = makeReducer<typeof show>([show, (state, action) => state]);

type ExtractPayload<T> = T extends { payload: infer P } ? P : null;

type ObjectOnly<S, T> = S extends Array<any> ? never : T;
type ArrayOnly<S, T> = S extends Array<any> ? T : never;

type ArrayItem<T> = T extends Array<infer TItem> ? TItem : T;

type AC = (...args: any[]) => any;

type Handler<S, T extends AC, R> = (
  payload: ExtractPayload<ReturnType<T>>,
  state: S,
  action: ReturnType<T>,
) => R;

type MergeFn<S, A> = {
  <T extends AC>(actionCreator: T, fn: Handler<S, T, Partial<S>>): InnerReducer<
    S,
    A
  >;
  <T extends AC, T2 extends AC>(
    actionCreator: [T, T2],
    fn: Handler<S, T | T2, Partial<S>>,
  ): InnerReducer<S, A>;
};

type ReplaceFn<S, A> = <T extends AC>(
  actionCreator: T,
  fn: Handler<S, T, S>,
) => InnerReducer<S, A>;

type AddItemFn<S, A> = <T extends AC>(
  actionCreator: T,
  fn: Handler<S, T, ArrayItem<S>>,
) => InnerReducer<S, A>;

type FilterFn<S, A> = <T extends AC>(
  actionCreator: T,
  fn: Handler<S, T, (item: ArrayItem<S>) => boolean>,
) => InnerReducer<S, A>;

type MapFn<S, A> = {
  <T extends AC>(
    actionCreator: T,
    fn: Handler<S, T, (item: ArrayItem<S>) => ArrayItem<S>>,
  ): InnerReducer<S, A>;
  <T extends AC, T2 extends AC>(
    actionCreator: [T, T2],
    fn: Handler<S, T | T2, (item: ArrayItem<S>) => ArrayItem<S>>,
  ): InnerReducer<S, A>;
};

type InnerReducer<S, A> = {
  (state: S, action: A): S;
  // on: <T extends (...args: any[]) => any>(
  //   actionCreator: T,
  //   fn: (state: S, action: ReturnType<T>) => S,
  // ) => InnerReducer<S, A>;
  merge: ObjectOnly<S, MergeFn<S, A>>;
  push: ArrayOnly<S, AddItemFn<S, A>>;
  unshift: ArrayOnly<S, AddItemFn<S, A>>;
  filter: ArrayOnly<S, FilterFn<S, A>>;
  reject: ArrayOnly<S, FilterFn<S, A>>;
  map: ArrayOnly<S, MapFn<S, A>>;
  replace: ReplaceFn<S, A>;

  nested: <T extends keyof S>(
    prop: T,
    fn: (reducer: InnerReducer<S[T], A>) => InnerReducer<S[T], A>,
  ) => InnerReducer<S, A>;
};

function chain<S, A>(state: S) {
  return (null as any) as InnerReducer<S, A>;
}

function createReducer<S, A>(initial: S) {
  const innerReducer = (state: S, action: A) => {
    return state;
  };
  // (innerReducer as InnerReducer<S, A>).on = () => {
  //   return null as any;
  // };
  // function innerReducer(state: S, action: A) {
  //   return state;
  // }
  // innerReducer.on = <T extends (...args: any[]) => any>(input: Reducer<T>) =>
  // input;
  return innerReducer as InnerReducer<S, A>;
}

type State = {
  todos: Todo[];
  // filter: string | null;
};

const initialState: State = {
  todos: [],
  // filter: null,
};

// type A = ExtractPayload<ReturnType<typeof setVisibilityFilter>>;

// const prop = <S, T extends keyof S>(name: T) => (value: S[T]) => ({
//   [name]: value,
// });

// createReducer(initialState, state =>
//   chain(state)
//     .merge(setVisibilityFilter, filter => ({ filter }))
//     // .merge(setVisibilityFilter, a => ({ a }))
//     // .merge(setVisibilityFilter, prop<typeof state, 'filter'>('filter'))
//     .nested('todos')
//     .merge(addTodo, todo => [todo]),
// );

function add(a: number = 3, b: number = 6) {
  return a + b;
}

const identity = <T>(input: T) => input;

createReducer(initialState)
  // .merge(setVisibilityFilter, filter => ({ filter }))
  // .merge(setVisibilityFilter, a => ({ a }))
  // .merge(setVisibilityFilter, prop<typeof state, 'filter'>('filter'))

  .nested('todos', nested =>
    nested
      .push(addTodo, ({ text }, state) => ({
        id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
        completed: false,
        text: text,
      }))
      .reject(deleteTodo, ({ id }) => item => item.id === id)
      .map(editTodo, ({ id, text }) => todo =>
        todo.id === id ? { ...todo, text } : todo,
      )
      .map(completeTodo, ({ id }) => todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      )
      .map([deleteTodo, completeTodo], ({ id }) => todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      )
      .map(completeAll, (_, state) => {
        const areAllMarked = state.every(todo => todo.completed);
        return todo => ({
          ...todo,
          completed: !areAllMarked,
        });
      })
      .reject(clearCompleted, () => item => !item.completed)
      .replace(clearAll, () => []),
  );

createReducer(initialState.todos)
  .push(addTodo, ({ text }, state) => ({
    id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
    completed: false,
    text: text,
  }))
  .reject(deleteTodo, ({ id }) => item => item.id === id)
  .map(editTodo, ({ id, text }) => todo =>
    todo.id === id ? { ...todo, text } : todo,
  )
  .map(completeTodo, ({ id }) => todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  )
  .map(completeAll, (_, state) => {
    const areAllMarked = state.every(todo => todo.completed);
    return todo => ({
      ...todo,
      completed: !areAllMarked,
    });
  })
  .reject(clearCompleted, () => item => !item.completed)
  .replace(clearAll, () => []);

// createReducer(initialState).merge(setVisibilityFilter, (state, filter) => ({
//   ...state,
//   isSaving: true,
// }));
// .on(detailsLoaded, (state, action) => ({
//   ...state,
//   details: action.payload,
//   isLoading: false,
// }));

// const red: Reducer = {
//   ["visit/SHOW"]: state => state,
// };

// type A = keyof typeof a;

import { createActions } from './createActions';
import { createReducer } from './createReducer';

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

type State = {
  todos: Todo[];
  // filter: string | null;
};

const initialState: State = {
  todos: [],
  // filter: null,
};

function normalReducer(state = initialState.todos, action: object) {
  return state;
}

function normalReducer2(state = initialState, action: object) {
  return state;
}

createReducer(initialState)
  // .merge(setVisibilityFilter, filter => ({ filter }))
  // .merge(setVisibilityFilter, a => ({ a }))
  // .merge(setVisibilityFilter, prop<typeof state, 'filter'>('filter'))
  .merge(addTodo, ({ text }, state) => ({
    todos: [
      ...state.todos,
      {
        id:
          state.todos.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
        completed: false,
        text: text,
      },
    ],
  }))
  .attach('todos', normalReducer)
  .attach(normalReducer2)
  .nested('todos', nested =>
    nested
      .push(addTodo, ({ text }, state, action) => ({
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

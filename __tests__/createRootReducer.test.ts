import { createRootReducer } from '../src/createRootReducer';
import { AnyAction } from 'redux';

const createAddReducer = (initialValue: number) => (
  state = initialValue,
  action: AnyAction
) => {
  if (action.type === 'add') {
    return state + 1;
  }
  return state;
};
test('no reducers', () => {
  const reducer = createRootReducer();
  const state = reducer({}, { type: 'action' });
  expect(state).toEqual({});
});

test('single reducer', () => {
  const reducer = createRootReducer();
  reducer.addReducer(createAddReducer(1), ['foo']);
  let newState = reducer({}, { type: 'action' });
  expect(newState).toEqual({
    foo: 1,
  });
  newState = reducer(newState, { type: 'add' });
  expect(newState).toEqual({
    foo: 2,
  });
});

test('remove reducer', () => {
  const reducer = createRootReducer();
  reducer.addReducer(createAddReducer(1), ['foo']);
  let newState = reducer({}, { type: 'action' });
  expect(newState).toEqual({
    foo: 1,
  });
  reducer.removeReducer(['foo']);
  newState = reducer(newState, { type: 'add' });
  expect(newState).toEqual({
    foo: 1,
  });
});

test('multiple single reducer', () => {
  const reducer = createRootReducer();
  reducer.addReducer(createAddReducer(1), ['foo']);
  reducer.addReducer(createAddReducer(2), ['bar']);
  let newState = reducer({}, { type: 'action' });
  expect(newState).toEqual({
    foo: 1,
    bar: 2,
  });
  newState = reducer(newState, { type: 'add' });
  expect(newState).toEqual({
    foo: 2,
    bar: 3,
  });
});

test('nested reducer', () => {
  const reducer = createRootReducer();
  reducer.addReducer(createAddReducer(1), ['foo', 'bar']);
  let newState = reducer({}, { type: 'action' });
  expect(newState).toEqual({
    foo: { bar: 1 },
  });
  newState = reducer(newState, { type: 'add' });
  expect(newState).toEqual({
    foo: { bar: 2 },
  });
});

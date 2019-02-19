import { RootReducer } from '../src/RootReducer';
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
  const rootReducer = new RootReducer();
  const reducer = rootReducer.getReducer();
  const state = reducer({}, { type: 'action' });
  expect(state).toEqual({});
});

test('single reducer', () => {
  const rootReducer = new RootReducer();
  rootReducer.addReducer(createAddReducer(1), ['foo']);
  const reducer = rootReducer.getReducer();
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
  const rootReducer = new RootReducer();
  const reducer = rootReducer.getReducer();
  rootReducer.addReducer(createAddReducer(1), ['foo']);
  let newState = reducer({}, { type: 'action' });
  expect(newState).toEqual({
    foo: 1,
  });
  rootReducer.removeReducer(['foo']);
  newState = reducer(newState, { type: 'add' });
  expect(newState).toEqual({
    foo: 1,
  });
});

test('multiple single reducer', () => {
  const rootReducer = new RootReducer();
  const reducer = rootReducer.getReducer();
  rootReducer.addReducer(createAddReducer(1), ['foo']);
  rootReducer.addReducer(createAddReducer(2), ['bar']);
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
  const rootReducer = new RootReducer();
  const reducer = rootReducer.getReducer();
  rootReducer.addReducer(createAddReducer(1), ['foo', 'bar']);
  let newState = reducer({}, { type: 'action' });
  expect(newState).toEqual({
    foo: { bar: 1 },
  });
  newState = reducer(newState, { type: 'add' });
  expect(newState).toEqual({
    foo: { bar: 2 },
  });
});

import { Action } from 'redux';
import { combineReducers } from '../src/combineReducers';

interface FooState {
  foo: string;
}

function fooReducer(state: FooState, action: Action): FooState {
  if (action.type === 'test') {
    return {
      foo: 'ok',
    };
  }
  return {
    foo: 'default',
  };
}

interface BarState {
  bar: string;
}

function barReducer(state: BarState, action: Action): BarState {
  if (action.type === 'test') {
    return {
      bar: 'ok',
    };
  }
  return {
    bar: 'default',
  };
}

const reducer = combineReducers({
  bar: barReducer,
  foo: fooReducer,
});

test('should return default state', () => {
  const state = reducer(undefined, { type: 'unknown' });
  expect(state).toEqual({
    foo: { foo: 'default' },
    bar: { bar: 'default' },
  });
});

test('should handle action', () => {
  const state = reducer(undefined, { type: 'test' });
  expect(state).toEqual({
    foo: { foo: 'ok' },
    bar: { bar: 'ok' },
  });
});

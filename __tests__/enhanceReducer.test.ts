import { enhanceReducer } from '../src/enhanceReducer';

it('should enhance reducers', () => {
  const list = [] as number[];
  const reducer = enhanceReducer<number>(
    base => (state, action) => {
      list.push(1);
      return base(state, action);
    },
    base => (state, action) => {
      list.push(2);
      return base(state, action);
    },
    (state, action) => {
      return state + action.payload;
    }
  );
  const newState = reducer(1, { type: 'foo', payload: 10 });
  expect(newState).toBe(11);
  expect(list).toEqual([1, 2]);
});

it('should enhance reducers without calling base reducer', () => {
  const list = [] as number[];
  const reducer = enhanceReducer<number>(
    base => (state, action) => {
      list.push(1);
      return 100;
    },
    base => (state, action) => {
      list.push(2);
      return base(state, action);
    },
    (state, action) => {
      return state + action.payload;
    }
  );
  const newState = reducer(1, { type: 'foo', payload: 10 });
  expect(newState).toBe(100);
  expect(list).toEqual([1]);
});

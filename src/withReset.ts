import { Reducer, Action } from 'redux';
import { resetRedux } from './actions';

export const withReset = <S>(baseReducer: Reducer<S>) => (
  state: S,
  action: Action,
) => {
  if (action.type === resetRedux.toString()) {
    return baseReducer(undefined, action);
  }
  return baseReducer(state, action);
};

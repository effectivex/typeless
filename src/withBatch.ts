import { Reducer, Action, AnyAction } from 'redux';
import { batchUpdate } from './actions';

export const withBatch = <S>(baseReducer: Reducer<S>) => (
  state: S,
  action: AnyAction
) => {
  if (action.type === batchUpdate.toString()) {
    return (action.payload as Action[]).reduce(
      (currentState, currentAction) => baseReducer(currentState, currentAction),
      state
    );
  }
  return baseReducer(state, action);
};

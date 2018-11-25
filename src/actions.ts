import { createActions } from './createActions';

export const { batchUpdate, resetRedux } = createActions('@@typeless', {
  batchUpdate: (actions: object) => ({ payload: actions }),
  resetRedux: null,
});

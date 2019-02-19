import React from 'react';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  createActions,
  useModule,
  createEpic,
  createReducer,
  useActions,
  useMappedState,
} from 'typeless';

const MODULE = 'sample';

const MyActions = createActions(MODULE, {
  ping: null,
  pong: (date: Date) => ({ payload: { date } }),
});

const epic = createEpic(MODULE).on(MyActions.ping, () =>
  of(MyActions.pong(new Date())).pipe(delay(500))
);

declare module 'typeless/types' {
  interface DefaultState {
    sample: {
      isPinging: boolean;
      lastPongAt: Date;
    };
  }
}

const initialState = {
  isPinging: false,
  lastPongAt: null,
};

const reducer = createReducer(initialState)
  .on(MyActions.ping, state => {
    state.isPinging = true;
  })
  .on(MyActions.pong, (state, { date }) => {
    state.isPinging = false;
    state.lastPongAt = date;
  });

export function App() {
  useModule({
    epic,
    reducer,
    reducerPath: ['sample'],
  });

  const { ping } = useActions(MyActions);
  const { isPinging, lastPongAt } = useMappedState(state => state.sample);

  return (
    <div>
      <button disabled={isPinging} onClick={ping}>
        {isPinging ? 'pinging...' : 'ping'}
      </button>
      {lastPongAt && <div>last pong at {lastPongAt.toLocaleTimeString()}</div>}
    </div>
  );
}

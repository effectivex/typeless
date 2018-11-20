import configureMockStore, { MockStore } from 'redux-mock-store';
import { createEpicMiddleware } from 'redux-observable';
import * as Rx from 'rxjs/operators';

import { of } from 'rxjs/observable/of';
import { _throw as throwError } from 'rxjs/observable/throw';
import { concat } from 'rxjs/observable/concat';

import { createActions } from '../src/createActions';
import { createEpic } from '../src/createEpic';
import { ofType } from '../src/ofType';

const {
  loadUser,
  loadUserDelay,
  userLoaded,
  errorOccurred,
  deleteUser,
  userDeleted,
  showConfirmDelete,
  confirmDelete,
  hideConfirmDelete,
} = createActions('ns', {
  loadUser: (id: string) => ({ payload: { id } }),
  loadUserDelay: (id: string) => ({ payload: { id } }),
  deleteUser: (id: string) => ({ payload: { id } }),
  showConfirmDelete: () => ({}),
  hideConfirmDelete: () => ({}),
  confirmDelete: (result: 'yes' | 'no') => ({ payload: { result } }),
  userLoaded: (user: object) => ({ payload: { user } }),
  userDeleted: (id: string) => ({ payload: { id } }),
  errorOccurred: (message: string) => ({ payload: { message } }),
});

const APIService = {
  fetchUser: (id: string) => of({ id, name: 'user' }),
  fetchUserDelay: (id: string) => of({ id, name: 'user' }).pipe(Rx.delay(10)),
  deleteUser: (id: string) => of(null),
};

interface State {
  foo: string;
}
type Deps = { API: typeof APIService };

const epic = createEpic<State, Deps>()
  .on(loadUser, ({ id }, { API }) =>
    API.fetchUser(id).pipe(
      Rx.map(user => userLoaded(user)),
      Rx.catchError(err => of(errorOccurred(err.message))),
    ),
  )
  .on(loadUserDelay, Rx.switchMap, ({ id }, { API }) =>
    API.fetchUserDelay(id).pipe(
      Rx.map(user => userLoaded(user)),
      Rx.catchError(err => of(errorOccurred(err.message))),
    ),
  )
  .on(deleteUser, ({ id }, { API, action$, getState }) => {
    return concat(
      of(showConfirmDelete()),
      action$.pipe(
        ofType(confirmDelete),
        Rx.mergeMap(action => {
          if (action.payload.result !== 'yes') {
            return of(hideConfirmDelete());
          }
          return API.deleteUser(id).pipe(
            Rx.map(() => userDeleted(id)),
            Rx.catchError(err => of(errorOccurred(err.message))),
          );
        }),
      ),
    );
  });

let store: MockStore<any>;

const dispatch = (action: any) => store.dispatch(action);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

beforeEach(() => {
  APIService.fetchUser = jest.fn((id: string) => of({ id, name: 'user' }));
  APIService.fetchUserDelay = jest.fn((id: string) =>
    of({ id, name: 'user' }).pipe(Rx.delay(10)),
  );

  APIService.deleteUser = jest.fn((id: string) => of(null));

  const epicMiddleware = createEpicMiddleware(epic, {
    dependencies: {
      API: APIService,
    },
  });
  const mockStore = configureMockStore([epicMiddleware]);
  store = mockStore({});
});

test('should load user', () => {
  dispatch(loadUser('123'));
  const actions = store.getActions();
  expect(actions).toMatchSnapshot();
  expect((APIService.fetchUser as jest.Mock).mock.calls).toMatchSnapshot();
});

test('should load user error', () => {
  APIService.fetchUser = jest.fn((id: string) => throwError(new Error('foo')));
  dispatch(loadUser('123'));
  const actions = store.getActions();
  expect(actions).toMatchSnapshot();
  expect((APIService.fetchUser as jest.Mock).mock.calls).toMatchSnapshot();
});

test('should load user with delay', async () => {
  dispatch(loadUserDelay('1'));
  dispatch(loadUserDelay('2'));
  dispatch(loadUserDelay('3'));
  await delay(100);
  const actions = store.getActions();
  expect(actions).toMatchSnapshot();
  expect((APIService.fetchUserDelay as jest.Mock).mock.calls).toMatchSnapshot();
});

test('should delete user', async () => {
  dispatch(deleteUser('123'));
  dispatch(confirmDelete('yes'));
  const actions = store.getActions();
  expect(actions).toMatchSnapshot();
  expect((APIService.deleteUser as jest.Mock).mock.calls).toMatchSnapshot();
});

test('attach', () => {
  const subEpic = createEpic<State, Deps>().on(loadUser, ({ id }, { API }) =>
    API.fetchUser(id).pipe(
      Rx.map(user => userLoaded(user)),
      Rx.catchError(err => of(errorOccurred(err.message))),
    ),
  );
  const mainEpic = createEpic<State, Deps>().attach(subEpic);
  const epicMiddleware = createEpicMiddleware(mainEpic, {
    dependencies: {
      API: APIService,
    },
  });
  const mockStore = configureMockStore([epicMiddleware]);
  store = mockStore({});
  dispatch(loadUser('123'));
  const actions = store.getActions();
  expect(actions).toMatchSnapshot();
  expect((APIService.fetchUser as jest.Mock).mock.calls).toMatchSnapshot();
});

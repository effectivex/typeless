/**
 * From https://github.com/redux-observable/redux-observable/blob/9a00294905e33d06774aa8c618b4d64e8427891e/src/createEpicMiddleware.js
 *
 * MIT
 */
import { Subject, Observable, from, queueScheduler } from 'rxjs';
import { map, switchMap, observeOn, subscribeOn } from 'rxjs/operators';
import { StateObservable } from './StateObservable';
import { Store, Middleware } from 'redux';

interface AnyAction {
  type?: string;
  payload?: any;
  meta?: any;
}

export type Epic<S, D = any> = (
  action$: Observable<AnyAction>,
  state$: StateObservable<S>,
  dependencies: D
) => Observable<AnyAction>;

interface EpicMiddleware<S, D> extends Middleware {
  replaceEpic?: (rootEpic: Epic<S, D>) => void;
}

interface Options<D = any> {
  dependencies?: D;
}

export function createEpicMiddleware<S, D>(
  rootEpic: Epic<S, D>,
  options: Options<D> = {}
) {
  const epic$ = new Subject<Epic<S, D>>();
  let store: Store<any>;

  const epicMiddleware: EpicMiddleware<S, D> = (_store: Store<any>) => {
    store = _store;
    const actionSubject$ = new Subject().pipe(
      observeOn(queueScheduler)
    ) as Subject<any>;
    const stateSubject$ = new Subject().pipe(
      observeOn(queueScheduler)
    ) as Subject<any>;
    const state$ = new StateObservable(stateSubject$, store.getState());

    const result$ = epic$.pipe(
      map(epic => epic(actionSubject$, state$, options.dependencies)),
      switchMap(output$ =>
        from(output$).pipe(
          subscribeOn(queueScheduler),
          observeOn(queueScheduler)
        )
      )
    );

    result$.subscribe(value => {
      store.dispatch(value as any);
    });

    return next => {
      // Setup initial root epic
      epic$.next(rootEpic);

      return action => {
        // Downstream middleware gets the action first,
        // which includes their reducers, so state is
        // updated before epics receive the action
        const result = next(action);

        // It's important to update the state$ before we emit
        // the action because otherwise it would be stale
        stateSubject$.next(store.getState());
        actionSubject$.next(action);

        return result;
      };
    };
  };

  epicMiddleware.replaceEpic = newRootEpic => {
    // switches to the new root Epic, synchronously terminating
    // the previous one
    epic$.next(newRootEpic);
  };

  return epicMiddleware;
}

import { from, of, empty, Observable } from 'rxjs';
import * as Rx from 'rxjs/operators';
import {
  AC,
  EpicHandler,
  EpicOperator,
  DefaultDeps,
  DefaultState,
} from './types';
import { Epic } from './redux-observable/createEpicMiddleware';
import { ofType } from './ofType';
import { isAction, logAction } from './utils';
import { combineEpics } from './redux-observable/combineEpics';
import { StateObservable } from './redux-observable/StateObservable';

export interface EpicChain<TState, TDeps> extends Epic<TState, TDeps> {
  on<TAC extends AC>(ac: TAC, handler: EpicHandler<TAC, TState, TDeps>): this;
  onMany<TAC extends AC, TAC2 extends AC>(
    ac: [TAC, TAC2],
    handler: EpicHandler<TAC | TAC2, TState, TDeps>
  ): this;
  onMany<TAC extends AC, TAC2 extends AC, TAC3 extends AC>(
    ac: [TAC, TAC2, TAC3],
    handler: EpicHandler<TAC | TAC2 | TAC3, TState, TDeps>
  ): this;
  onMany<TAC extends AC, TAC2 extends AC, TAC3 extends AC, TAC4 extends AC>(
    ac: [TAC, TAC2, TAC3, TAC4],
    handler: EpicHandler<TAC | TAC2 | TAC3 | TAC4, TState, TDeps>
  ): this;
  onMany<
    TAC extends AC,
    TAC2 extends AC,
    TAC3 extends AC,
    TAC4 extends AC,
    TAC5 extends AC
  >(
    ac: [TAC, TAC2, TAC3, TAC4, TAC5],
    handler: EpicHandler<TAC | TAC2 | TAC3 | TAC4 | TAC5, TState, TDeps>
  ): this;
  attach(
    epic: Array<Epic<TState, TDeps>> | Epic<TState, TDeps>
  ): EpicChain<TState, TDeps>;
}

export const createEpic = <TState = DefaultState, TDeps = DefaultDeps>(
  name: string
): EpicChain<TState, TDeps> => {
  const epics: Array<Epic<any, any>> = [];
  let epic: Epic<any, any> = null;

  const chain: any = (
    action$: Observable<any>,
    state$: StateObservable<any>,
    dependencies: any
  ) => {
    if (!epic) {
      epic = combineEpics(...epics) as any;
    }
    return epic(action$, state$, dependencies);
  };

  const add = (
    ac: AC | AC[],
    operator: EpicOperator,
    handler: EpicHandler<AC, TState, TDeps>
  ) => {
    epics.push((action$, state$, deps: any = {}) => {
      let sourceAction: any;
      return action$.pipe(
        ofType(ac as any),
        Rx.tap(action => {
          if (process.env.NODE_ENV === 'development') {
            logAction(name, action);
          }
        }),
        operator(action => {
          sourceAction = action;
          const result = handler(
            action.payload,
            {
              action$,
              getState: () => state$.value,
              state$,
              ...deps,
            },
            action
          );
          if (Array.isArray(result)) {
            return from(result);
          }
          if (isAction(result)) {
            return of(result);
          }
          return result;
        }),
        Rx.catchError(e => {
          console.error('Unhandled epic error on action.', {
            sourceAction,
            epic: name,
          });
          console.error(e.stack);
          return empty();
        }),
        Rx.mergeMap((action: any) => {
          if (action == null) {
            console.error('Undefined action returned in epic.', {
              sourceAction,
              epic: name,
            });
            return empty();
          }
          if (!isAction(action)) {
            console.error('Invalid action returned in epic.', {
              sourceAction,
              action,
              epic: name,
            });
            return empty();
          }
          return of(action);
        })
      );
    });
    return chain;
  };

  chain.on = <TAC extends AC>(
    ac: TAC,
    handler: EpicHandler<TAC, TState, TDeps>
  ) => {
    return add(ac, Rx.mergeMap, handler);
  };

  chain.onMany = (ac: AC[], handler: EpicHandler<AC, TState, TDeps>) => {
    return add(ac, Rx.mergeMap, handler);
  };

  chain.attach = (newEpic: any | any[]) => {
    epics.push(...(Array.isArray(newEpic) ? newEpic : [newEpic]));
    return chain;
  };
  return chain;
};

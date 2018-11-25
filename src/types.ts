import { Observable, ObservableInput, OperatorFunction } from 'rxjs';
import { AnyAction } from 'redux';
import { Epic } from './redux-observable/createEpicMiddleware';

export type ActionLike = { type?: string; payload?: any; meta?: any };

export type AC = (...args: any[]) => any;

export type EpicResult = Observable<ActionLike> | ActionLike | ActionLike[];

export type ExtractPayload<T> = T extends { payload: infer P } ? P : null;

export type EpicHandler<TAC extends AC, TState, TDeps> = (
  payload: ExtractPayload<ReturnType<TAC>>,
  deps: TDeps & {
    getState: () => TState;
    action$: Observable<AnyAction>;
    state$: Observable<TState>;
  },
  action: ReturnType<TAC> & { type: string }
) => EpicResult;

export type AnyEpic = Epic<any, any>;

export type EpicOperator = <T, R>(
  project: (value: T, index: number) => ObservableInput<R>
) => OperatorFunction<T, R>;

export type Flatten<T> = { [K in keyof T]: T[K] };

export interface DefaultDeps {
  //
}

export interface DefaultState {
  //
}

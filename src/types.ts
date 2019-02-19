import { Observable } from 'rxjs';
import { AnyAction } from 'redux';
import { StateObservable } from './StateObservable';

export type ActionLike = { type?: string; payload?: any; meta?: any };

export type AC = (...args: any[]) => any;

export type ExtractPayload<T> = T extends { payload: infer P } ? P : null;

export interface Deps<TState> {
  getState: () => TState;
  action$: Observable<AnyAction>;
  state$: StateObservable<TState>;
}

export type Flatten<T> = { [K in keyof T]: T[K] };

export interface DefaultState {
  //
}

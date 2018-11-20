import { combineReducers as baseCombineReducers, Reducer } from 'redux';

export type ExtractState<T> = T extends Reducer<infer TState> ? TState : never;

export type ConvertReducerMapToState<T> = {
  [P in keyof T]: ExtractState<T[P]>
};

export function combineReducers<TMap extends { [k: string]: Reducer<any> }>(
  map: TMap,
): Reducer<ConvertReducerMapToState<TMap>> {
  return baseCombineReducers(map) as any;
}

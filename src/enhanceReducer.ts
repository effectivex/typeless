import { Reducer } from 'redux';

export type ReducerEnhancer<S> = (baseReducer: Reducer<S>) => Reducer<S>;

export interface EnhanceReducer {
  <S>(enhancer: ReducerEnhancer<S>, baseReducer: Reducer<S>): Reducer<S>;
  <S>(
    enhancer: ReducerEnhancer<S>,
    enhancer2: ReducerEnhancer<S>,
    baseReducer: Reducer<S>
  ): Reducer<S>;
  <S>(
    enhancer: ReducerEnhancer<S>,
    enhancer2: ReducerEnhancer<S>,
    enhancer3: ReducerEnhancer<S>,
    baseReducer: Reducer<S>
  ): Reducer<S>;
  <S>(
    enhancer: ReducerEnhancer<S>,
    enhancer2: ReducerEnhancer<S>,
    enhancer3: ReducerEnhancer<S>,
    enhancer4: ReducerEnhancer<S>,
    baseReducer: Reducer<S>
  ): Reducer<S>;
  <S>(
    enhancer: ReducerEnhancer<S>,
    enhancer2: ReducerEnhancer<S>,
    enhancer3: ReducerEnhancer<S>,
    enhancer4: ReducerEnhancer<S>,
    enhancer5: ReducerEnhancer<S>,
    baseReducer: Reducer<S>
  ): Reducer<S>;
  <S>(
    enhancer: ReducerEnhancer<S>,
    enhancer2: ReducerEnhancer<S>,
    enhancer3: ReducerEnhancer<S>,
    enhancer4: ReducerEnhancer<S>,
    enhancer5: ReducerEnhancer<S>,
    enhancer6: ReducerEnhancer<S>,
    baseReducer: Reducer<S>
  ): Reducer<S>;
  <S>(
    enhancer: ReducerEnhancer<S>,
    enhancer2: ReducerEnhancer<S>,
    enhancer3: ReducerEnhancer<S>,
    enhancer4: ReducerEnhancer<S>,
    enhancer5: ReducerEnhancer<S>,
    enhancer6: ReducerEnhancer<S>,
    enhancer7: ReducerEnhancer<S>,
    baseReducer: Reducer<S>
  ): Reducer<S>;
  <S>(
    enhancer: ReducerEnhancer<S>,
    enhancer2: ReducerEnhancer<S>,
    enhancer3: ReducerEnhancer<S>,
    enhancer4: ReducerEnhancer<S>,
    enhancer5: ReducerEnhancer<S>,
    enhancer6: ReducerEnhancer<S>,
    enhancer7: ReducerEnhancer<S>,
    enhancer8: ReducerEnhancer<S>,
    baseReducer: Reducer<S>
  ): Reducer<S>;
}

export const enhanceReducer: EnhanceReducer = <S>(...args: any[]) => {
  const [baseReducer, ...wrappers] = args.reverse();
  return wrappers.reduce(
    (acc: Reducer<S>, wrapper: ReducerEnhancer<S>) => wrapper(acc),
    baseReducer
  );
};

import * as Rx from 'rxjs/operators'
import { of } from 'rxjs/observable/of'
import { from } from 'rxjs/observable/from'
import { empty } from 'rxjs/observable/empty'
import { Action, ActionCreator, MiddlewareAPI } from 'redux'
import { OperatorFunction } from 'rxjs/interfaces'
import { Observable } from 'rxjs'
import { ExtractPayload, AC } from './createReducer'
import { ObservableInput } from 'rxjs/Observable'
import { combineEpics, Epic, ActionsObservable } from 'redux-observable'
import { ofType } from './ofType'

export type ExtractAction<T> = T extends { payload: infer P } ? P : null

export type AnyAction = { payload?: any }

export type EpicHandler<TAC extends ActionCreator<any>, TState, TDeps> = (
  payload: ExtractPayload<ReturnType<TAC>>,
  deps: TDeps & { getState: () => TState; action$: Observable<Action> },
  action: ReturnType<TAC> & { type: string }
) => Observable<{ payload?: any }> | AnyAction | AnyAction[]

export type EpicOperator = <T, R>(
  project: (value: T, index: number) => ObservableInput<R>
) => OperatorFunction<T, R>

export type EpicOn<TState, TDeps> = {
  <TAC extends AC>(
    ac: TAC,
    handler: EpicHandler<TAC, TState, TDeps>
  ): EpicChain<TState, TDeps>
  <TAC extends AC, TAC2 extends AC>(
    ac: [TAC, TAC2],
    handler: EpicHandler<TAC | TAC2, TState, TDeps>
  ): EpicChain<TState, TDeps>
  <TAC extends AC, TAC2 extends AC, TAC3 extends AC>(
    ac: [TAC, TAC2, TAC3],
    handler: EpicHandler<TAC | TAC2 | TAC3, TState, TDeps>
  ): EpicChain<TState, TDeps>
  <TAC extends AC, TAC2 extends AC, TAC3 extends AC, TAC4 extends AC>(
    ac: [TAC, TAC2, TAC3, TAC4],
    handler: EpicHandler<TAC | TAC2 | TAC3 | TAC4, TState, TDeps>
  ): EpicChain<TState, TDeps>
  <TAC extends AC>(
    ac: TAC,
    operator: EpicOperator,
    handler: EpicHandler<TAC, TState, TDeps>
  ): EpicChain<TState, TDeps>
}

export interface EpicChain<TState, TDeps> extends Epic<any, TState, TDeps> {
  on: EpicOn<TState, TDeps>
  attach: (
    epic: Epic<any, TState, TDeps> | Array<Epic<any, TState, TDeps>>
  ) => EpicChain<TState, TDeps>
}

type AnyEpic = Epic<any, any, any>

const isAction = (action: any): action is AnyAction => {
  return action && typeof (action as any).type === 'string'
}

export function createEpic<TState, TDeps = {}>(): EpicChain<TState, TDeps> {
  const epics: AnyEpic[] = []
  let epic: AnyEpic = null
  const chain: any = (
    action$: ActionsObservable<any>,
    store: MiddlewareAPI<any>,
    dependencies: any
  ) => {
    if (!epic) {
      epic = combineEpics(...epics)
    }
    return epic(action$, store, dependencies)
  }
  chain.on = <TAC extends ActionCreator<any>>(
    ac: TAC,
    opOrHandler: EpicOperator | EpicHandler<TAC, TState, TDeps>,
    handlerOrNull: EpicHandler<TAC, TState, TDeps> | null
  ) => {
    const operator = handlerOrNull ? (opOrHandler as EpicOperator) : Rx.mergeMap
    const handler = (handlerOrNull
      ? handlerOrNull
      : opOrHandler) as EpicHandler<TAC, TState, TDeps>
    epics.push((action$, { getState }, deps: any = {}) => {
      let sourceAction: any
      return action$.pipe(
        ofType(ac),
        operator(action => {
          sourceAction = action
          const result = handler(
            action.payload,
            {
              action$,
              getState,
              ...deps,
            },
            action
          )
          if (Array.isArray(result)) {
            return from(result)
          }
          if (isAction(result)) {
            return of(result)
          }
          return result
        }),
        Rx.catchError(e => {
          console.error('Unhandled epic error on action.', { sourceAction })
          console.error(e.stack)
          return empty()
        }),
        Rx.mergeMap((action: any) => {
          if (action == null) {
            console.error('Undefined action returned in epic.', {
              sourceAction,
            })
            return empty()
          }
          if (!isAction(action)) {
            console.error('Invalid action returned in epic.', {
              sourceAction,
              action,
            })
            return empty()
          }
          return of(action)
        })
      )
    })
    return chain
  }
  chain.attach = (newEpic: any | any[]) => {
    epics.push(...(Array.isArray(newEpic) ? newEpic : [newEpic]))
    return chain
  }
  return chain
}

import * as React from 'react';
import { connect } from 'react-redux';
import { pick } from './pick';
import { Flatten } from './types';

interface ComponentClass<P = {}, S = {}> {
  propTypes?: React.ValidationMap<P>;
  contextTypes?: React.ValidationMap<any>;
  childContextTypes?: React.ValidationMap<any>;
  defaultProps?: Partial<P>;
  displayName?: string;
  new (props: P, context?: any): React.Component<P, S>;
}

interface Meta<TState, TExternal, TInner> {
  getMapState: () => (state: TState, own?: TExternal) => TExternal & TInner;
}

export interface ConnectChain<TState, TExternal, TInner> {
  external: <TAdded>() => ConnectChain<
    TState,
    TExternal & TAdded,
    TInner & TAdded
  >;
  mapState: <TAdded>(
    fn: (state: TState, own?: TExternal) => TAdded
  ) => ConnectChain<TState, TExternal, TInner & TAdded>;
  pick: <TActions extends {}, K extends keyof TActions>(
    actionMap: TActions,
    names: K[]
  ) => ConnectChain<TState, TExternal, TInner & Pick<TActions, K>>;
  actions: <TActions extends {}>(
    actionMap: TActions
  ) => ConnectChain<TState, TExternal, TInner & TActions>;
  hoc: (
    hoc: <C extends () => any>(Component: C) => C
  ) => ConnectChain<TState, TExternal, TInner>;

  sfc: (
    component: React.SFC<Flatten<TInner>>
  ) => React.SFC<TExternal> & Meta<TState, TExternal, TInner>;
  statefull: <TPrivateState = {}>(
    fn: (base: ComponentClass<TInner, TPrivateState>) => any
  ) => React.SFC<TExternal> & Meta<TState, TExternal, TInner>;
}

export const createConnect = <T>() => {
  let mapStateFn: any = null;
  const actions: any = {};
  const wrappers: any[] = [];
  const getWrapped = (initial: any) =>
    wrappers.reduce((component, hoc) => hoc(component), initial);
  const meta = {
    getMapState: () => mapStateFn,
  };
  const addMeta = (component: any) => {
    Object.assign(component, meta);
    return component;
  };
  const chain: ConnectChain<T, {}, {}> = {
    external: () => chain as any,
    mapState: fn => {
      mapStateFn = fn;
      return chain as any;
    },
    pick: (actionMap, names) => {
      Object.assign(actions, pick(actionMap, names));
      return chain as any;
    },
    actions: actionMap => {
      Object.assign(actions, actionMap);
      return chain as any;
    },
    sfc: component => {
      return addMeta(
        connect(
          mapStateFn,
          actions
        )(getWrapped(component))
      ) as any;
    },
    statefull: fn => {
      return addMeta(
        connect(
          mapStateFn,
          actions
        )(getWrapped(fn(React.PureComponent as any)))
      ) as any;
    },
    hoc: hoc => {
      wrappers.push(hoc);
      return chain;
    },
  };
  return chain;
};

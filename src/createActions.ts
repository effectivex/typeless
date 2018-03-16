import snakeCase from 'snake-case';
// type CreateAction = {};

// type ConvertActionSimple<T> = T extends (arg1: infer A1, arg2: infer A2) => infer R
//   ? (arg1: A1, arg2: A2) => { payload: R }
//   : never;

// export type Flatten<T> = { [K in keyof T]: T[K] };

// export type ActionCreator<T> = T & { getType: () => string };

export type AnyFn = ((...args: any[]) => any);

export type ConvertAC<T> = false extends T ? () => {} : T extends AnyFn ? T : () => {};

export type ConvertActions<T> = { [P in keyof T]: ConvertAC<T[P]> };

// const a = {
//   empty: null,
//   empty2: null,
//   oneArg: (a: number) => ({ payload: { a } }),
// };
// type A = typeof a;
// type B = keyof A;
// type C = ConvertActions<A>;

const { oneArg, empty } = createActions('ns', {
  empty: null,
  oneArg: (a: number) => ({ payload: { a } }),
});

oneArg(1);

// const entries = <T>(o: T) => {
//   return Object.entries(o) as Array<[keyof T, T[keyof T]]>;
// };

export type Nullable<T> = T | null;

export function createActions<T extends { [name: string]: Nullable<(...args: any[]) => {}> }>(
  ns: string,
  actionMap: T,
): ConvertActions<T> {
  return Object.keys(actionMap).reduce(
    (acc, key) => {
      const type = ns + '/' + snakeCase(key).toUpperCase();
      acc[key] = (...args: any[]) => {
        const ac = actionMap[key] || (() => ({}));
        const action = ac(...args) as any;
        action.type = type;
        return action;
      };
      acc[key].toString = () => type;
      return acc;
    },
    {} as { [s: string]: any },
  ) as any;
}

// function createAction<R, T extends (...args: any[]) => R>(fn: T): { payload: ReturnType<T> } {
//   return null as any;
// }

// const a1 = createAction((a: number, b: number) => ({ a, b }));

// const { oneArg } = createActions('ns', {
//   empty: () => ({}),
//   oneArg: (a: number) => ({ a }),
// });

// class Foo {
//   constructor(public a: number, public b: number) {
//   }
//   action
// }

// const foo = new Foo(1, 2);

// const bar: { a: number; b: number } = foo;

// const { ac1 } = createActions('foo', {
//   ac1: (a: number, b: number) => ({ payload: { a, b } }),
// });

// function getFoo() {
//   return { a: 2, b: 3 };
// }

// export const { a, b } = getFoo();

// type Convert<T> = T extends (arg1: infer A1, arg2: infer A2) => infer R
//   ? (arg1: A1, arg2: A2) => { payload: R }
//   : never;

// type A = (a: number, b: number) => { a: number; b: number };
// type B = Convert<A>;

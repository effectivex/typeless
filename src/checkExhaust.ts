export type ExtractRequiredProps<T> = T extends React.ComponentType<infer T>
  ? {} extends T ? { [x: string]: never } : { [s in keyof T]: true }
  : never;

export function checkExhaust<K>(
  component: K,
  props: ExtractRequiredProps<K>,
): void {
  // no op
}

export const pick = <T extends {}, K extends keyof T>(
  actionMap: T,
  names: K[]
): Pick<T, K> => {
  return names.reduce(
    (acc, name) => {
      acc[name] = actionMap[name];
      return acc;
    },
    {} as Pick<T, K>
  );
};

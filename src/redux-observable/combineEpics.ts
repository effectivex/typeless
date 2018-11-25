/**
 * From https://github.com/redux-observable/redux-observable/blob/9a00294905e33d06774aa8c618b4d64e8427891e/src/combineEpics.js
 *
 * MIT
 */
import { merge } from 'rxjs';

/**
 * Merges all epics into a single one.
 */
export const combineEpics = (...epics: any[]) => (...args: any[]) =>
  merge(
    ...epics.map(epic => {
      const output$ = epic(...args);
      if (!output$) {
        throw new TypeError(
          `combineEpics: one of the provided Epics "${epic.name ||
            '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`
        );
      }
      return output$;
    })
  );

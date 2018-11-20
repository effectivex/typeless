import { Action } from 'redux';
import { AC } from './createReducer';
import { take } from 'rxjs/operators/take';
import { ofType } from './ofType';
import { Observable } from 'rxjs/Observable';

export const waitForType = <T extends AC>(ac: T) => (obs: Observable<Action>) =>
  obs.pipe(ofType(ac), take(1));

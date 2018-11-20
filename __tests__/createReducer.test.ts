import { createReducer } from '../src/createReducer'
import { createActions } from '../src/createActions'

const getInitialState = () => ({
  str: 'foo',
  n: 10,
  arr: [1, 2, 3],
  inner: {
    prop: 'str'
  }
})

const { textAction } = createActions('ns', {
  textAction: (text: string) => ({ payload: { text } })
})

it('no actions', () => {
  const reducer = createReducer(getInitialState())
  const state = reducer(undefined, { type: 'some-action' })
  expect(state).toEqual(getInitialState())
})

describe('merge', () => {
  it('should merge values', () => {
    const reducer = createReducer(getInitialState()).merge(
      textAction,
      ({ text }) => ({
        str: text,
        n: 1456
      })
    )
    const state = reducer(undefined, textAction('text'))
    expect(state).toEqual({
      ...getInitialState(),
      str: 'text',
      n: 1456
    })
  })

  it('should merge values with non default state', () => {
    const reducer = createReducer({
      str: 'aaa',
      n: 5,
      arr: [2],
      inner: {
        prop: 'xyz'
      }
    }).merge(textAction, ({ text }) => ({
      str: text,
      n: 1456
    }))
    const state = reducer(undefined, textAction('text'))
    expect(state).toEqual({
      ...getInitialState(),
      str: 'text',
      n: 1456,
      arr: [2],
      inner: {
        prop: 'xyz'
      }
    })
  })

  it('should merge values (using state arg)', () => {
    const reducer = createReducer(getInitialState()).merge(
      textAction,
      ({ text }, { str }) => ({
        str: text + ' ' + str
      })
    )
    const state = reducer(undefined, textAction('text'))
    expect(state).toEqual({
      ...getInitialState(),
      str: 'text foo'
    })
  })

  it('should merge values (using action)', () => {
    const reducer = createReducer(getInitialState()).merge(
      textAction,
      (_, __, action) => ({
        str: action.payload.text
      })
    )
    const state = reducer(undefined, textAction('text'))
    expect(state).toEqual({
      ...getInitialState(),
      str: 'text'
    })
  })

  it('should multiple merge values', () => {
    const reducer = createReducer(getInitialState())
      .merge(textAction, ({ text }) => ({
        str: text,
        n: 1456
      }))
      .merge(textAction, ({ text }) => ({
        str: text + 'foo'
      }))
    const state = reducer(undefined, textAction('text'))
    expect(state).toEqual({
      ...getInitialState(),
      str: 'textfoo',
      n: 1456
    })
  })
  ;[null, undefined, 12, '34'].forEach(value => {
    it(`should throw an error if ${value} is returned`, () => {
      const reducer = createReducer(getInitialState()).merge(
        textAction,
        ({ text }) => value as any
      )
      expect(() => reducer(undefined, textAction('text'))).toThrowError(
        `Merge should return an object. Received ${value}.`
      )
    })
  })

  it(`should throw an error if Array is returned`, () => {
    const reducer = createReducer(getInitialState()).merge(
      textAction,
      ({ text }) => [] as any
    )
    expect(() => reducer(undefined, textAction('text'))).toThrowError(
      `Merge should return an object. Received an array.`
    )
  })
})

describe('replace', () => {
  it('should merge values', () => {
    const reducer = createReducer(getInitialState()).replace(
      textAction,
      ({ text }, currentState) => ({
        ...currentState,
        str: text,
        n: 1456
      })
    )
    const state = reducer(undefined, textAction('text'))
    expect(state).toEqual({
      ...getInitialState(),
      str: 'text',
      n: 1456
    })
  })
})

describe('on', () => {
  it('should replace state', () => {
    const reducer = createReducer(getInitialState()).on(
      textAction,
      (currentState, action) => ({
        ...currentState,
        str: action.payload.text,
        n: 1456
      })
    )
    const state = reducer(undefined, textAction('text'))
    expect(state).toEqual({
      ...getInitialState(),
      str: 'text',
      n: 1456
    })
  })
})

describe('array', () => {
  const getArrayInitialState = () => [1, 2, 3]

  const { arrayAction } = createActions('ns', {
    arrayAction: (id: number) => ({ payload: { id } })
  })

  it('push', () => {
    const reducer = createReducer(getArrayInitialState()).push(
      arrayAction,
      ({ id }) => id
    )
    const state = reducer(undefined, arrayAction(6))
    expect(state).toEqual([1, 2, 3, 6])
  })

  it('unshift', () => {
    const reducer = createReducer(getArrayInitialState()).unshift(
      arrayAction,
      ({ id }) => id
    )
    const state = reducer(undefined, arrayAction(6))
    expect(state).toEqual([6, 1, 2, 3])
  })

  it('reject', () => {
    const reducer = createReducer(getArrayInitialState()).reject(
      arrayAction,
      ({ id }) => item => item === id
    )
    const state = reducer(undefined, arrayAction(2))
    expect(state).toEqual([1, 3])
  })

  it('filter', () => {
    const reducer = createReducer(getArrayInitialState()).filter(
      arrayAction,
      ({ id }) => item => item >= id
    )
    const state = reducer(undefined, arrayAction(2))
    expect(state).toEqual([2, 3])
  })

  it('map', () => {
    const reducer = createReducer(getArrayInitialState()).map(
      arrayAction,
      ({ id }) => item => item + id
    )
    const state = reducer(undefined, arrayAction(2))
    expect(state).toEqual([3, 4, 5])
  })

  it('map with index check', () => {
    const reducer = createReducer(getArrayInitialState()).map(
      arrayAction,
      ({ id }) => (item, i, items) => items[i] + id
    )
    const state = reducer(undefined, arrayAction(2))
    expect(state).toEqual([3, 4, 5])
  })

  it('replace', () => {
    const reducer = createReducer(getArrayInitialState()).replace(
      arrayAction,
      ({ id }) => [id]
    )
    const state = reducer(undefined, arrayAction(2))
    expect(state).toEqual([2])
  })
})

describe('nested', () => {
  const getInitialStateNested = () => ({
    str: 'foo',
    inner: {
      prop: 'str',
      n: 10,
      arr: [1, 2, 3]
    }
  })

  it('should merge values', () => {
    const reducer = createReducer(getInitialStateNested()).nested(
      'inner',
      innerReducer =>
        innerReducer.merge(textAction, ({ text }) => ({
          prop: text,
          n: 1456
        }))
    )
    const state = reducer(undefined, textAction('text'))
    const expected = getInitialStateNested()
    expected.inner.prop = 'text'
    expected.inner.n = 1456
    expect(state).toEqual(expected)
  })

  it('with non nested action', () => {
    const reducer = createReducer(getInitialStateNested())
      .merge(textAction, ({ text }) => ({ str: text }))
      .nested('inner', innerReducer =>
        innerReducer.merge(textAction, ({ text }) => ({
          prop: text,
          n: 1456
        }))
      )
    const state = reducer(undefined, textAction('text'))
    const expected = getInitialStateNested()
    expected.str = 'text'
    expected.inner.prop = 'text'
    expected.inner.n = 1456
    expect(state).toEqual(expected)
  })
})

describe('attach', () => {
  it('attach custom reducer', () => {
    const reducer = createReducer(getInitialState()).attach((state, action) => {
      if (action.type === textAction.toString()) {
        return {
          ...state,
          str: action.payload.text
        }
      }
      return state
    })
    const newState = reducer(undefined, textAction('text'))
    expect(newState).toEqual({
      ...getInitialState(),
      str: 'text'
    })
  })
  it('attach custom reducer on custom path', () => {
    const reducer = createReducer(getInitialState()).attach(
      'inner',
      (state, action) => {
        if (action.type === textAction.toString()) {
          return {
            ...state,
            prop: action.payload.text
          }
        }
        return state
      }
    )
    const newState = reducer(undefined, textAction('text'))
    expect(newState).toEqual({
      ...getInitialState(),
      inner: {
        prop: 'text'
      }
    })
  })
})

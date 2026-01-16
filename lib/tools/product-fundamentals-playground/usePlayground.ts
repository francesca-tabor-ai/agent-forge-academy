'use client';

import { useReducer } from 'react';
import { playgroundReducer, initialState, type PlaygroundAction } from './state';
import type { PlaygroundState } from './types';

export function usePlayground() {
  const [state, dispatch] = useReducer(playgroundReducer, initialState);

  return {
    state,
    dispatch,
  };
}

export type { PlaygroundState, PlaygroundAction };

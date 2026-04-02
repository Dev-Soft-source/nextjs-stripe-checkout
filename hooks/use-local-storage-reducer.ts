import {
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
  type Reducer,
} from 'react';
import { isClient } from '@/lib/utils';

function useLocalStorageReducer<S, A>(
  key: string,
  reducer: Reducer<S, A>,
  initialValue: S
): [S, Dispatch<A>] {
  const [state, dispatch] = useReducer(reducer, initialValue, () => {
    try {
      if (isClient) {
        const item = window.localStorage.getItem(key);
        return item ? (JSON.parse(item) as S) : initialValue;
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      console.error(`Unable to store new value for ${key} in localStorage.`);
    }
  }, [key, state]);

  return [state, dispatch];
}

export default useLocalStorageReducer;

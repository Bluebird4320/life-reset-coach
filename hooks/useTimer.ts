import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export interface TimerState {
  elapsed: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setManual: (seconds: number) => void;
}

export function useTimer(): TimerState {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // setInterval の参照を保持
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // バックグラウンド移行時刻を保持
  const bgTimestamp = useRef<number | null>(null);

  // 1秒ごとにカウントアップ
  const tick = useCallback(() => {
    setElapsed((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, tick]);

  // バックグラウンド復帰時に差分秒数を加算
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        // バックグラウンドに入った時刻を記録
        if (isRunning) {
          bgTimestamp.current = Date.now();
        }
      } else if (nextState === 'active') {
        // 復帰時に差分を加算
        if (isRunning && bgTimestamp.current !== null) {
          const diffSeconds = Math.floor((Date.now() - bgTimestamp.current) / 1000);
          setElapsed((prev) => prev + diffSeconds);
          bgTimestamp.current = null;
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
  }, []);
  const setManual = useCallback((seconds: number) => {
    setIsRunning(false);
    setElapsed(seconds);
  }, []);

  return { elapsed, isRunning, start, pause, reset, setManual };
}

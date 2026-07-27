import React, { createContext, useState, useRef, ReactNode } from 'react';
import { playWarningSound, playCompletionSound } from '@/services/soundService';
import { saveSession } from '@/services/storageService';

interface CounterContextType {
  count: number;
  targetCount: number;
  isRunning: boolean;
  isCompleted: boolean;
  order: 'asc' | 'desc';
  displayCount: number;
  progress: number;
  startSession: (target: number, order: 'asc' | 'desc', mantraId: string, mantraName: string) => void;
  increment: () => void;
  resetSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
}

export const CounterContext = createContext<CounterContextType | undefined>(undefined);

export function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const [targetCount, setTargetCount] = useState(108);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const mantraIdRef = useRef<string>('');
  const mantraNameRef = useRef<string>('');
  const warnedRef = useRef(false);
  const countRef = useRef(0);

  const displayCount = order === 'asc' ? count : targetCount - count;
  const progress = targetCount > 0 ? count / targetCount : 0;

  function startSession(target: number, ord: 'asc' | 'desc', mantraId: string, mantraName: string) {
    setCount(0);
    countRef.current = 0;
    setTargetCount(target);
    setOrder(ord);
    setIsRunning(true);
    setIsCompleted(false);
    warnedRef.current = false;
    mantraIdRef.current = mantraId;
    mantraNameRef.current = mantraName;
  }

  async function increment() {
    if (!isRunning || isCompleted) return;

    const newCount = countRef.current + 1;
    countRef.current = newCount;
    setCount(newCount);

    const remaining = targetCount - newCount;

    // Warning sound at 3 remaining
    if (remaining === 3 && !warnedRef.current) {
      warnedRef.current = true;
      await playWarningSound();
    }

    // Completion
    if (newCount >= targetCount) {
      setIsRunning(false);
      setIsCompleted(true);
      await playCompletionSound();

      // Save session
      await saveSession({
        id: Date.now().toString(),
        mantraId: mantraIdRef.current,
        mantraName: mantraNameRef.current,
        targetCount,
        completedCount: newCount,
        completedAt: new Date().toISOString(),
      });
    }
  }

  function resetSession() {
    setCount(0);
    countRef.current = 0;
    setIsRunning(false);
    setIsCompleted(false);
    warnedRef.current = false;
  }

  function pauseSession() {
    setIsRunning(false);
  }

  function resumeSession() {
    if (!isCompleted) setIsRunning(true);
  }

  return (
    <CounterContext.Provider value={{
      count,
      targetCount,
      isRunning,
      isCompleted,
      order,
      displayCount,
      progress,
      startSession,
      increment,
      resetSession,
      pauseSession,
      resumeSession,
    }}>
      {children}
    </CounterContext.Provider>
  );
}

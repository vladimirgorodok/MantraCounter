import { useContext } from 'react';
import { CounterContext } from '@/contexts/CounterContext';

export function useCounter() {
  const ctx = useContext(CounterContext);
  if (!ctx) throw new Error('useCounter must be used within CounterProvider');
  return ctx;
}

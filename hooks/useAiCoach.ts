import { useState } from 'react';
import { generateCoachMessage } from '../lib/anthropic';

export function useAiCoach() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generate = async (params: {
    vision: string;
    actionTitle: string;
    elapsedMinutes: number;
    status: 'done' | 'partial' | 'failed';
    streakDays: number;
    mood: string;
  }) => {
    setLoading(true);
    try {
      const msg = await generateCoachMessage(params);
      setMessage(msg);
      return msg;
    } finally {
      setLoading(false);
    }
  };

  return { message, loading, generate };
}

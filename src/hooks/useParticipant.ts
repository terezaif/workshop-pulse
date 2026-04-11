import { useState, useCallback } from 'react';
import { supabase } from '../supabase';

export interface Participant {
  id: string;
  workshop_id: string;
  nickname: string;
}

const STORAGE_KEY = 'workshop-pulse-participant';

function loadStored(): Participant | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeParticipant(p: Participant) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function useParticipant() {
  const [participant, setParticipant] = useState<Participant | null>(loadStored);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = useCallback(async (workshopId: string, nickname: string) => {
    setLoading(true);
    setError(null);
    try {
      // Check if already joined with this nickname
      const { data: existing } = await supabase
        .from('participants')
        .select('*')
        .eq('workshop_id', workshopId)
        .eq('nickname', nickname)
        .maybeSingle();

      if (existing) {
        setParticipant(existing);
        storeParticipant(existing);
        return existing;
      }

      const { data, error: err } = await supabase
        .from('participants')
        .insert({ workshop_id: workshopId, nickname })
        .select()
        .single();
      if (err) throw err;
      setParticipant(data);
      storeParticipant(data);
      return data as Participant;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setParticipant(null);
  }, []);

  return { participant, join, logout, loading, error };
}

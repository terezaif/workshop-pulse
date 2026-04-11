import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

export interface FeedbackEntry {
  id: string;
  workshop_id: string;
  section_id: string;
  participant_id: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  message: string;
  is_final_feedback: boolean;
  created_at: string;
  // joined fields
  nickname?: string;
  section_title?: string;
}

export function useRealtimeFeedback(workshopId?: string) {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Combined fetch + realtime subscription to avoid race conditions
  useEffect(() => {
    if (!workshopId) return;
    setLoading(true);

    const buffer: FeedbackEntry[] = [];
    let initialFetchDone = false;

    const channel = supabase
      .channel(`feedback-${workshopId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback',
          filter: `workshop_id=eq.${workshopId}`,
        },
        async (payload) => {
          const newRow = payload.new as FeedbackEntry;
          const [pRes, sRes] = await Promise.all([
            supabase.from('participants').select('nickname').eq('id', newRow.participant_id).single(),
            supabase.from('sections').select('title').eq('id', newRow.section_id).single(),
          ]);
          newRow.nickname = pRes.data?.nickname ?? 'Anonymous';
          newRow.section_title = sRes.data?.title ?? 'Unknown';

          if (!initialFetchDone) {
            buffer.push(newRow);
          } else {
            setFeedback((prev) => {
              if (prev.some((f) => f.id === newRow.id)) return prev;
              return [newRow, ...prev];
            });
          }
        }
      )
      .subscribe();

    // Fetch initial data after subscription is active
    supabase
      .from('feedback')
      .select('*, participants(nickname), sections(title)')
      .eq('workshop_id', workshopId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          const mapped = data.map((row: Record<string, unknown>) => ({
            ...row,
            nickname: (row.participants as Record<string, string>)?.nickname ?? 'Anonymous',
            section_title: (row.sections as Record<string, string>)?.title ?? 'Unknown',
          })) as FeedbackEntry[];

          // Merge buffered realtime entries, deduplicating by id
          const fetchedIds = new Set(mapped.map((f) => f.id));
          const uniqueBuffered = buffer.filter((f) => !fetchedIds.has(f.id));
          setFeedback([...uniqueBuffered, ...mapped]);
        }
        initialFetchDone = true;
        setLoading(false);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workshopId]);

  return { feedback, loading };
}

export function useSubmitFeedback() {
  const [loading, setLoading] = useState(false);

  const submit = useCallback(
    async (entry: {
      workshop_id: string;
      section_id: string;
      participant_id: string;
      sentiment: string;
      message: string;
      is_final_feedback?: boolean;
    }) => {
      setLoading(true);
      const { error } = await supabase.from('feedback').insert({
        ...entry,
        is_final_feedback: entry.is_final_feedback ?? false,
      });
      setLoading(false);
      if (error) throw error;
    },
    []
  );

  return { submit, loading };
}

export function useMyFeedback(participantId?: string, workshopId?: string) {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);

  const refresh = useCallback(async () => {
    if (!participantId || !workshopId) return;
    const { data } = await supabase
      .from('feedback')
      .select('*, sections(title)')
      .eq('participant_id', participantId)
      .eq('workshop_id', workshopId)
      .order('created_at', { ascending: false });
    if (data) {
      const mapped = data.map((row: Record<string, unknown>) => ({
        ...row,
        section_title: (row.sections as Record<string, string>)?.title ?? 'Unknown',
      })) as FeedbackEntry[];
      setFeedback(mapped);
    }
  }, [participantId, workshopId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { feedback, refresh };
}

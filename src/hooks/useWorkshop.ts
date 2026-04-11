import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

export interface Workshop {
  id: string;
  title: string;
  join_code: string;
  trainer_name: string;
  created_at: string;
}

export interface Section {
  id: string;
  workshop_id: string;
  title: string;
  sort_order: number;
}

export function useWorkshop(workshopId?: string) {
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workshopId) return;
    setLoading(true);
    Promise.all([
      supabase.from('workshops').select('*').eq('id', workshopId).single(),
      supabase.from('sections').select('*').eq('workshop_id', workshopId).order('sort_order'),
    ])
      .then(([wRes, sRes]) => {
        if (wRes.error) throw wRes.error;
        if (sRes.error) throw sRes.error;
        setWorkshop(wRes.data);
        setSections(sRes.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [workshopId]);

  return { workshop, sections, loading, error };
}

export function useWorkshopByCode(joinCode?: string) {
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!joinCode) return;
    setLoading(true);

    (async () => {
      try {
        const { data, error: err } = await supabase
          .from('workshops')
          .select('*')
          .eq('join_code', joinCode.toUpperCase())
          .single();

        if (err || !data) {
          setError('Workshop not found. Check the join code.');
          return;
        }
        setWorkshop(data);

        const { data: secs, error: secErr } = await supabase
          .from('sections')
          .select('*')
          .eq('workshop_id', data.id)
          .order('sort_order');

        if (!secErr && secs) setSections(secs);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, [joinCode]);

  return { workshop, sections, loading, error };
}

export function useCreateWorkshop() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (title: string, trainerName: string, joinCode: string, sectionTitles: string[]) => {
      setLoading(true);
      setError(null);
      try {
        const { data: ws, error: wsErr } = await supabase
          .from('workshops')
          .insert({ title, trainer_name: trainerName, join_code: joinCode })
          .select()
          .single();
        if (wsErr) throw wsErr;

        const sectionRows = sectionTitles.map((t, i) => ({
          workshop_id: ws.id,
          title: t,
          sort_order: i,
        }));
        const { error: secErr } = await supabase.from('sections').insert(sectionRows);
        if (secErr) throw secErr;

        return ws as Workshop;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to create workshop';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error };
}

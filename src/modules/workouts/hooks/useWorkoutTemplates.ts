import { useState, useEffect, useCallback } from 'react';
import { WorkoutTemplateWithCountRow } from '@database/repositories/workoutRepo';
import { getAllTemplatesWithCounts, toggleFavorite, deleteTemplate } from '../services/workoutTemplateService';

export function useWorkoutTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplateWithCountRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllTemplatesWithCounts();
      setTemplates(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleToggleFavorite = useCallback(
    async (id: number, current: boolean) => {
      await toggleFavorite(id, !current);
      await refresh();
    },
    [refresh]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteTemplate(id);
      await refresh();
    },
    [refresh]
  );

  return { templates, loading, refresh, toggleFavorite: handleToggleFavorite, deleteTemplate: handleDelete };
}

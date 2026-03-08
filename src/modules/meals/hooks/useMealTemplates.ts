import { useState, useEffect, useCallback } from 'react';
import { MealTemplateRow } from '@database/repositories/mealTemplateRepo';
import { getAllTemplates, toggleFavorite } from '../services/mealTemplateService';

export function useMealTemplates() {
  const [templates, setTemplates] = useState<MealTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllTemplates();
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

  return { templates, loading, refresh, toggleFavorite: handleToggleFavorite };
}

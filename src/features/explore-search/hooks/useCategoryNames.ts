import { useMemo } from 'react';

import { useCategories } from '@/features/home/hooks/useHomeData';

/** Category display names by slug, for labelling a venue ("Hair salon") from its `category_slugs`. */
export function useCategoryNames() {
  const categories = useCategories();
  return useMemo(() => {
    const names = new Map<string, string>();
    categories.data?.forEach((category) => names.set(category.slug, category.name));
    return names;
  }, [categories.data]);
}

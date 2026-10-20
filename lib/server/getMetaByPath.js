import { menuData } from '@/lib/server/menuData';

const findMeta = (menus, path) => {
  for (const menu of menus) {
    if (menu.Path === path) {
      return { title: menu.MTitle || menu.Title || '', description: menu.MDescription || '' };
    }
    for (const sub of menu.submenu || []) {
      if (sub.Path === path) {
        return { title: sub.STitle || sub.Title || '', description: sub.SDescription || '' };
      }
    }
  }
  return null;
};

export const getMetaByPath = async (path) => {
  try {
    const menus = await menuData();

    // Try exact match first (e.g. /shop?gender=Men)
    const exact = findMeta(menus, path);
    if (exact) return exact;

    // Fall back to pathname only (e.g. /shop) in case no query-string entry exists
    const base = path.split('?')[0];
    if (base !== path) {
      const fallback = findMeta(menus, base);
      if (fallback) return fallback;
    }
  } catch (err) {
    console.error('getMetaByPath error:', err);
  }
  return { title: '', description: '' };
};

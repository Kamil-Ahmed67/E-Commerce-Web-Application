import { menuData } from '@/lib/server/menuData';

export const getMenuTitleByPath = async (path, fallback = '') => {
  try {
    const menus = await menuData();
    const menu = menus.find(m => m.Path === path);
    return menu?.Title || fallback;
  } catch (err) {
    console.error('getMenuTitleByPath error:', err);
    return fallback;
  }
};

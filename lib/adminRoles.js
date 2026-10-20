// Full access — see every admin sidebar link, no restrictions.
// 'Admin' is kept for existing DB rows created before 'Super Admin' existed.
export const FULL_ACCESS_ROLES = ['Admin', 'Super Admin'];

// Roles allowed to enter the /admin panel at all (checked by the AuthChecker route guard).
export const ADMIN_PANEL_ROLES = [
  ...FULL_ACCESS_ROLES,
  'Shop Admin',
  'Merchandiser',
  'Management',
];

// Sidebar menu ids (see components/Admin/Sidebar.jsx `staticMenus`) visible to each restricted role.
// Roles in FULL_ACCESS_ROLES are not listed here — they always see every menu id.
export const ROLE_MENU_ACCESS = {
  'Shop Admin': ['dashboard', 'product', 'orders', 'menu', 'sell', 'customer-billing', 'feedback', 'chat-inbox'],
  'Merchandiser': ['dashboard', 'product', 'menu', 'orders', 'feedback', 'discounts'],
  'Management': ['dashboard', 'product', 'menu', 'orders', 'delivery-charge', 'sell', 'discounts', 'blog', 'news-events', 'customer-billing', 'feedback', 'chat-inbox'],
};

export function canAccessAdminPanel(role) {
  return ADMIN_PANEL_ROLES.includes(role);
}

export function isFullAccessRole(role) {
  return FULL_ACCESS_ROLES.includes(role);
}

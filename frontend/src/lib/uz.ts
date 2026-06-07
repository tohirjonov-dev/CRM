/** Buyurtma holati — API inglizcha, UI o'zbekcha */
export const ORDER_STATUS_UZ: Record<string, string> = {
  Pending: 'Kutilmoqda',
  Processing: 'Jarayonda',
  Shipped: 'Yuborildi',
  Delivered: 'Yetkazildi',
  Cancelled: 'Bekor qilindi',
};

export const CATEGORY_UZ: Record<string, string> = {
  "Men's": 'Erkaklar',
  "Women's": 'Ayollar',
  Kids: 'Bolalar',
  Accessories: 'Aksessuarlar',
};

export const ROLE_UZ: Record<string, string> = {
  admin: 'Administrator',
  staff: 'Xodim',
};

// app/(admin)/pages/admin/page.jsx
import Admin from '@/components/Admin';
import React from 'react';
export const metadata = {
  title: "Admin | Mingle",
  description: "This is Admin Page Of Mingle In Style",
};

export default function AdminPage() {
  return (
    <div className="min-h-[calc(119vh-230px)] px-2">
      <Admin /> 
    </div>
  );
}

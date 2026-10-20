import Discount from "@/components/Admin/Discount";

export const metadata = {
  title: "Discount Management | Mingle",
  description: "This is discount management page Of Mingle In Style",
};

export default function DiscountPage() {
  return (
    <div className="px-2 py-2" style={{ maxHeight: 'calc(150vh - 200px)' }}>
      <Discount />
    </div>
  );
}
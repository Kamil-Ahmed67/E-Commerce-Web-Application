import OrderManagedemo from "@/components/Admin/OrderManagedemo";

export const metadata = {
    title: "Manage Orders | Mingle",
    description: "This is Cart Page Of Mingle In Style",
};

export default function AdminPage() {
    return (
        <div className="min-h-[calc(119vh-230px)] px-2">
            <OrderManagedemo></OrderManagedemo>
        </div>
    );
}

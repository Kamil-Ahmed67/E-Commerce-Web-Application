import OrderManage from "@/components/Admin/OrderManage";

export const metadata = {
    title: "Manage Orders | Mingle",
    description: "This is Cart Page Of Mingle Fashion",
};

export default function AdminPage() {
    return (
        <div className="min-h-[calc(119vh-230px)] px-2">
           <OrderManage></OrderManage>
        </div>
    );
}

import FeatureManage from "@/components/Admin/FeatureManage";

export const metadata = {
    title: "Feature Manage | Mingle",
    description: "This is Feature Management Of Mingle In Style",
};

export default function AdminPage() {
    return (
        <div className="min-h-[calc(119vh-230px)] px-2">
           <FeatureManage></FeatureManage>
        </div>
    );
}

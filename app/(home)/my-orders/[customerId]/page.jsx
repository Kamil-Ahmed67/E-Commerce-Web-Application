'use client'
import MyOrders from "@/components/MyOrders/MyOrders";
import AccountSidebar from "@/components/ProfileOrderManage";
import AccountDetails from "@/components/ProfileOrderManage/AccountDetails";
import Dashboard from "@/components/ProfileOrderManage/Dashboard";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import { useState } from "react";

const TAB_LABELS = {
  dashboard: "Dashboard",
  orders: "Orders",
  "account-details": "Account Details",
};

const MyOrdersPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "orders":
        return <MyOrders />;
      case "account-details":
        return <AccountDetails />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <main className="flex flex-col lg:flex-row gap-2 lg:gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="lg:w-1/4 w-full">
        <AccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="lg:w-3/4 w-full">
        <div className="mb-4">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'My Account', href: null },
            { label: TAB_LABELS[activeTab] || 'Dashboard', href: null },
          ]} />
        </div>
        {renderActiveTab()}
      </div>
    </main>
  );
};

export default MyOrdersPage;
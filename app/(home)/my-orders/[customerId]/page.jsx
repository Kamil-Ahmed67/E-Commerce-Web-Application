'use client'
import MyOrders from "@/components/MyOrders/MyOrders";
import AccountSidebar from "@/components/ProfileOrderManage";
import AccountDetails from "@/components/ProfileOrderManage/AccountDetails";
import Dashboard from "@/components/ProfileOrderManage/Dashboard";
import { useState } from "react";
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
        {renderActiveTab()}
      </div>
    </main>
  );
};

export default MyOrdersPage;
'use client';
import { AuthContext } from "@/provider/AuthProvider";
import { useContext } from "react";
import { FiGrid, FiShoppingBag, FiUser } from "react-icons/fi";
const AccountSidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FiGrid className="w-5 h-5" />,
    },
    {
      id: "orders",
      label: "Orders",
      icon: <FiShoppingBag className="w-5 h-5" />,
    },
    {
      id: "account-details",
      label: "Account Details",
      icon: <FiUser className="w-5 h-5" />,
    },
  ];

   const { loginData } = useContext(AuthContext);

  return (
    <div className="bg-white rounded-md border border-gray-300 shadow-md mt-18 lg:mt-30 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <FiUser className="text-gray-600 text-xl" />
          </div>
          <div>
            <p className="font-medium text-gray-700">{loginData?.Name}</p>
            <p className="text-xs text-gray-500">{loginData?.Email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isLast = index === tabs.length - 1;

          return (
            <div
              key={tab.id}
              className={`
                ${isActive ? "bg-teal-600 text-white" : "text-gray-700 hover:bg-gray-100"}
                ${isLast ? "rounded-b-md" : ""}
                transition-colors
              `}
            >
              <button
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center w-full gap-3 py-2.5 px-4 text-left"
              >
                <span className={isActive ? "text-white" : ""}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountSidebar;
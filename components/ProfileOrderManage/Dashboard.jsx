'use client'

const Dashboard = () => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm lg:mt-30 p-6">
      <h2 className="text-xl font-semibold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add your dashboard widgets here */}
        <div className="bg-[#EFF6FF] p-4 rounded-lg">
          <h3 className="font-medium text-blue-700">Recent Orders</h3>
          <p className="text-gray-600 mt-2">View your recent orders</p>
        </div>
        <div className="bg-[#FEF2F2] p-4 rounded-lg">
          <h3 className="font-medium text-green-700">Account Info</h3>
          <p className="text-gray-600 mt-2">Manage your account details</p>
        </div>
        <div className="bg-[#FAF5FF] p-4 rounded-lg">
          <h3 className="font-medium text-[#6B21A8]">Address Book</h3>
          <p className="text-gray-600 mt-2">Manage your shipping addresses</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
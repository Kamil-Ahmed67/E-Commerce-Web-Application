"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/provider/AuthProvider';
import config from '@/config';

export default function MenuManager() {
  const router = useRouter();
  const { loginData } = useAuth();

  const [menuData, setMenuData] = useState({
    title: '',
    path: '',
    newTab: false,
    isActive: true
  });

  const [submenus, setSubmenus] = useState([]);

  const [currentSubmenu, setCurrentSubmenu] = useState({
    title: '',
    path: '',
    newTab: false,
    category: 'Category',
    isActive: true
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleAddSubmenu = () => {
    if (currentSubmenu.title && currentSubmenu.path) {
      setSubmenus(prev => [
        ...prev,
        { ...currentSubmenu }
      ]);

      setCurrentSubmenu({
        title: '',
        path: '',
        newTab: false,
        category: 'Category',
        isActive: true
      });
    }
  };

  const handleSubmit = async () => {
    if (!menuData.title || !menuData.path) return;

    setIsLoading(true);

    try {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');

      if (loginData?.tenantId) {
        headers.append('TenantId', config.tenantId);
      }

      const payload = {
        entryBy: loginData?.Name || 'system',
        isActive: menuData.isActive,
        title: menuData.title,
        path: menuData.path,
        newTab: menuData.newTab,
        eSubMenus: submenus.length > 0 
          ? submenus.map(sub => ({
              isActive: sub.isActive,
              title: sub.title,
              path: sub.path,
              newTab: sub.newTab,
              category: sub.category
            }))
          : []
      };

      const response = await fetch(`${config.API_BASE_URL}api/EItem/AddMenuWithSubMenu`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        router.refresh();
        setMenuData({
          title: '',
          path: '',
          newTab: false,
          isActive: true
        });
        setSubmenus([]);
        alert('Menu saved successfully!');
      } else {
        const errorMsg = result.message || 'Failed to save menu';
        alert(`Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      alert('An error occurred while saving the menu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-3">
      <div className="p-6 rounded shadow-2xl bg-white px-4">
        <h2 className="text-xl text-gray-700 font-semibold mb-6">Add New Menu</h2>

        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu Title*
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded focus:ring-2 focus:ring-teal-600 focus:border-teal-700"
                value={menuData.title}
                onChange={(e) => setMenuData({ ...menuData, title: e.target.value })}
                placeholder="e.g., Shop, Brands"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu Path*
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded focus:ring-2 focus:ring-teal-600 focus:border-teal-700"
                value={menuData.path}
                onChange={(e) => setMenuData({ ...menuData, path: e.target.value })}
                placeholder="e.g., /shop, /brands"
              />
            </div>
          </div>

          <div className="flex space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newTab"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={menuData.newTab}
                onChange={(e) => setMenuData({ ...menuData, newTab: e.target.checked })}
              />
              <label htmlFor="newTab" className="ml-2 block text-sm text-gray-700">
                Open in new tab
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={menuData.isActive}
                onChange={(e) => setMenuData({ ...menuData, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Submenu Items</h3>

          <div className="bg-gray-50 p-4 rounded mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title*
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={currentSubmenu.title}
                  onChange={(e) => setCurrentSubmenu({ ...currentSubmenu, title: e.target.value })}
                  placeholder="e.g., New Arrivals"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Path*
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={currentSubmenu.path}
                  onChange={(e) => setCurrentSubmenu({ ...currentSubmenu, path: e.target.value })}
                  placeholder="e.g., /new-arrivals"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={currentSubmenu.category}
                  onChange={(e) =>
                    setCurrentSubmenu({
                      ...currentSubmenu,
                      category: e.target.value
                    })
                  }
                >
                  <option value="Brand">Brand</option>
                  <option value="Featured">Featured</option>
                  <option value="Category">Category</option>
                </select>
              </div>

              <div className="flex items-end mb-1">
                <button
                  onClick={handleAddSubmenu}
                  disabled={!currentSubmenu.title || !currentSubmenu.path}
                  className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    !currentSubmenu.title || !currentSubmenu.path ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {submenus.length > 0 ? (
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Path
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submenus.map((submenu, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {submenu.title}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {submenu.path}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            submenu.category === 'Brand'
                              ? 'bg-blue-100 text-blue-800'
                              : submenu.category === 'Featured'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {submenu.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        <button
                          onClick={() => setSubmenus(submenus.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-900 focus:outline-none"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-500">No submenu items added yet</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !menuData.title || !menuData.path}
            className={`px-6 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              isLoading || !menuData.title || !menuData.path ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Menu'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
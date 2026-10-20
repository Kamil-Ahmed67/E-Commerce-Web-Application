import config from "@/config";

/**
 * Fetch menus and their submenus from the API
 * @returns {Promise<Array>} Array of menu objects with submenu
 */
export const menuData = async () => {
  try {
    // Fetch main menus
    const menuRes = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TenantId": config.tenantId,
      },
      body: JSON.stringify({
        operation: "",
        procedureName: "SP_EcomMenu",
        parameters: { QueryChecker: 1 },
      }),
      next: { revalidate: 3600 },
    });

    if (!menuRes.ok) throw new Error(`Failed to fetch menus: ${menuRes.status}`);
    let menus = await menuRes.json();

    // Sort menus by SortOrder then Id
    menus.sort((a, b) => (a.SortOrder ?? Infinity) - (b.SortOrder ?? Infinity) || a.Id - b.Id);

    // Fetch submenus for each menu
    const menusWithSubmenus = await Promise.all(
      menus.map(async (menu) => {
        const submenuRes = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "TenantId": config.tenantId,
          },
          body: JSON.stringify({
            operation: "",
            procedureName: "SP_EcomMenu",
            parameters: { QueryChecker: 2, Id: menu.Id }, // submenus
          }),
          next: { revalidate: 3600 },
        });

        let submenus = [];
        if (submenuRes.ok) {
          submenus = await submenuRes.json();
          // Filter only active submenus
          submenus = submenus.filter(sub => sub.IsActive);
        }

        return {
          Id: menu.Id,
          Title: menu.Title,
          Path: menu.Path,
          NewTab: menu.NewTab ?? false,
          IsActive: menu.IsActive,
          PromoImage: menu.PromoImage ?? "",
          MTitle: menu.MTitle ?? "",
          MDescription: menu.MDescription ?? "",
          submenu: submenus.map(sub => ({
            Id: sub.Id,
            MenuId: sub.MenuId,
            Title: sub.Title,
            Path: sub.Path,
            Category: sub.Category || "Other",
            NewTab: sub.NewTab ?? false,
            IsActive: sub.IsActive ?? true,
            STitle: sub.STitle ?? "",
            SDescription: sub.SDescription ?? "",
          })),
        };
      })
    );
    return menusWithSubmenus;
  } catch (err) {
    console.error("Error fetching menu data:", err);
    return [];
  }
};

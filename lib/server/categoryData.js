// fetchCategories.js
import config from "@/config";

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
    method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TenantId": config.tenantId,
      },
      body: JSON.stringify({
        operation: "",
        procedureName: "SP_EcomItem",
        parameters: { QueryChecker: 22 },
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};
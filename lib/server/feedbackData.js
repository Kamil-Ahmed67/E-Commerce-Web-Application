import config from "@/config";

export const feedbackData = async () => {
  try {
    const response = await fetch(
      `${config.API_BASE_URL}api/Procedure/GetData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          TenantId: config.tenantId,
        },
        body: JSON.stringify({
          operation: "",
          procedureName: "SP_EcomCustomer",
          parameters: {
            QueryChecker: 3,
          },
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch customer messages: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching customer messages:", error);
    return [];
  }
};

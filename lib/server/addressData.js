import config from "@/config";

// Get all active districts (QueryChecker: 13)
export const getDistricts = async () => {
  try {
    const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TenantId": config.tenantId,
      },
      body: JSON.stringify({
        operation: '',
        procedureName: 'SP_EcomItem',
        parameters: {
          QueryChecker: 13
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    //console.log('Received districts:', data);

    return data.map(d => ({
      id: d.Id,
      name: d.Name,
      isActive: d.IsActive,
    }));
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw error;
  }
};

// Get active sub-districts for a specific district (QueryChecker: 14)
export const getSubDistrictsByDistrict = async (districtId) => {
  try {
    const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TenantId": config.tenantId,
      },
      body: JSON.stringify({
        operation: '',
        procedureName: 'SP_EcomItem',
        parameters: {
          QueryChecker: 14,
          Id: districtId
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log(`Received sub-districts for district ${districtId}:`, data);

    return data.map(sd => ({
      id: sd.Id,
      disId: sd.DisId,
      name: sd.Name,
      amount: sd.Amount,
      isActive: sd.IsActive,
    }));
  } catch (error) {
    console.error("Error fetching sub-districts:", error);
    throw error;
  }
};

export const getAllSubDistricts = async () => {
  try {
    // You might need to create a separate query in your SP for this
    // For now, we can get all districts and then all their sub-districts
    const districts = await getDistricts();
    const allSubDistricts = [];
    
    for (const district of districts) {
      const subDistricts = await getSubDistrictsByDistrict(district.id);
      allSubDistricts.push(...subDistricts);
    }
    
    return allSubDistricts;
  } catch (error) {
    console.error("Error fetching all sub-districts:", error);
    throw error;
  }
};

export const getSubDistrictAmount = async (subDistrictId) => {
  // NEW fast version:
  const { getDeliveryAmount } = await import("./addressCache");
  return getDeliveryAmount(subDistrictId);
};
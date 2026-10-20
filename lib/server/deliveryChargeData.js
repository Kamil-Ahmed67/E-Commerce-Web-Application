import config from "@/config";

const headers = {
  "Content-Type": "application/json",
  TenantId: config.tenantId,
};

const callSp = async (queryChecker, extraParams = {}) => {
  const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      operation: "",
      procedureName: "Sp_EcomDistricts",
      parameters: { QueryChecker: queryChecker, ...extraParams },
    }),
    next: { revalidate: 3600 },
  });
  if (!response.ok) throw new Error(`SP call failed: ${response.status}`);
  return response.json();
};

export const getDistricts = async () => {
  try { return await callSp(1); }
  catch (e) { console.error(e); return []; }
};

export const getDeliveryCharges = async () => {
  try { return await callSp(2); }
  catch (e) { console.error(e); return []; }
};

export const getSubDistrictById = async (id) => {
  try { return await callSp(3, { Id: id }); }
  catch (e) { console.error(e); return null; }
};

export const addSubDistrict = async (payload) => {
  const res = await fetch(`${config.API_BASE_URL}api/Discount/AddSubDistrict`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Add failed: ${res.status}`);
  return res.json();
};

export const updateSubDistrict = async (payload) => {
  const res = await fetch(`${config.API_BASE_URL}api/Discount/UpdateSubDistrict`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  return res.json();
};

export const deleteSubDistrict = async (id) => {
  const res = await fetch(`${config.API_BASE_URL}api/Discount/DeleteSubDistrict/${id}`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  return res.json();
};

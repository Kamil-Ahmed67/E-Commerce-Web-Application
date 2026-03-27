// getBrands.js
import config from "@/config";
const getBrands = async () => {
  const response = await fetch(`${config.API_BASE_URL}api/EItem/GetAllBrand`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      TenantId: config.tenantId,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch brands: ${response.statusText}`);
  }

  const data = await response.json();

  return data.map((brand) => ({
    Id: brand.Id,
    Name: brand.Name,
    Logo: brand.Logo,
  }));
};

export { getBrands };
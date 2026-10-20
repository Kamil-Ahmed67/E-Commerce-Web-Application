import config from "@/config";

const extractDriveId = (url) => {
  const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([\w-]+)/);
  if (lh3Match) return lh3Match[1];
  const thumbnailMatch = url.match(/drive\.google\.com\/thumbnail\?.*[?&]id=([\w-]+)/);
  if (thumbnailMatch) return thumbnailMatch[1];
  const ucMatch = url.match(/drive\.google\.com\/uc\?.*[?&]id=([\w-]+)/);
  if (ucMatch) return ucMatch[1];
  return null;
};

const normalizeDriveUrl = (url) => {
  const id = extractDriveId(url);
  if (id) return `/api/drive-proxy?id=${id}`;
  return url;
};

const resolveImageUrl = (url) => {
  if (!url) return null;
  let normalized = url.trim();
  if (normalized.startsWith('//')) {
    normalized = 'https:' + normalized;
  } else if (normalized.startsWith('http://')) {
    normalized = normalized.replace('http://', 'https://');
  }
  if (normalized.startsWith('https://')) return normalizeDriveUrl(normalized);
  if (normalized.startsWith('/uploads/')) {
    const base = config.API_BASE_URL?.replace(/\/$/, '') || '';
    return `${base}${normalized}`;
  }
  return normalized;
};

const convertApiBrand = (b) => ({
  id: b.Id,
  name: b.Name,
  // Home page image
  homeImg: resolveImageUrl(b.HomeImg),
  hMetaDescription: b.HMetaDescription || '',
  hImgAltText: b.HImgAltText || '',
  // Brand collection page banner
  brandBannerImg: resolveImageUrl(b.BrandBanneImg),
  bMetaDescription: b.BMetaDescription || '',
  bImgAltText: b.BImgAltText || '',
  // Men section
  menImg: resolveImageUrl(b.MenImg),
  menMetaDescription: b.MenMetaDescription || '',
  mAltText: b.MAltText || '',
  // Women section
  womenImg: resolveImageUrl(b.WomenImg),
  wMetaDescription: b.WMetaDescription || '',
  wAltText: b.WAltText || '',
  // Shared
  remarks: b.Remarks || '',
  entryDate: b.EntryDate,
  updateDate: b.UpdateDate,
  entryBy: b.EntryBy,
  updateBy: b.UpdateBy,
  isActive: b.IsActive,
});

// cacheOptions defaults to no-store (safe for the write/mutation callers below);
// read-only callers (getAllBrands/getActiveBrands/getBrandById) opt into revalidation.
const postProcedure = async (parameters, cacheOptions = { cache: 'no-store' }) => {
  const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', TenantId: config.tenantId },
    body: JSON.stringify({ operation: '', procedureName: 'SP_Brands', parameters }),
    ...cacheOptions,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
  return response.json();
};

// Legacy — used in existing frontend components
export const getBrands = async () => {
  const response = await fetch(`${config.API_BASE_URL}api/EItem/GetAllBrand`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', TenantId: config.tenantId },
  });
  if (!response.ok) throw new Error(`Failed to fetch brands: ${response.statusText}`);
  const data = await response.json();
  return data.map((brand) => ({ Id: brand.Id, Name: brand.Name, Logo: brand.Logo }));
};

export const getAllBrands = async () => {
  const data = await postProcedure(
    { QueryChecker: 6, CompanyId: config.CompanyId },
    { next: { revalidate: 3600 } }
  );
  return data.map(convertApiBrand);
};

export const getActiveBrands = async () => {
  const data = await postProcedure(
    { QueryChecker: 3, CompanyId: config.CompanyId },
    { next: { revalidate: 3600 } }
  );
  return data.map(convertApiBrand);
};

export const getBrandById = async (id) => {
  const data = await postProcedure(
    { QueryChecker: 5, Id: id, CompanyId: config.CompanyId },
    { next: { revalidate: 3600 } }
  );
  return data.length ? convertApiBrand(data[0]) : null;
};

export const getBrandByName = async (name) => {
  const all = await getAllBrands();
  return all.find((b) => b.name.toLowerCase() === name.toLowerCase()) || null;
};

// Updates brand entity fields only (Name/Remarks/IsActive). Images now live in the
// Banner/AccessKey system, not on EcomtblBrand — but we still forward through whatever
// image/alt/meta values were already loaded on brandData so this save can't blank them out.
export const updateBrand = async (brandData) => {
  const data = await postProcedure({
    QueryChecker: 2,
    Id: brandData.id,
    Name: brandData.name,
    HomeImg: brandData.homeImg || null,
    HMetaDescription: brandData.hMetaDescription || null,
    HImgAltText: brandData.hImgAltText || null,
    BrandBanneImg: brandData.brandBannerImg || null,
    BMetaDescription: brandData.bMetaDescription || null,
    BImgAltText: brandData.bImgAltText || null,
    MenImg: brandData.menImg || null,
    MenMetaDescription: brandData.menMetaDescription || null,
    MAltText: brandData.mAltText || null,
    WomenImg: brandData.womenImg || null,
    WMetaDescription: brandData.wMetaDescription || null,
    WAltText: brandData.wAltText || null,
    Remarks: brandData.remarks || null,
    IsActive: brandData.isActive !== undefined ? brandData.isActive : true,
    UpdateBy: brandData.updateBy,
    CompanyId: config.CompanyId,
  });
  return data[0]?.AffectedRows > 0;
};

export const deleteBrand = async (id) => {
  const data = await postProcedure({ QueryChecker: 4, Id: id, CompanyId: config.CompanyId });
  return data[0]?.AffectedRows > 0;
};

export const toggleBrandActive = async (id, isActive, updateBy) => {
  // QC=8: admin-only toggle — works on any brand regardless of current IsActive
  const data = await postProcedure({
    QueryChecker: 8,
    Id: id,
    IsActive: isActive,
    UpdateBy: updateBy,
    CompanyId: config.CompanyId,
  });

  return data[0]?.AffectedRows > 0;
};

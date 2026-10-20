// lib/server/bannerData.js

import config from "@/config";

const resolveImageUrl = (url) => {
  if (!url) return url;
  let normalized = url.trim();
  if (normalized.startsWith('//')) {
    normalized = 'https:' + normalized;
  } else if (normalized.startsWith('http://')) {
    normalized = normalized.replace('http://', 'https://');
  }
  if (normalized.startsWith('https://')) return normalized;
  if (normalized.startsWith('/uploads/')) {
    const base = config.API_BASE_URL?.replace(/\/$/, '') || '';
    return `${base}${normalized}`;
  }
  return normalized;
};

const convertApiBanner = (b) => {
  const images = b.BannerImage
    ? b.BannerImage
        .replace(/\[|\]/g, "")
        .split(",")
        .map((url) => resolveImageUrl(url.trim()))
        .filter(Boolean)
    : [];

  return {
    id: b.Id,
    title: b.Title,
    description: b.Description,
    bannerImage: images,
    videoUrl: b.VideoUrl || '',
    accessKey: b.AccessKey || 'Home',
    remarks: b.Remarks,
    entryDate: b.EntryDate,
    updateDate: b.UpdateDate,
    entryBy: b.EntryBy,
    updateBy: b.UpdateBy,
    isActive: b.IsActive,
  };
};

// cacheOptions defaults to no-store (safe for the write/mutation callers below);
// read-only callers opt into revalidation explicitly.
const postProcedure = async (parameters, cacheOptions = { cache: "no-store" }) => {
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
        procedureName: "SP_Banners",
        parameters,
      }),
      ...cacheOptions,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${errorText}`
    );
  }

  return response.json();
};

export const getBanners = async () => {
  const data = await postProcedure(
    { QueryChecker: 3, CompanyId: config.CompanyId },
    { next: { revalidate: 900 } }
  );
  return data.map(convertApiBanner);
};

export const getMingleBanners = async () => {
  const data = await postProcedure(
    { QueryChecker: 7, CompanyId: config.CompanyId },
    { next: { revalidate: 900 } }
  );
  return data.map(convertApiBanner);
};

export const getBannersByAccessKey = async (accessKey) => {
  const data = await postProcedure(
    { QueryChecker: 8, AccessKey: accessKey, CompanyId: config.CompanyId },
    { next: { revalidate: 900 } }
  );
  return data.map(convertApiBanner);
};
export const getAllBanners = async () => {
  const data = await postProcedure(
    { QueryChecker: 6, CompanyId: config.CompanyId },
    { next: { revalidate: 900 } }
  );
  return data.map(convertApiBanner);
};

export const getBannerById = async (id) => {
  const data = await postProcedure({
    QueryChecker: 5,
    Id: id,
    CompanyId: config.CompanyId,
  });
  return data.length ? convertApiBanner(data[0]) : null;
};

export const createBanner = async (bannerData) => {
  const data = await postProcedure({
    QueryChecker: 1,
    Title: bannerData.title || "",
    Description: bannerData.description || "",
    BannerImage: Array.isArray(bannerData.bannerImage) ? bannerData.bannerImage.join(",") : (bannerData.bannerImage || ""),
    VideoUrl: bannerData.videoUrl || "",
    AccessKey: bannerData.accessKey || "Home",
    Remarks: bannerData.remarks || "",
    EntryBy: bannerData.entryBy || "",
    IsActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
    CompanyId: config.CompanyId,
  });

  return data[0]?.Id || 0;
};

export const updateBanner = async (bannerData) => {
  const data = await postProcedure({
    QueryChecker: 2,
    Id: bannerData.id,
    Title: bannerData.title,
    Description: bannerData.description,
    BannerImage: bannerData.bannerImage.join(","),
    Remarks: bannerData.remarks || "",
    UpdateBy: bannerData.updateBy,
    IsActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
    AccessKey: bannerData.accessKey || 'Home',
    CompanyId: config.CompanyId,
  });

  return data[0]?.AffectedRows > 0;
};

export const deleteBanner = async (id) => {
  const data = await postProcedure({
    QueryChecker: 4,
    Id: id,
    CompanyId: config.CompanyId,
  });

  return data[0]?.AffectedRows > 0;
};

export const toggleBannerActive = async (id, isActive, updateBy) => {
  const currentBanner = await getBannerById(id);
  if (!currentBanner) throw new Error("Banner not found");

  const data = await postProcedure({
    QueryChecker: 2,
    Id: id,
    Title: currentBanner.title,
    Description: currentBanner.description,
    BannerImage: currentBanner.bannerImage.join(","),
    Remarks: currentBanner.remarks || "",
    UpdateBy: updateBy,
    IsActive: isActive,
    AccessKey: currentBanner.accessKey || 'Home',
    CompanyId: config.CompanyId,
  });

  return data[0]?.AffectedRows > 0;
};

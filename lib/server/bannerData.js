// lib/server/bannerData.js

import config from "@/config";

const convertApiBanner = (b) => {
  const images = b.BannerImage
    ? b.BannerImage
        .replace(/\[|\]/g, "")
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
    : [];

  return {
    id: b.Id,
    title: b.Title,
    description: b.Description,
    bannerImage: images,
    videoUrl: b.VideoUrl || '',
    remarks: b.Remarks,
    entryDate: b.EntryDate,
    updateDate: b.UpdateDate,
    entryBy: b.EntryBy,
    updateBy: b.UpdateBy,
    isActive: b.IsActive,
  };
};

const postProcedure = async (parameters) => {
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
      cache: "no-store",
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
  const data = await postProcedure({
    QueryChecker: 3,
    CompanyId: config.CompanyId,
  });
  return data.map(convertApiBanner);
};

export const getAllBanners = async () => {
  const data = await postProcedure({
    QueryChecker: 6,
    CompanyId: config.CompanyId,
  });
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
    Title: bannerData.title,
    Description: bannerData.description,
    BannerImage: bannerData.bannerImage.join(","),
    Remarks: bannerData.remarks || "",
    EntryBy: bannerData.entryBy,
    IsActive:
      bannerData.isActive !== undefined ? bannerData.isActive : true,
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
    IsActive:
      bannerData.isActive !== undefined ? bannerData.isActive : true,
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
    CompanyId: config.CompanyId,
  });

  return data[0]?.AffectedRows > 0;
};

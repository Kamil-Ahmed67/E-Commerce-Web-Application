// lib/server/addressCache.js

import { getDistricts, getSubDistrictsByDistrict } from "./addressData";

let _districts = null;
const _subDistrictMap = {};

export const getAllDistricts = async () => {
  if (_districts) return _districts;
  _districts = await getDistricts();
  return _districts;
};

export const getSubDistricts = async (districtId) => {
  if (_subDistrictMap[districtId]) return _subDistrictMap[districtId];

  const subs = await getSubDistrictsByDistrict(districtId);
  _subDistrictMap[districtId] = subs;
  return subs;
};

export const getDeliveryAmount = (subDistrictId) => {
  for (const list of Object.values(_subDistrictMap)) {
    const sd = list.find(s => s.id === subDistrictId);
    if (sd) return sd.amount;
  }
  return 0;
};
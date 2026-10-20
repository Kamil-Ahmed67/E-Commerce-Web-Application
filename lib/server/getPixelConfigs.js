import config from '@/config';

export async function getPixelConfigs() {
  try {
    const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'TenantId': config.tenantId },
      body: JSON.stringify({
        operation: '',
        procedureName: 'SP_EcomConfigApi',
        parameters: { QueryChecker: 3 },
      }),
      next: { revalidate: 86400, tags: ['pixel-configs'] },
    });
    const data = await res.json();
    const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return rows.filter((r) => r.IsActive);
  } catch {
    return [];
  }
}

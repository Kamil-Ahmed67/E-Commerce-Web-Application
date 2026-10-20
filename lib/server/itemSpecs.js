import config from '@/config';

export async function getItemSpecs(itemId) {
  try {
    const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TenantId': config.tenantId,
      },
      body: JSON.stringify({
        operation: '',
        procedureName: 'SP_POStblItemSpecification',
        parameters: { QueryChecker: 3, ItemId: Number(itemId) },
      }),
      next: { revalidate: 600, tags: ['products'] },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

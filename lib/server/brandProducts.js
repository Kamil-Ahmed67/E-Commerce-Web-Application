import { getProducts } from '@/lib/server/shopData';

const brandKey = (s) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// Products of one brand, newest first (brand match ignores case/spaces: "PURE NORTH" == "PureNorth")
export async function getBrandProducts(dbBrand) {
    const all = await getProducts().catch(() => []);
    const key = brandKey(dbBrand);
    return all
        .filter(p => brandKey(p.brand) === key)
        .sort((a, b) => (b.EntryDate ? new Date(b.EntryDate).getTime() : 0) - (a.EntryDate ? new Date(a.EntryDate).getTime() : 0));
}

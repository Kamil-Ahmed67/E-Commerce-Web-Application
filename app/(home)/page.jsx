import BannerSlider from "@/components/BannerSlider/BannerSlider";
import NewsletterSection from "@/components/Home/NewsletterSection";
import BestSellingSection from "@/components/Home/BestSellingSection";
import NewArrivalsSection from "@/components/Home/NewArrivalsSection";
import ShopTheRange from "@/components/Home/ShopTheRange";
import DiscoverBrands from "@/components/Home/DiscoverBrands";
import TestimonialsSection from "@/components/Home/TestimonialsSection";
import StoreLocationSection from "@/components/Home/StoreLocationSection";
import OffersSection from "@/components/Home/OffersSection";
import DeliveryHighlights from "@/components/Home/DeliveryHighlights";
import SocialSection from "@/components/Home/SocialSection";
import { getBanners, getBannersByAccessKey, getAllBanners } from "@/lib/server/bannerData";
import { getProducts, getNewProducts } from "@/lib/server/shopData";
import { getAllBrands } from "@/lib/server/brandData";

export const revalidate = 300;

export default async function Home() {
  // // Fetch data in parallel
  let [productsData, banners, brands, menBanners, womenBanners, allBanners, newArrivalProducts] = await Promise.all([
    getProducts(),
    getBanners(),
    getAllBrands().catch((err) => { console.error('getAllBrands failed:', err); return []; }),
    getBannersByAccessKey('Home Men').catch(() => []),
    getBannersByAccessKey('Home Women').catch(() => []),
    getAllBanners().catch(() => []),
    getNewProducts().catch(() => []),
  ]);

  const sortedNewArrivals = [...newArrivalProducts].sort((a, b) => {
    const dateA = a.EntryDate ? new Date(a.EntryDate).getTime() : 0;
    const dateB = b.EntryDate ? new Date(b.EntryDate).getTime() : 0;
    return dateB - dateA;
  });

  const trendingImages = {
    men:   menBanners[0]?.bannerImage?.[0] || null,
    women: womenBanners[0]?.bannerImage?.[0] || null,
  };

  // Map of accessKey (lowercase) -> { image, title } for the brand "Home" carousel images
  const brandHomeBanners = {};
  allBanners.filter(b => b.isActive && b.bannerImage?.[0]).forEach(b => {
    const key = b.accessKey.toLowerCase();
    if (!brandHomeBanners[key]) brandHomeBanners[key] = { image: b.bannerImage[0], title: b.title };
  });
  // // Fallback: if no banners match AccessKey='Home' load all banners
  // if (banners.length === 0) {
  //   banners = await getAllBanners();
  // }



  // Sort products by date
  const sortedByDate = [...productsData].sort((a, b) => {
    const dateA = a.EntryDate ? new Date(a.EntryDate).getTime() : 0;
    const dateB = b.EntryDate ? new Date(b.EntryDate).getTime() : 0;
    return dateB - dateA;
  });

  // Get best selling products
  const bestSellingProducts = [...sortedByDate]
    .sort((a, b) => b.sellQty - a.sellQty)
    .slice(0, 5);

  return (
    <div className="min-h-screen pt-[var(--header-height)] bg-white">
      <BannerSlider banners={banners} autoPlayInterval={4000} />
      <NewArrivalsSection products={sortedNewArrivals} />
      <ShopTheRange products={sortedByDate} />
      <DiscoverBrands />
      <TestimonialsSection />
      <StoreLocationSection />
      {/* <OffersSection products={sortedByDate} /> */}
      <DeliveryHighlights />
      <SocialSection />
      <BestSellingSection products={bestSellingProducts} />
      {/* <NewsletterSection /> */}
    </div>
  );
}
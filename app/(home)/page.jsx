import BannerSlider from "@/components/BannerSlider/BannerSlider";
import BestSellingSection from "@/components/Home/BestSellingSection";
//import BrandsSection from "@/components/Home/BrandsSection";
import CallToActionSection from "@/components/Home/CallToActionSection";
import CategoriesSection from "@/components/Home/CategoriesSection";
import FeaturedProductsSection from "@/components/Home/FeaturedProductsSection";
import NewsletterSection from "@/components/Home/NewsletterSection";
import { getBanners } from "@/lib/server/bannerData";
import { getProducts } from "@/lib/server/shopData";

export const revalidate = 300; // Revalidate every 5 minutes
export const dynamic = 'force-dynamic'; // Ensure dynamic rendering

export default async function Home() {
  // Fetch data in parallel
  const [productsData, banners] = await Promise.all([
    getProducts(),
    getBanners()
  ]);


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
    <div className="min-h-screen  pt-15.5 lg:pt-29.5 bg-gray-50">
      <BannerSlider banners={banners} autoPlayInterval={4000} />
      <CategoriesSection />
      {/* <BrandsSection /> */}
      <FeaturedProductsSection
        products={sortedByDate}
        allProducts={sortedByDate}
      />
      <BestSellingSection className products={bestSellingProducts} />
      <NewsletterSection />
      <CallToActionSection />
    </div>
  );
}
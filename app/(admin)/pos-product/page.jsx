import POSProduct from "@/components/Admin/POSProduct";

export const metadata = {
  title: "Product List | Mingle",
  description: "This is product list Of Mingle Fashion",
};

const POSProductListPage = () => {
  return (
    <div className="px-2 py-2">
      <POSProduct />
    </div>
  );
};

export default POSProductListPage;

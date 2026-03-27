import ProductList from "@/components/Admin/ProductList";

export const metadata = {
  title: "Product List | Mingle",
  description: "This is product list Of Mingle Fashion",
};

const ProductListPage = () => {
  return (
    <div className="px-2 py-2">
      <ProductList />
    </div>
  );
};

export default ProductListPage;

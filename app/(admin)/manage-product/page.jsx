import ProductManage from "@/components/Admin/ProductManage";

export const metadata = {
  title: "Manage Products | Mingle",
  description: "This is Cart Page Of Mingle Fashion",
};

const ProductManagePage = () => {
  return (
    <>
      <div className="px-2 py-2">
        <ProductManage />
      </div>
    </>
  );
};

export default ProductManagePage;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../layout";
import { CaretRight, PencilSimple, TrashSimple } from "@phosphor-icons/react";
import EditProductModal from "./EditProductModal";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSave = async (updatedProduct) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${updatedProduct.ProductID}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: updatedProduct.ProductName,
            price: updatedProduct.Price,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.ProductID === updatedProduct.ProductID
              ? updatedProduct
              : product
          )
        );
        handleModalClose();
      } else {
        console.error("Error updating product:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDelete = async (productID) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productID}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.ProductID !== productID)
        );
      } else {
        console.error("Error deleting product:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <Layout>
      <section className="h-full flex flex-col">
        <div className="w-full flex justify-between items-center px-10">
          <h1 className="text-blueSerenity py-5">Products</h1>
          <div className="flex items-center">
            <button
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
              onClick={() => navigate("/admin/products/new-product")}
            >
              Create new Product
              <CaretRight size={20} />
            </button>
          </div>
        </div>

        <div className="px-10 max-h-full h-full overflow-x-auto gap-3 flex flex-col">
          <div className="bg-solidWhite w-full rounded-lg p-5 grid grid-cols-6 items-center">
            <span className="font-semibold text-darkGray text-left">Name</span>
            <span className="font-semibold text-darkGray text-left">
              Product ID
            </span>
            <span className="font-semibold text-darkGray text-left">
              Category
            </span>
            <span className="font-semibold text-darkGray text-left">Price</span>
            <span></span>
            <span></span>
          </div>

          <div className="flex flex-col overflow-y-scroll gap-3">
            {products.map((item, index) => (
              <div
                className="bg-solidWhite w-full rounded-lg p-5 grid grid-cols-6 items-center"
                key={item.ProductID || index}
              >
                <span>{item.ProductName || "N/A"}</span>
                <span>{item.ProductID || "N/A"}</span>
                <span>{item.CategoryName || "N/A"}</span>
                <span>₱{item.Price || "0.00"}</span>
                <PencilSimple
                  size={32}
                  className="cursor-pointer"
                  onClick={() => handleEditClick(item)}
                />
                <TrashSimple
                  size={32}
                  className="cursor-pointer"
                  onClick={() => handleDelete(item.ProductID)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}
    </Layout>
  );
};

export default ProductsPage;
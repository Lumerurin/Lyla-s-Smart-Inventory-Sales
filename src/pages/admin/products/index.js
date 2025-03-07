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

  // const data = {
  //   products: [
  //     { ProductID: 1, ProductName: "Biscoff Cheesecake", CategoryID: 1 },
  //     { ProductID: 2, ProductName: "Funfetti", CategoryID: 1 },
  //     { ProductID: 3, ProductName: "Matcha with Cream Cheese", CategoryID: 1 },
  //     { ProductID: 4, ProductName: "Nutella Blast", CategoryID: 1 },
  //     { ProductID: 5, ProductName: "Oreo Cheesecake", CategoryID: 1 },
  //     { ProductID: 6, ProductName: "Rocky Road", CategoryID: 1 },
  //     { ProductID: 7, ProductName: "Smores 2.0", CategoryID: 1 },
  //     { ProductID: 8, ProductName: "Special Crinkles", CategoryID: 1 },
  //     { ProductID: 9, ProductName: "Brownies", CategoryID: 2 },
  //     { ProductID: 10, ProductName: "Butterscotch", CategoryID: 2 },
  //     { ProductID: 11, ProductName: "Revel Bars", CategoryID: 2 },
  //     { ProductID: 12, ProductName: "Red Velvet Cheesecake", CategoryID: 2 },
  //     { ProductID: 13, ProductName: "Ham and Cheese Empanada", CategoryID: 3 },
  //     {
  //       ProductID: 14,
  //       ProductName: "Small - Korean Cream Cheese Garlic Bread",
  //       CategoryID: 3,
  //     },
  //     {
  //       ProductID: 15,
  //       ProductName: "Medium - Korean Cream Cheese Garlic Bread",
  //       CategoryID: 3,
  //     },
  //     {
  //       ProductID: 16,
  //       ProductName: "Large - Korean Cream Cheese Garlic Bread",
  //       CategoryID: 3,
  //     },
  //   ],
  // };

  const images = {
    products: [
      {
        id: 1,
        img: "/products/BiscoffCheesecake.jpg",
      },
      {
        id: 2,
        img: "/products/Funfetti.jpg",
      },
      {
        id: 1,
        img: "/products/CookieMonster.jpg",
      },
      {
        id: 3,
        img: "/products/HamandCheeseEmpanada.jpg",
      },
      {
        id: 4,
        img: "/products/KoreanCreamCheeseGarlicBread.jpg",
      },
      {
        id: 0,
        img: "/products/KoreanCreamCheeseGarlicBread. jpg",
      },
      {
        id: 3,
        img: "/products/MatchawithCreamCheese.jpg",
      },
      {
        id: 4,
        img: "/products/NutellaBlast.jpg",
      },
      {
        id: 6,
        img: "/products/RockyRoad.jpg",
      },
    ],
  };

  useEffect(() => {
    // Add error handling and loading state
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
        // You might want to add error state handling here
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
          <div className="bg-solidWhite w-full rounded-lg p-5 grid grid-cols-7 items-center">
            <span className="font-semibold text-darkGray text-left">Name</span>
            <span className="font-semibold text-darkGray text-left">
              Product ID
            </span>
            <span className="font-semibold text-darkGray text-left">
              Category
            </span>
            <span className="font-semibold text-darkGray text-left">Price</span>
            <span className="font-semibold text-darkGray text-left">Image</span>
            <span></span>
            <span></span>
          </div>

          <div className="flex flex-col overflow-y-scroll gap-3">
            {products.map((item, index) => {
              const productImage =
                images.products.find((img) => img.id === item.ProductID)?.img ||
                "/products/default.jpg";

              return (
                <div
                  className="bg-solidWhite w-full rounded-lg p-5 grid grid-cols-7 items-center"
                  key={item.ProductID || index}
                >
                  <span>{item.ProductName || "N/A"}</span>
                  <span>{item.ProductID || "N/A"}</span>
                  <span>{item.CategoryName || "N/A"}</span>
                  <span>₱{item.Price || "0.00"}</span>
                  <img
                    src={productImage}
                    className="w-20 h-20 rounded-lg drop-shadow-lg bg-white object-cover"
                    alt={item.ProductName}
                  />
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
              );
            })}
          </div>
          <div className="flex items-center w-full gap-3">
            <div className="bg-blueSerenity border border-blueSerenity  w-[3rem] h-[3rem] items-center justify-center flex rounded-lg hover:cursor-pointer">
              <span className="text-white">1</span>
            </div>
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

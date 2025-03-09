import React, { useState } from "react";
import Layout from "../../layout";
import { CaretLeft } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const NewProduct = () => {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleBackClick = () => {
    navigate('/admin/products'); // Navigate to the products page
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const categoryID = category === "Cookies" ? 1 : category === "Bars" ? 2 : 3;

    const newProduct = {
      name: productName,
      category: categoryID,
      price: parseFloat(price)
    };

    try {
      const response = await fetch('http://localhost:5000/api/products', { // Ensure the URL matches your server's URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });

      if (response.ok) {
        navigate('/admin/products');
      } else {
        console.error('Error adding product:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <Layout>
      <section className="h-full flex flex-col">
        <div className="w-full flex items-center gap-3">
          <div
            className="bg-lightGray p-1 rounded-full hover:scale-110 transition-all duration-150 hover:cursor-pointer"
            onClick={handleBackClick} // Add onClick handler
          >
            <CaretLeft size={25} />
          </div>
          <h1 className="text-blueSerenity py-5">Create New Product</h1>
        </div>

        <h2 className="text-darkerGray">Product Details</h2>
        <form onSubmit={handleSubmit} className="bg-solidWhite flex rounded-lg shadow-lg p-10 h-full flex-col gap-5 last:justify-end">
          <div className="w-full flex flex-col gap-1">
            <label>Product Name</label>
            <input
              placeholder="Enter product name"
              className="w-full text-left pl-3"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="w-full flex flex-col">
            <label>Category</label>
            <select
              className="w-full text-left pl-3"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select category</option>
              <option value="Cookies">Cookies</option>
              <option value="Bars">Bars</option>
              <option value="Breads">Breads</option>
            </select>
          </div>
          <div className="w-full flex flex-col">
            <label>Product Price</label>
            <input
              type="number"
              step="0.01"
              placeholder="Enter price"
              className="w-full text-left pl-3"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="w-full justify-end flex h-full mt-auto">
            <button type="submit" className="self-end">Submit</button>
          </div>
        </form>
      </section>
    </Layout>
  );
};

export default NewProduct;
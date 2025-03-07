import React, { useState } from "react";
import Layout from "../../layout";
import { CaretLeft } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

const NewProduct = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const navigate = useNavigate();

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const categoryID = category === "Cookies" ? 1 : category === "Bars" ? 2 : 3;

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name,
          category: categoryID,
          price
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        navigate('/admin/products'); // Redirect to products page after successful submission
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
          <div className="bg-lightGray p-1 rounded-full hover:scale-110 transition-all duration-150 hover:cursor-pointer" onClick={() => navigate('/admin/products')}>
            <CaretLeft size={25} />
          </div>
          <h1 className="text-blueSerenity py-5">Create New Product</h1>
        </div>

        <h2 className="text-darkerGray">Product Details</h2>
        <form onSubmit={handleSubmit} className="bg-solidWhite flex rounded-lg shadow-lg p-10 h-full flex-col gap-5 last:justify-end">
          <div className="w-full flex flex-col gap-1">
            <label>Product Name</label>
            <input
              placeholder="Enter characters"
              className="w-full text-left pl-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="w-full flex flex-col">
            <label>Category</label>
            <select
              className="w-full text-left pl-3"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="">Select Category</option>
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
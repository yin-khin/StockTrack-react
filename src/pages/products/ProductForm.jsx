import React, { useState } from "react";
import { createProduct, updateProduct } from "../../api/product.api";

const ProductForm = ({ product }) => {
  const [name, setName] = useState(product ? product.name : "");
  const [price, setPrice] = useState(product ? product.price : "");
  const [quantity, setQuantity] = useState(product ? product.quantity : "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (product) {
        // Update existing product
        await updateProduct(product.id, { name, price, quantity });
      } else {
        // Create new product
        await createProduct({ name, price, quantity });
      }
      // Reset form or redirect
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {product ? "Edit Product" : "Add Product"}
      </h2>
      <div className="mb-4">
        <label className="block mb-1">Product Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 p-2 w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border border-gray-300 p-2 w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="border border-gray-300 p-2 w-full"
          required
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        {product ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
};

export default ProductForm;

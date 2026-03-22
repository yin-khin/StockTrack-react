// src/components/common/Table.jsx
import React from 'react';

const Table = ({ data, onDelete, onEdit }) => {
  return (
    <table className="min-w-full border-collapse border border-gray-200">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-300 p-2">ID</th>
          <th className="border border-gray-300 p-2">Name</th>
          <th className="border border-gray-300 p-2">Category ID</th>
          <th className="border border-gray-300 p-2">Brand ID</th>
          <th className="border border-gray-300 p-2">Price</th>
          <th className="border border-gray-300 p-2">Sale Price</th>
          <th className="border border-gray-300 p-2">Quantity</th>
          <th className="border border-gray-300 p-2">Barcode</th>
          <th className="border border-gray-300 p-2">Status</th>
          <th className="border border-gray-300 p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item) => (
            <tr key={item.id}>
              <td className="border border-gray-300 p-2">{item.id}</td>
              <td className="border border-gray-300 p-2">{item.name}</td>
              <td className="border border-gray-300 p-2">{item.category_id}</td>
              <td className="border border-gray-300 p-2">{item.brand_id}</td>
              <td className="border border-gray-300 p-2">{item.price.toFixed(2)}</td>
              <td className="border border-gray-300 p-2">{item.sale_price.toFixed(2)}</td>
              <td className="border border-gray-300 p-2">{item.qty}</td>
              <td className="border border-gray-300 p-2">{item.barcode}</td>
              <td className="border border-gray-300 p-2">{item.status === 1 ? 'Active' : 'Inactive'}</td>
              <td className="border border-gray-300 p-2">
                <button onClick={() => onEdit(item.id)} className="text-blue-600 hover:underline mr-2">
                  Edit
                </button>
                <button onClick={() => onDelete(item.id)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="10" className="border border-gray-300 p-2 text-center">
              No products available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Table;

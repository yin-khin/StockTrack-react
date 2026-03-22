
// src/pages/purchases/ImportForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchPurchaseById,
  createPurchase,
  updatePurchase,
  fetchPurchaseItems,
  createPurchaseItem,
  updatePurchaseItem,
  deletePurchaseItem,
} from "../../api/purchase.api";
import { fetchSuppliers } from "../../api/supplier.api";
import { fetchProducts } from "../../api/product.api";
import { AdminOnly } from "../../utils/permissions";
import { ShieldX } from "lucide-react";
import PurchaseItemForm from "./components/PurchaseItemForm";

const ImportForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [supplierId, setSupplierId] = useState("");
  const [total, setTotal] = useState("");
  const [paid, setPaid] = useState("");
  const [balance, setBalance] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);

  useEffect(() => {
    loadSuppliers();
    loadProducts();
    if (isEditMode) {
      loadPurchase();
    }
  }, [id]);

  // Auto-calculate total from purchase items
  useEffect(() => {
    if (purchaseItems.length > 0) {
      const calculatedTotal = purchaseItems.reduce((sum, item) => {
        const itemTotal = (parseFloat(item.cost_price) || 0) * (parseFloat(item.qty) || 0);
        return sum + itemTotal;
      }, 0);
      setTotal(calculatedTotal.toFixed(2));
    } else {
      setTotal("");
    }
  }, [purchaseItems]);

  // Auto-calculate balance when total or paid changes
  useEffect(() => {
    if (total && paid) {
      const calculatedBalance = parseFloat(total) - parseFloat(paid);
      setBalance(calculatedBalance.toFixed(2));
    } else if (total) {
      setBalance(total);
    } else {
      setBalance("");
    }
  }, [total, paid]);

  // Purchase Items Functions
  const handleAddItem = () => {
    setEditingItemIndex(null);
    setShowItemForm(true);
  };

  const handleEditItem = (index) => {
    setEditingItemIndex(index);
    setShowItemForm(true);
  };

  const handleDeleteItem = async (index) => {
    if (window.confirm("Are you sure you want to delete this purchase item?")) {
      const updatedItems = [...purchaseItems];
      const deletedItem = updatedItems[index];
      updatedItems.splice(index, 1);
      setPurchaseItems(updatedItems);

      // If the item already exists in the database, delete it
      if (deletedItem.id) {
        try {
          await deletePurchaseItem(deletedItem.id);
        } catch (error) {
          console.error("Error deleting purchase item:", error);
          setError("Error deleting purchase item");
          // Revert the deletion if it fails
          updatedItems.splice(index, 0, deletedItem);
          setPurchaseItems(updatedItems);
        }
      }
    }
  };

  const handleSaveItem = (itemData) => {
    if (editingItemIndex !== null && editingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...purchaseItems];
      const originalItem = purchaseItems[editingItemIndex];
      updatedItems[editingItemIndex] = {
        ...updatedItems[editingItemIndex],
        ...itemData,
        originalId: originalItem.originalId || originalItem.id,
      };
      setPurchaseItems(updatedItems);
    } else {
      // Add new item
      setPurchaseItems([
        ...purchaseItems,
        {
          ...itemData,
          id: Date.now(),
          originalId: undefined,
        },
      ]);
    }
    setShowItemForm(false);
    setEditingItemIndex(null);
  };

  const handleCancelItem = () => {
    setShowItemForm(false);
    setEditingItemIndex(null);
  };

  const loadSuppliers = async () => {
    try {
      const data = await fetchSuppliers();
      setSuppliers(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(
        Array.isArray(data) ? data : data?.product || data?.data || []
      );
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const loadPurchase = async () => {
    try {
      setLoading(true);
      const response = await fetchPurchaseById(id);
      const purchase = response?.purchase || response?.data || response;

      if (purchase) {
        setSupplierId(purchase.supplier_id || "");
        setPaid(purchase.paid || "");
        // Don't set total here, it will be calculated from items

        // Load purchase items if they exist
        if (purchase.PurchaseItems) {
          const itemsWithOriginalIds = purchase.PurchaseItems.map((item) => {
            return {
              ...item,
              originalId: item.id,
            };
          });
          setPurchaseItems(itemsWithOriginalIds);
        }
      }
    } catch (error) {
      console.error("Error loading purchase:", error);
      setError("មិនអាចទាញយកព័ត៌មានការទិញបានទេ");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!supplierId) {
      setError("សូមជ្រើសរើសអ្នកផ្គត់ផ្គង់");
      return;
    }

    // Check if there are purchase items
    if (purchaseItems.length === 0) {
      setError("សូមបន្ថែមយ៉ាងហោចណាស់មួយធាតុទំនិញ");
      return;
    }

    try {
      setLoading(true);
      const purchaseData = {
        supplier_id: parseInt(supplierId),
        total: parseFloat(total),
        paid: parseFloat(paid || 0),
        balance: parseFloat(balance || total),
      };

      let savedPurchase;
      if (isEditMode) {
        savedPurchase = await updatePurchase(id, purchaseData);
      } else {
        savedPurchase = await createPurchase(purchaseData);
      }

      // Get the purchase ID
      const purchaseId = isEditMode
        ? parseInt(id)
        : savedPurchase?.data?.purchase?.id || savedPurchase?.purchase?.id;

      // Save purchase items
      for (const item of purchaseItems) {
        const itemData = {
          product_id: item.product_id,
          qty: item.qty,
          cost_price: item.cost_price,
          sale_price: item.sale_price,
          manufacture_date: item.manufacture_date,
          expire_date: item.expire_date,
          purchase_id: purchaseId,
        };

        if (item.originalId) {
          await updatePurchaseItem(item.originalId, itemData);
        } else {
          await createPurchaseItem(itemData);
        }
      }

      navigate("/purchases");
    } catch (error) {
      console.error("Error saving purchase:", error);
      setError(
        error.response?.data?.message || "មានបញ្ហាក្នុងការរក្សាទុកការទិញ"
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate item total
  const calculateItemTotal = (item) => {
    return (parseFloat(item.cost_price) || 0) * (parseFloat(item.qty) || 0);
  };

  return (
    <AdminOnly
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ShieldX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              មិនមានសិទ្ធិចូលប្រើ
            </h3>
            <p className="text-gray-500">
              តែ Admin ប៉ុណ្ណោះដែលអាចគ្រប់គ្រងការទិញបាន
            </p>
          </div>
        </div>
      }
    >
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {isEditMode ? "កែសម្រួលការទិញ" : "បន្ថែមការទិញថ្មី"}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {isEditMode ? "កែសម្រួលព័ត៌មានការទិញ" : "បង្កើតការទិញថ្មី"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Purchase Items Section */}
          <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Purchase Items
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                + Add Item
              </button>
            </div>

            {showItemForm && (
              <PurchaseItemForm
                item={
                  editingItemIndex !== null
                    ? purchaseItems[editingItemIndex]
                    : {}
                }
                onSave={handleSaveItem}
                onCancel={handleCancelItem}
                onDelete={
                  editingItemIndex !== null
                    ? () => handleDeleteItem(editingItemIndex)
                    : undefined
                }
                isEditing={editingItemIndex !== null}
              />
            )}

            {purchaseItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sale Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Manufacture
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expire
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchaseItems.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {products.length === 0
                            ? "Loading..."
                            : products.find(
                                (p) => p.id === Number(item.product_id)
                              )?.name || "Unknown Product"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center font-medium">
                          {item.qty}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          ${parseFloat(item.cost_price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          ${parseFloat(item.sale_price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold text-blue-600">
                          ${calculateItemTotal(item).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.manufacture_date || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.expire_date || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-center">
                          <button
                            onClick={() => handleEditItem(index)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                        Total Amount:
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-green-600">
                        ${total || "0.00"}
                      </td>
                      <td colSpan="3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="font-medium">No purchase items added yet</p>
                <p className="text-sm mt-1">Click "Add Item" to add products to this purchase</p>
              </div>
            )}
          </div>

          {/* Purchase Details Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm p-6 space-y-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Purchase Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  អ្នកផ្គត់ផ្គង់ <span className="text-red-500">*</span>
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                  disabled={loading}
                >
                  <option value="">ជ្រើសរើសអ្នកផ្គត់ផ្គង់</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Total (Auto-calculated, read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  សរុប (ពី Purchase Items)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={total ? `$${parseFloat(total).toFixed(2)}` : "$0.00"}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-700 font-semibold text-lg cursor-not-allowed"
                  />
                  <div className="absolute right-3 top-3 text-sm text-gray-500">
                    Auto-calculated
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  សរុប = ផលបូក (Qty × Cost Price) គ្រប់ធាតុទំនិញ
                </p>
              </div>

              {/* Paid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  បានបង់
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paid}
                    onChange={(e) => setPaid(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    disabled={loading}
                  />
                  <span className="absolute left-3 top-3.5 text-gray-500">
                    $
                  </span>
                </div>
              </div>

              {/* Balance (Auto-calculated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  បំណុល
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={balance ? `$${parseFloat(balance).toFixed(2)}` : "$0.00"}
                    readOnly
                    className={`w-full border border-gray-300 rounded-lg p-3 font-semibold ${
                      parseFloat(balance) > 0
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                    } cursor-not-allowed`}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  បំណុល = សរុប - បានបង់
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate("/purchases")}
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium transition duration-200 text-center disabled:opacity-50"
                disabled={loading}
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition duration-200 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || purchaseItems.length === 0}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    កំពុងរក្សាទុក...
                  </span>
                ) : isEditMode ? (
                  "រក្សាទុកការកែសម្រួល"
                ) : (
                  "បន្ថែមការទិញ"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminOnly>
  );
};

export default ImportForm;
import React, { useState, useEffect } from "react";
import {
  getSalesReport,
  exportSalesReportExcel,
  exportSalesReportPDF,
  downloadFile,
} from "../../api/report.api";
import { fetchCustomers } from "../../api/customer.api";
import { AdminOnly } from "../../utils/permissions";
import {
  TrendingUp,
  Calendar,
  Filter,
  Download,
  FileSpreadsheet,
  FilePlus,
  Search,
  RefreshCw,
  X,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  Users,
  BarChart3,
  Printer,
  Store,
  Tag,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

const SaleReport = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [generalSearch, setGeneralSearch] = useState("");
  const [customerNameSearch, setCustomerNameSearch] = useState("");
  const [productNameSearch, setProductNameSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");

  const [exporting, setExporting] = useState(false);
  const [selectedSales, setSelectedSales] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredSales, setFilteredSales] = useState([]);

  // Shop Info
  const [shopInfo, setShopInfo] = useState({
    name: "SE SHOP",
    address: "RUPP Phnom Penh",
    phone: "04433222",
    email: "rupp2026@gmail.com",
  });

  useEffect(() => {
    const saved = localStorage.getItem("shopInfo");
    if (saved) setShopInfo(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("shopInfo", JSON.stringify(shopInfo));
  }, [shopInfo]);

  useEffect(() => {
    fetchCustomersList();
    loadReport();
  }, []);

  useEffect(() => {
    // Update pagination when filtered sales change
    const total = filteredSales.length;
    setTotalItems(total);
    setTotalPages(Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)));

    // Reset to page 1 if current page is invalid
    if (currentPage > Math.ceil(total / ITEMS_PER_PAGE) && total > 0) {
      setCurrentPage(1);
    }
  }, [filteredSales, currentPage]);

  const fetchCustomersList = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        customerId: customerId || undefined,
      };

      const response = await getSalesReport(params);
      let salesData = response?.data || response || [];
      salesData = Array.isArray(salesData) ? salesData : [];

      // Advanced local filtering
      const filtered = salesData.filter((sale) => {
        const customerName = (sale.Customer?.name || "Walk-in").toLowerCase();
        const hasProduct = sale.SaleItems?.some((item) =>
          (item.Product?.name || "")
            .toLowerCase()
            .includes(productNameSearch.toLowerCase()),
        );

        const saleDate = new Date(sale.sale_date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (end) end.setHours(23, 59, 59, 999);

        const statusMatch =
          paymentStatus === "all" ||
          (paymentStatus === "paid" && Number(sale.balance || 0) === 0) ||
          (paymentStatus === "owing" && Number(sale.balance || 0) > 0);

        return (
          (!generalSearch ||
            sale.id.toString().includes(generalSearch) ||
            Number(sale.total || 0)
              .toString()
              .includes(generalSearch)) &&
          (!customerNameSearch ||
            customerName.includes(customerNameSearch.toLowerCase())) &&
          (!productNameSearch || hasProduct) &&
          (!start || saleDate >= start) &&
          (!end || saleDate <= end) &&
          statusMatch
        );
      });

      setSales(salesData);
      setFilteredSales(filtered);
    } catch (error) {
      console.error("Error loading sales report:", error);
      setError("មិនអាចទាញយករបាយការណ៍លក់បានទេ");
      setSales([]);
      setFilteredSales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadReport();
  };

  const handleReset = () => {
    setGeneralSearch("");
    setCustomerNameSearch("");
    setProductNameSearch("");
    setStartDate("");
    setEndDate("");
    setCustomerId("");
    setPaymentStatus("all");
    setSelectedSales({});
    setCurrentPage(1);
    setTimeout(loadReport, 100);
  };

  // Export Excel
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = { startDate, endDate, customerId };
      const blob = await exportSalesReportExcel(params);
      downloadFile(
        blob,
        `sales_report_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
    } catch (err) {
      setError("មិនអាចបង្កើតឯកសារ Excel បានទេ");
    } finally {
      setExporting(false);
    }
  };

  // Export PDF
  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const params = { startDate, endDate, customerId };
      const blob = await exportSalesReportPDF(params);
      downloadFile(
        blob,
        `sales_report_${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } catch (err) {
      setError("មិនអាចបង្កើតឯកសារ PDF បានទេ");
    } finally {
      setExporting(false);
    }
  };

  // Checkbox handlers
  const handleCheckboxChange = (saleId) => {
    setSelectedSales((prev) => ({
      ...prev,
      [saleId]: !prev[saleId],
    }));
  };

  const handleClearCheckboxes = () => setSelectedSales({});

  // Pagination functions
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageButtons = () => {
    const pages = [];
    const maxButtons = 7;

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    const left = Math.max(1, currentPage - 1);
    const right = Math.min(totalPages, currentPage + 1);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) {
      if (i !== 1 && i !== totalPages) pages.push(i);
    }
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredSales.slice(startIndex, endIndex);
  };

  // Improved Print Invoice with detailed product list
  const handlePrintInvoice = () => {
    const selected = sales.filter((sale) => selectedSales[sale.id]);

    if (selected.length === 0) {
      alert("សូមជ្រើសរើសវិក័យប័ត្រដើម្បីបោះពុម្ព!");
      return;
    }

    let customerName = "Walk-in Customer";
    if (selected.length > 0) {
      const first = selected[0].Customer?.name;
      if (first && selected.every((s) => s.Customer?.name === first)) {
        customerName = first;
      } else {
        customerName = "អតិថិជនផ្សេងៗ";
      }
    }

    const currentDate = new Date().toLocaleDateString("km-KH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const invoiceNum = `INV-${Date.now().toString().slice(-8)}`;

    const grandTotals = {
      subtotal: selected.reduce(
        (sum, s) => sum + (Number(s.total || 0) + Number(s.discount || 0)),
        0,
      ),
      discount: selected.reduce((sum, s) => sum + Number(s.discount || 0), 0),
      paid: selected.reduce((sum, s) => sum + Number(s.paid || 0), 0),
      balance: selected.reduce((sum, s) => sum + Number(s.balance || 0), 0),
    };
    const netTotal = grandTotals.subtotal - grandTotals.discount;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>វិក័យប័ត្រ - ${currentDate}</title>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Kantumruy Pro', sans-serif; margin: 0; padding: 30px; background: #f8f9fa; color: #333; }
            .invoice { max-width: 1100px; margin: auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            h1 { color: #d35400; text-align: center; font-size: 2.8rem; margin-bottom: 10px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 1.1rem; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; font-size: 1rem; }
            th, td { padding: 14px 12px; border-bottom: 1px solid #e0e0e0; }
            th { background: #fff3e0; color: #d35400; font-weight: 700; text-align: center; }
            td.product-name { text-align: left; font-weight: 500; }
            .total-section { margin-top: 30px; padding-top: 20px; border-top: 3px solid #d35400; }
            .total-row { display: flex; justify-content: space-between; margin: 12px 0; font-size: 1.2rem; }
            .grand-total { font-size: 1.6rem; font-weight: bold; color: #d35400; border-top: 2px solid #d35400; padding-top: 15px; margin-top: 15px; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 1rem; }
            @media print {
              .no-print { display: none !important; }
              .invoice { box-shadow: none; margin: 0; padding: 20px; }
              body { background: white; }
            }
          </style>
        </head>
        <body>
          <div class="invoice">
            <h1>វិក័យប័ត្រ</h1>
            <strong>ចេញពី</strong><br>
           
            <div class="meta">
              <div>
                <strong>ហាង: ${shopInfo.name || "ហាងរបស់ខ្ញុំ"}</strong><br>
                address : ${shopInfo.address || ""}<br>
                ទូរស័ព្ទ: ${shopInfo.phone || ""}<br>
                Email: ${shopInfo.email || ""}
              </div>
              <div style="text-align:right">
                <strong>ទៅ</strong><br>
                ${customerName}<br>
                លេខវិក័យប័ត្រ: ${invoiceNum}<br>
                កាលបរិច្ឆេទ: ${currentDate}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>ល.រ</th>
                  <th style="text-align:left">ផលិតផល</th>
                  <th>ចំនួន</th>
                  <th>តម្លៃឯកតា</th>
                  <th>សរុប</th>
                </tr>
              </thead>
              <tbody>
                ${selected
                  .map((sale, saleIndex) => {
                    const items = sale.SaleItems || [];
                    return items
                      .map(
                        (item, itemIndex) => `
                        <tr>
                          <td>${saleIndex + 1}.${itemIndex + 1}</td>
                          <td class="product-name">${item.Product?.name || "គ្មានឈ្មោះ"}</td>
                          <td>${item.quantity || 1}</td>
                          <td>$${Number(item.unit_price || 0).toFixed(2)}</td>
                          <td>$${(item.quantity * Number(item.unit_price || 0)).toFixed(2)}</td>
                        </tr>
                      `,
                      )
                      .join("");
                  })
                  .join("")}
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-row">
                <span>សរុបមុនបញ្ចុះតម្លៃ</span>
                <strong>$${grandTotals.subtotal.toFixed(2)}</strong>
              </div>
              <div class="total-row">
                <span>បញ្ចុះតម្លៃសរុប</span>
                <strong>-$${grandTotals.discount.toFixed(2)}</strong>
              </div>
              <div class="grand-total">
                <span>សរុបត្រូវបង់</span>
                <strong>$${netTotal.toFixed(2)}</strong>
              </div>
              <div class="total-row" style="margin-top:20px">
                <span>បានបង់រួច</span>
                <strong>$${grandTotals.paid.toFixed(2)}</strong>
              </div>
              <div class="total-row">
                <span>នៅសល់ត្រូវបង់</span>
                <strong>$${grandTotals.balance.toFixed(2)}</strong>
              </div>
            </div>

            <div class="footer">
              សូមអរគុណសម្រាប់ការទិញទំនិញជាមួយយើងខ្ញុំ!<br>
              សូមមកម្តងទៀត!
            </div>
          </div>

          <button class="no-print" onclick="window.print()" style="display:block;margin:40px auto;padding:14px 50px;background:#d35400;color:white;border:none;border-radius:8px;font-size:18px;font-weight:bold;cursor:pointer">
            បោះពុម្ពឥឡូវនេះ
          </button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalSales = filteredSales.reduce(
      (sum, s) => sum + Number(s.total || 0),
      0,
    );
    const totalPaid = filteredSales.reduce(
      (sum, s) => sum + Number(s.paid || 0),
      0,
    );
    const totalBalance = filteredSales.reduce(
      (sum, s) => sum + Number(s.balance || 0),
      0,
    );
    const totalDiscount = filteredSales.reduce(
      (sum, s) => sum + Number(s.discount || 0),
      0,
    );

    const owingCount = filteredSales.filter(
      (s) => Number(s.balance || 0) > 0,
    ).length;
    const paidCount = filteredSales.filter(
      (s) => Number(s.balance || 0) === 0,
    ).length;

    return {
      totalSales,
      totalPaid,
      totalBalance,
      totalDiscount,
      owingCount,
      paidCount,
      count: filteredSales.length,
    };
  }, [filteredSales]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">របាយការណ៍លក់</h1>
              <p className="text-gray-600 text-sm">
                វិភាគនិងត្រួតពិនិត្យការលក់ទាំងអស់
              </p>
            </div>
          </div>
        </div>

        {/* Shop Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              ព័ត៌មានហាងសម្រាប់វិក័យប័ត្រ
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ឈ្មោះហាង
              </label>
              <input
                type="text"
                value={shopInfo.name}
                onChange={(e) =>
                  setShopInfo({ ...shopInfo, name: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                អាសយដ្ឋាន
              </label>
              <input
                type="text"
                value={shopInfo.address}
                onChange={(e) =>
                  setShopInfo({ ...shopInfo, address: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ទូរស័ព្ទ
              </label>
              <input
                type="text"
                value={shopInfo.phone}
                onChange={(e) =>
                  setShopInfo({ ...shopInfo, phone: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={shopInfo.email}
                onChange={(e) =>
                  setShopInfo({ ...shopInfo, email: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-cyan-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ចំណូលសរុប</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalSales.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.count} ការលក់
                </p>
              </div>
              <div className="h-12 w-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">បានបង់</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalPaid.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.totalPaid / stats.totalSales) * 100 || 0).toFixed(1)}
                  %
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">នៅជំពាក់</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalBalance.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.owingCount} ការលក់
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">បញ្ចុះតម្លៃ</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalDiscount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">សរុបបញ្ចុះ</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Tag className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              តម្រងរបាយការណ៍
            </h3>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  ឈ្មោះអតិថិជន
                </label>
                <input
                  type="text"
                  placeholder="ស្វែងរកឈ្មោះ..."
                  value={customerNameSearch}
                  onChange={(e) => setCustomerNameSearch(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  ពីថ្ងៃ
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  ដល់ថ្ងៃ
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ស្ថានភាពទូទាត់
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                >
                  <option value="all">ទាំងអស់</option>
                  <option value="paid">បានបង់ពេញ</option>
                  <option value="owing">នៅជំពាក់</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all"
              >
                <X className="h-5 w-5" />
                សម្អាត
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg disabled:opacity-50"
              >
                <Search className="h-5 w-5" />
                {loading ? "កំពុងស្វែងរក..." : "ស្វែងរក"}
              </button>

              <div className="flex-1"></div>

              <AdminOnly>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={exporting || loading || filteredSales.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-50 flex items-center gap-2 transition-all shadow-md"
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  Excel
                </button>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={exporting || loading || filteredSales.length === 0}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-50 flex items-center gap-2 transition-all shadow-md"
                >
                  <FilePlus className="h-5 w-5" />
                  PDF
                </button>
              </AdminOnly>
            </div>
          </form>
        </div>

        {/* Invoice Actions */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            បានជ្រើសរើស{" "}
            <span className="font-bold text-cyan-600">
              {Object.keys(selectedSales).length}
            </span>{" "}
            ការលក់
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClearCheckboxes}
              className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              CLEAR
            </button>
            <button
              onClick={handlePrintInvoice}
              disabled={Object.keys(selectedSales).length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
            >
              <Printer className="h-4 w-4" />
              INVOICE ({Object.keys(selectedSales).length})
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">
              កំពុងទាញយកទិន្នន័យ...
            </p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              គ្មានទិន្នន័យទេ
            </h3>
            <p className="text-gray-600">គ្មានទិន្នន័យសម្រាប់តម្រងនេះទេ</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="w-10 px-4 py-4"></th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ថ្ងៃខែ
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      អតិថិជន
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ផលិតផល
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ចំនួន
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      តម្លៃឯកតា
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      សរុបផលិតផល
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      បញ្ចុះតម្លៃ
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      សរុប
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      បានបង់
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      បំណុល
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {getCurrentPageItems().map((sale, saleIdx) => {
                    const saleItems = sale.SaleItems || [];
                    const rowSpan = saleItems.length || 1;

                    return saleItems.length > 0 ? (
                      saleItems.map((item, itemIndex) => (
                        <tr
                          key={`${sale.id}-${itemIndex}`}
                          className={`hover:bg-cyan-50 transition-colors ${
                            saleIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          {itemIndex === 0 && (
                            <>
                              <td
                                className="px-4 py-4 text-center"
                                rowSpan={rowSpan}
                              >
                                <input
                                  type="checkbox"
                                  checked={!!selectedSales[sale.id]}
                                  onChange={() => handleCheckboxChange(sale.id)}
                                  className="h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500"
                                />
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-center"
                                rowSpan={rowSpan}
                              >
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-700 font-medium">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {new Date(sale.sale_date).toLocaleDateString(
                                    "km-KH",
                                  )}
                                </div>
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-center"
                                rowSpan={rowSpan}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <div className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {(sale.Customer?.name || "W").charAt(0)}
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">
                                    {sale.Customer?.name || "Walk-in"}
                                  </span>
                                </div>
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            {item.Product?.name || "គ្មានឈ្មោះ"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                              {item.quantity || 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            ${Number(item.unit_price || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-cyan-700">
                            $
                            {(
                              item.quantity * Number(item.unit_price || 0)
                            ).toFixed(2)}
                          </td>
                          {itemIndex === 0 && (
                            <>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-center text-sm text-yellow-600 font-medium"
                                rowSpan={rowSpan}
                              >
                                ${Number(sale.discount || 0).toFixed(2)}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900"
                                rowSpan={rowSpan}
                              >
                                ${Number(sale.total || 0).toFixed(2)}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-semibold"
                                rowSpan={rowSpan}
                              >
                                ${Number(sale.paid || 0).toFixed(2)}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-center"
                                rowSpan={rowSpan}
                              >
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${
                                    Number(sale.balance || 0) > 0
                                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                                      : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                  }`}
                                >
                                  ${Number(sale.balance || 0).toFixed(2)}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr
                        key={sale.id}
                        className={`hover:bg-cyan-50 transition-colors ${
                          saleIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={!!selectedSales[sale.id]}
                            onChange={() => handleCheckboxChange(sale.id)}
                            className="h-5 w-5 text-cyan-600 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-700 font-medium">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(sale.sale_date).toLocaleDateString(
                              "km-KH",
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-gray-900">
                            {sale.Customer?.name || "Walk-in"}
                          </span>
                        </td>
                        <td
                          colSpan="4"
                          className="px-6 py-4 text-center text-sm text-gray-400"
                        >
                          គ្មានផលិតផល
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-yellow-600">
                          ${Number(sale.discount || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold">
                          ${Number(sale.total || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600">
                          ${Number(sale.paid || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${
                              Number(sale.balance || 0) > 0
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            ${Number(sale.balance || 0).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t bg-gradient-to-r from-gray-50 to-gray-100 gap-3">
                <div className="text-sm text-gray-700 font-medium">
                  បង្ហាញ{" "}
                  <span className="font-bold text-cyan-600">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                  </span>{" "}
                  នៃ{" "}
                  <span className="font-bold text-cyan-600">{totalItems}</span>{" "}
                  ការលក់
                </div>

                <nav className="flex items-center gap-1 flex-wrap justify-center">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    « ដើម
                  </button>

                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    មុន
                  </button>

                  {renderPageButtons().map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`dots-${idx}`}
                        className="px-2 text-gray-500 font-bold"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                          currentPage === p
                            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-600 shadow-lg"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-600"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    បន្ទាប់
                  </button>

                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    ចុង »
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleReport;

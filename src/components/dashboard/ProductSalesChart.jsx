

// src/components/dashboard/ProductSalesChart.jsx
import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { TrendingUp, Award, AlertCircle } from "lucide-react";

const PERFORMANCE_CONFIG = {
  high: {
    color: "#10b981",
    gradient: ["#10b981", "#059669"],
    label: "High Performance",
    icon: "🔥",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  medium: {
    color: "#f59e0b",
    gradient: ["#f59e0b", "#d97706"],
    label: "Medium Performance",
    icon: "⚡",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  low: {
    color: "#ef4444",
    gradient: ["#ef4444", "#dc2626"],
    label: "Low Performance",
    icon: "📊",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
};

const shortName = (name = "", max = 15) =>
  name.length > max ? name.slice(0, max) + "..." : name;

const ProductSalesChart = ({ data = [] }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const chartData = useMemo(() => {
    const normalized = (Array.isArray(data) ? data : []).map((item) => ({
      name: item.productName || item.name || "Unknown Product",
      sales: Number(item.totalSales || item.sales || 0),
      performance: item.performance || "low",
      revenue: Number(item.revenue || 0),
    }));

    // Sort by sales descending and take top 10
    return normalized.sort((a, b) => b.sales - a.sales).slice(0, 10);
  }, [data]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0);
    const avgSales = chartData.length > 0 ? totalSales / chartData.length : 0;
    const topProduct = chartData[0] || null;
    const highPerformance = chartData.filter((item) => item.performance === "high").length;

    return { totalSales, avgSales, topProduct, highPerformance };
  }, [chartData]);

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border-2 border-dashed border-slate-300">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-slate-700 font-bold text-lg">No Sales Data Available</p>
            <p className="text-sm text-slate-500 mt-2">Start selling products to see analytics</p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    const config = PERFORMANCE_CONFIG[data.performance] || PERFORMANCE_CONFIG.low;

    return (
      <div className="bg-white px-5 py-4 rounded-xl shadow-2xl ring-1 ring-slate-200 space-y-3 min-w-[200px] transform transition-all">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <span className="text-2xl">{config.icon}</span>
          <p className="font-bold text-slate-900 text-sm">{data.name}</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Sales Volume</span>
            <span className="font-extrabold text-lg text-slate-900">{data.sales}</span>
          </div>
          
          {data.revenue > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Revenue</span>
              <span className="font-bold text-emerald-600">${data.revenue.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-sm text-slate-600">Performance</span>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full capitalize ${config.bgColor} ${config.textColor}`}
            >
              {config.icon} {data.performance}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const maxSales = Math.max(...chartData.map((item) => item.sales), 50);
  const yAxisMax = Math.ceil(maxSales / 10) * 10;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-medium text-blue-700">Total Sales</p>
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.totalSales}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <Award className="h-4 w-4 text-emerald-600" />
            <p className="text-xs font-medium text-emerald-700">Top Product</p>
          </div>
          <p className="text-sm font-bold text-emerald-900 truncate">
            {stats.topProduct ? shortName(stats.topProduct.name, 12) : "N/A"}
          </p>
        </div>

       {/* <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-xs font-medium text-purple-700">Avg Sales</p>
          </div>
          <p className="text-2xl font-bold text-purple-900">{Math.round(stats.avgSales)}</p>
        </div>  */}

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <p className="text-xs font-medium text-amber-700">Top Performers</p>
          </div>
          <p className="text-2xl font-bold text-amber-900">{stats.highPerformance}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-50 to-white p-4 border border-slate-200">
        <div className="h-[440px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              onMouseMove={(state) => {
                if (state.isTooltipActive) {
                  setActiveIndex(state.activeTooltipIndex);
                } else {
                  setActiveIndex(null);
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                {Object.entries(PERFORMANCE_CONFIG).map(([key, config]) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={config.gradient[0]} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={config.gradient[1]} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
                strokeOpacity={0.5}
              />
              
              <XAxis
                dataKey="name"
                tickFormatter={(v) => shortName(v, 10)}
                tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
                height={60}
                angle={-15}
                textAnchor="end"
              />
              
              <YAxis
                domain={[0, yAxisMax]}
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
                allowDecimals={false}
                label={{ 
                  value: 'Sales Volume', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 12, fill: '#64748b', fontWeight: 600 }
                }}
              />
              
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(99, 102, 241, 0.05)", radius: 8 }}
              />
              
              <Bar
                dataKey="sales"
                radius={[10, 10, 0, 0]}
                maxBarSize={65}
                animationDuration={800}
                animationBegin={0}
              >
                {chartData.map((entry, index) => {
                  const config = PERFORMANCE_CONFIG[entry.performance] || PERFORMANCE_CONFIG.low;
                  const isActive = activeIndex === index;
                  
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-${entry.performance})`}
                      opacity={isActive ? 1 : 0.85}
                      style={{
                        filter: isActive ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  );
                })}
                <LabelList
                  dataKey="sales"
                  position="top"
                  style={{ fontSize: 11, fontWeight: 'bold', fill: '#334155' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(PERFORMANCE_CONFIG).map(([key, config]) => {
          const count = chartData.filter((item) => item.performance === key).length;
          
          return (
            <div
              key={key}
              className={`flex items-center justify-between rounded-xl border-2 ${config.borderColor} ${config.bgColor} px-4 py-3 transition-all hover:shadow-md`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <p className={`text-xs font-semibold ${config.textColor}`}>
                    {config.label}
                  </p>
                  <p className="text-lg font-bold text-slate-900">{count}</p>
                </div>
              </div>
              <div
                className="h-3 w-3 rounded-full shadow-sm"
                style={{ backgroundColor: config.color }}
              />
            </div>
          );
        })}
      </div>

      {/* Top 3 Products */}
      {chartData.length >= 3 && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-200">
          <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
            <Award className="h-4 w-4" />
            🏆 Top 3 Best Sellers
          </h3>
          <div className="space-y-2">
            {chartData.slice(0, 3).map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-indigo-100"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{shortName(product.name, 20)}</p>
                    <p className="text-xs text-slate-500">{product.sales} units sold</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${PERFORMANCE_CONFIG[product.performance].bgColor} ${PERFORMANCE_CONFIG[product.performance].textColor}`}>
                  {PERFORMANCE_CONFIG[product.performance].icon}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSalesChart;
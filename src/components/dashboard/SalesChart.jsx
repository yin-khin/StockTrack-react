// src/components/dashboard/SalesChart.jsx
import React from 'react';

const SalesChart = () => {
  // Simple bar chart representation
  const data = [
    { month: 'Jan', sales: 12000 },
    { month: 'Feb', sales: 19000 },
    { month: 'Mar', sales: 15000 },
    { month: 'Apr', sales: 22000 },
    { month: 'May', sales: 18000 },{ month: 'Jun', sales: 25000 },
    
  ];

  const maxSales = Math.max(...data.map(d => d.sales));

  return (
    <div className="h-64 flex items-end justify-between space-x-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg hover:from-blue-600 hover:to-blue-400 transition-all cursor-pointer"
              style={{ height: `${(item.sales / maxSales) * 100}%` }}
              title={`${item.month}: $${item.sales.toLocaleString()}`}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">{item.month}</p>
        </div>
      ))}
    </div>
  );
};

export default SalesChart;

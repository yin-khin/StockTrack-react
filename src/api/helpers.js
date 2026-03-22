// src/api/helpers.js
export const unwrapList = (res) => {
  // support: {data:[]}, {product:[]}, {brand:[]}, {category:[]}
  if (!res) return [];
  if (Array.isArray(res)) return res;

  return (
    res.data ||
    res.product ||
    res.products ||
    res.brand ||
    res.brands ||
    res.category ||
    res.categories ||
    res.sales ||
    res.payments ||
    []
  );
};

export const unwrapObject = (res) => {
  if (!res) return null;
  if (res.data) return res.data;
  if (res.product) return res.product;
  return res;
};

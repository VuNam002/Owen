module.exports.calcNewPrice = (products) => {
  const newProducts = products.map((item) => {
    // Create a plain product object to avoid modifying the mongoose doc directly
    const productObject = item.toObject ? item.toObject() : { ...item };

    // Ensure original price and discount percentage are valid numbers
    const originalPrice = Number(productObject.price) || 0;
    const discountPercent = Number(productObject.discountPercentage) || 0;

    // Calculate the new price
    const newPrice = originalPrice * (1 - discountPercent / 100);

    // Assign the original price to 'price'
    productObject.price = originalPrice;
    
    // Assign the calculated discounted price to 'priceNew'
    productObject.priceNew = Math.round(newPrice);

    return productObject;
  });
  return newProducts;
};
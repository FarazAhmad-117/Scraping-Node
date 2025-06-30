const products = require("./utils/products-data.json");
const fs = require("fs");

const main = () => {
  const outputProducts = [];

  for (const product of products) {
    const price = parseFloat(product?.price?.replace(/\$|,/g, "") ?? "0");
    outputProducts.push({
      ...product,
      price: price,
    });
  }

  fs.writeFileSync(
    "./products-data.json",
    JSON.stringify(outputProducts, null, 2)
  );
};

main();

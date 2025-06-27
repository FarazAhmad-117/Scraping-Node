const CategoryUrlsExtractor = require("./utils/CategoryUrlsExtractor");
const ProductUrlsExtractor = require("./utils/ProductUrlsExtractor");
const puppeteer = require("puppeteer");
const fs = require("fs");

const CATEGORY_BASE_URL = "https://directcartoys.com/";

const main = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const categoryUrlsExtractor = new CategoryUrlsExtractor(page);
  const productUrlsExtractor = new ProductUrlsExtractor(page);

  try {
    const categories = await categoryUrlsExtractor.extractCategoryUrls(
      CATEGORY_BASE_URL
    );

    console.log(`Found ${categories.length} categories`);

    // Step 2: Extract products from each category
    const allProducts = [];

    for (const [index, category] of categories.entries()) {
      console.log(
        `Processing category ${index + 1}/${categories.length}: ${
          category.name
        }`
      );

      try {
        const products = await productUrlsExtractor.extractProductUrls(
          category.url
        );

        console.log(`Found ${products.length} products in ${category.name}`);
        allProducts.push(...products);
      } catch (error) {
        console.error(`Failed to process category ${category.name}:`, error);
      }

      // Optional: Add delay between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const uniqueProducts = [...new Set(allProducts)];
    fs.writeFileSync(
      "products-urls.json",
      JSON.stringify(uniqueProducts, null, 2)
    );
    console.log(
      `Total ${uniqueProducts.length} unique products saved to products-urls.json`
    );
  } catch (error) {
    console.error("Scraping failed:", error);
  } finally {
    await browser.close();
  }
};

(async () => {
  await main();
})();

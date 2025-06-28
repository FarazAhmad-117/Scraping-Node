const puppeteer = require("puppeteer");
const ProductDataExtractor = require("./utils/ProductDataExtractor");
const productUrls = require("./errored-urls.json");

const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Configure page
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  const extractor = new ProductDataExtractor(page);
  const errorProducts = [];

  //   // Testing
  //   const testProductUrl = productUrls[0].url;
  //   const testProductData = await extractor.extractProductData(testProductUrl);
  //   console.log(testProductData);
  //   return;

  for (const [index, productUrl] of productUrls.entries()) {
    try {
      console.log(
        `Processing product ${index + 1}/${productUrls.length}: ${productUrl}`
      );

      const productData = await extractor.extractProductData(
        productUrl.url || productUrl
      );

      if (productData) {
        extractor.appendProductData(productData);
        console.log(`✅ Successfully processed: ${productData.title}`);
      } else {
        throw new Error("Product data extraction returned null");
      }

      // Add delay between requests (1-3 seconds)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );
    } catch (error) {
      console.error(`❌ Failed to process: ${productUrl}`);
      errorProducts.push({
        url: productUrl,
        error: error.message,
      });
      extractor.appendErrorProduct(productUrl, error.message);
    }
  }

  if (errorProducts.length > 0) {
    console.log(
      `\nCompleted with ${errorProducts.length} errors. See error-products.json for details.`
    );
  } else {
    console.log("\nAll products processed successfully!");
  }

  await browser.close();
};

(() => {
  main();
})();

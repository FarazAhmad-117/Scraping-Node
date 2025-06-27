const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

class ProductDataExtractor {
  constructor(page) {
    this.page = page;
    this.dataFilePath = path.join(__dirname, "products-data.json");
    this.errorFilePath = path.join(__dirname, "error-products.json");
    this.initializeFiles();
  }

  initializeFiles() {
    // Create empty products data file if it doesn't exist
    if (!fs.existsSync(this.dataFilePath)) {
      fs.writeFileSync(this.dataFilePath, JSON.stringify([], null, 2));
    }

    // Create empty error products file if it doesn't exist
    if (!fs.existsSync(this.errorFilePath)) {
      fs.writeFileSync(this.errorFilePath, JSON.stringify([], null, 2));
    }
  }

  async extractProductData(productUrl) {
    try {
      await this.page.goto(productUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });
      const html = await this.page.content();
      const $ = cheerio.load(html);

      const title = $("div.product-essential div.product-name h1")
        .text()
        .trim();

      const availability = $("p.availability span").text().trim();
      const price = $("div.price-box span.regular-price span.price")
        .text()
        .trim();
      const paintedPrice = $("table#myOptions tr.painted td.price")
        ?.text()
        ?.trim();
      const unpaintedPrice = $("table#myOptions tr.unpainted td.price")
        ?.text()
        ?.trim();

      const sku = $("div.mySKU")?.text()?.trim()?.split("SKU: ")?.[1];

      const images = $("ul.thumbnails li a")
        .map((i, img) => $(img).attr("href"))
        .get();

      const description = $("div#description").html();

      const productData = {
        title: title,
        price: price,
        paintedPrice: paintedPrice,
        unpaintedPrice: unpaintedPrice,
        sku: sku,
        images: images,
        description: description,
        availability: availability,
        productUrl: productUrl,
        scrapedAt: new Date().toISOString(),
      };

      if (!productData.title) {
        throw new Error("No product title found - possible page load issue");
      }

      return productData;
    } catch (error) {
      console.error(`Error extracting product data from ${productUrl}:`, error);
      throw error;
    }
  }

  appendProductData(productData) {
    try {
      const currentData = JSON.parse(fs.readFileSync(this.dataFilePath));
      currentData.push(productData);
      fs.writeFileSync(this.dataFilePath, JSON.stringify(currentData, null, 2));
    } catch (error) {
      console.error("Error writing product data:", error);
    }
  }

  appendErrorProduct(productUrl, errorMessage) {
    try {
      const currentErrors = JSON.parse(fs.readFileSync(this.errorFilePath));
      currentErrors.push({
        productUrl,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
      fs.writeFileSync(
        this.errorFilePath,
        JSON.stringify(currentErrors, null, 2)
      );
    } catch (error) {
      console.error("Error writing error data:", error);
    }
  }
}

module.exports = ProductDataExtractor;

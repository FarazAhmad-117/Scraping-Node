const cheerio = require("cheerio");

class ProductUrlsExtractor {
  constructor(page) {
    this.page = page;
  }

  async extractProductUrls(categoryUrl, options = {}) {
    const {
      productLinkSelector = "div.product-info-col h2.product-name a",
      productNameSelector,
      resolveRelativeUrls = true,
    } = options;

    try {
      // Navigate to the category URL
      await this.page.goto(categoryUrl, { waitUntil: "networkidle2" });

      // Get page content
      const html = await this.page.content();
      const $ = cheerio.load(html);
      const products = [];
      const uniqueUrls = new Set(); // To ensure uniqueness

      $(productLinkSelector).each((index, element) => {
        const $element = $(element);
        const url = $element.attr("href");
        let title = "";

        // Get product name either from specified selector or link text
        if (productNameSelector) {
          title = $element.find(productNameSelector).text().trim();
        } else {
          title = $element.text().trim();
        }

        if (url && !uniqueUrls.has(url)) {
          // Resolve relative URLs if needed
          const resolvedUrl =
            resolveRelativeUrls && !url.startsWith("http")
              ? new URL(url, categoryUrl).href
              : url;

          products.push({
            title: title || `Product ${index + 1}`,
            url: resolvedUrl,
          });
          uniqueUrls.add(url);
        }
      });

      return products;
    } catch (error) {
      console.error(`Error extracting products from ${categoryUrl}:`, error);
      throw error;
    }
  }
}

module.exports = ProductUrlsExtractor;

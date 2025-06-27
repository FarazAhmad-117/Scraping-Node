const cheerio = require("cheerio");

class CategoryUrlsExtractor {
  constructor(page) {
    this.page = page;
  }

  async extractCategoryUrls(baseUrl, options = {}) {
    const {
      categoryLinkSelector = "li.LI1 a",
      categoryNameSelector,
      resolveRelativeUrls = true,
    } = options;

    try {
      // Navigate to the base URL
      await this.page.goto(baseUrl, { waitUntil: "networkidle2" });

      // Get page content
      const html = await this.page.content();
      const $ = cheerio.load(html);

      const categories = [];

      $(categoryLinkSelector).each((index, element) => {
        const $element = $(element);
        const url = $element.attr("href");
        let name = "";
        if (categoryNameSelector) {
          name = $element.find(categoryNameSelector).text().trim();
        } else {
          name = $element.text().trim();
        }
        if (url) {
          // Resolve relative URLs if needed
          const resolvedUrl =
            resolveRelativeUrls && !url.startsWith("http")
              ? new URL(url, baseUrl).href
              : url;

          categories.push({
            name: name || `Category ${index + 1}`,
            url: resolvedUrl,
          });
        }
      });
      return categories;
    } catch (error) {
      console.error("Error extracting category URLs:", error);
      throw error;
    }
  }
}

module.exports = CategoryUrlsExtractor;

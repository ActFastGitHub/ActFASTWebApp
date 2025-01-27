// added on January 27, 2025 please reference "postbuild": "next-sitemap" under package.json scripts

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.actfast.ca", // Replace with your website's URL
  generateRobotsTxt: true, // (optional)
  changefreq: "daily",
  priority: 0.7,
};

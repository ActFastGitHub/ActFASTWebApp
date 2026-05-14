// // added on January 27, 2025 please reference "postbuild": "next-sitemap" under package.json scripts

// /** @type {import('next-sitemap').IConfig} */
// module.exports = {
//   siteUrl: "https://www.actfast.ca", // Replace with your website's URL
//   generateRobotsTxt: true, // (optional)
//   changefreq: "daily",
//   priority: 0.7,
// };

// next-sitemap.config.js

// modified on May 14, 2026

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.actfast.ca",
  generateRobotsTxt: true,
  autoLastmod: true,
  sitemapSize: 7000,

  exclude: [
    "/api/*",
    "/dashboard",
    "/dashboard/*",
    "/admin",
    "/admin/*",
    "/super-admin",
    "/super-admin/*",

    "/login",
    "/register",
    "/forgot",
    "/reset",
    "/unauthorized",
    "/create-profile",
    "/profilepage",
    "/memberpage",

    "/equipment",
    "/equipment/*",
    "/projectspage",
    "/projectmanagement",
    "/projectcosting",
    "/field-photos",
    "/project-updates",
    "/final-repairs-agreements",
    "/material-catalog",
    "/pods-mapping",
    "/contentspage",
    "/inventorymanagementpage",
    "/under-construction",
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/",
          "/super-admin/",
          "/login",
          "/register",
          "/forgot",
          "/reset",
          "/unauthorized",
          "/create-profile",
          "/profilepage",
          "/memberpage",
          "/equipment/",
          "/projectspage",
          "/projectmanagement",
          "/projectcosting",
          "/field-photos",
          "/project-updates",
          "/final-repairs-agreements",
          "/material-catalog",
          "/pods-mapping",
          "/contentspage",
          "/inventorymanagementpage",
          "/under-construction",
        ],
      },
    ],
  },
};

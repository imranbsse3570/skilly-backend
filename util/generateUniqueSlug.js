const slugify = require("slugify");

module.exports = (resource, title) => {
  const slug = slugify(title, {
    lower: true,
    replacement: "-",
  });

  if (resource.length > 0) {
    const slugSplit = resource[resource.length - 1].slug.split("-");
    const value = parseInt(slugSplit[slugSplit.length - 1]) || 0;
    return `${slug}-${value + 1}`;
  } else {
    return slug;
  }
};

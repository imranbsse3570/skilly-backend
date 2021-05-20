const slugify = require("slugify");

module.exports = (resource, title) => {
  const slug = slugify(title, {
    lower: true,
    replacement: "-",
  });

  return resource.length > 0 ? `${slug}-${resource.length}` : slug;
};

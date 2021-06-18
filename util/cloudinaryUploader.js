const cloudinary = require("cloudinary").v2;
const fetch = require("node-fetch");

exports.cloudinaryUploader = async (path, buffer, format) => {
  const streamUploader = await cloudinary.uploader.upload_stream({
    public_id: path,
    format,
  });

  streamifier.createReadStream(buffer).pipe(streamUploader);
};

exports.cloudinaryDestroy = async (path) => {
  await cloudinary.uploader.destroy(path);
};

exports.cloudinaryGet = async (filename, options) => {
  const image = await cloudinary.url(filename, options);

  console.log(image);

  const result = await fetch(image);
  const buffer = await result.buffer();

  return buffer;
};

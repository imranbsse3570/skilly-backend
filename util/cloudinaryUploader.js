const cloudinary = require("cloudinary").v2;
const fetch = require("node-fetch");
const streamifier = require("streamifier");

exports.cloudinaryUploader = async (path, buffer, format) => {
  const streamUploader = await cloudinary.uploader.upload_stream({
    public_id: path,
    format,
  });

  streamifier.createReadStream(buffer).pipe(streamUploader);
};

exports.cloudinaryVideoUploader = async (path, buffer, format) => {
  const streamUploader = await cloudinary.uploader.upload_stream({
    public_id: path,
    format,
    resource_type: "video",
  });

  const stream = streamifier.createReadStream(buffer);
  stream.pipe(streamUploader, { end: true });

  return stream;
};

exports.cloudinaryDestroy = async (path) => {
  await cloudinary.uploader.destroy(path);
};

exports.cloudinaryGet = async (filename, options) => {
  const image = await cloudinary.url(filename, options);
  const result = await fetch(image);
  const buffer = await result.buffer();

  return buffer;
};

const cloudinaryURL = async (filename, options) =>
  await cloudinary.url(filename, options);

exports.cloudinaryURL = cloudinaryURL;

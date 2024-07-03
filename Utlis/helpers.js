import { supportedMimes } from "../config/fileSystem.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export const imageValidator = (size, mime) => {
  if (bytesToMB(size) > 2) {
    return "Image Size must be less than 2MB!";
  } else if (!supportedMimes.includes(mime)) {
    return "Image must be type of PNG, JPG, JPEG, SVG, WEBP, GIF";
  }
  return null;
};

export const bytesToMB = (bytes) => {
  return bytes / (1024 * 1024);
};

export const generateUniqueNumber = () => {
  return uuidv4();
};

export const getImageURL = (imgName) => {
  return `${process.env.APPURL}/images/${imgName}`;
};

export const removeImage = (imgName) => {
  const path = process.cwd() + "/public/images/" + imgName;
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

export const uploadImage = (image) => {
  const img_extension = image?.name.split(".");
  const img_name = generateUniqueNumber() + "." + img_extension[1];
  const upload_path = process.cwd() + "/public/images/" + img_name;

  image.mv(upload_path, (err) => {
    if (err) throw err;
  });
  return img_name;
};

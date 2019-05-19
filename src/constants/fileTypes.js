export const FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
export const FILE_EXT = new RegExp(/^.*\.(.{1,5})$/gim);
export const SUPPORTED_EXTENSIONS = new RegExp(
  /(\.(jpg|png|gif|jpeg|webp|tiff))\??([^/]*)?/gi
);

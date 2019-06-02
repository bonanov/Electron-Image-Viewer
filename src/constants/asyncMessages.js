export const getProps = fullPath => ({
  type: 'GET_PROPS',
  data: {
    fullPath,
  },
});

export const sendProps = ({ width, height, aspect, fullPath }) => ({
  type: 'SEND_PROPS',
  data: {
    fullPath,
    width,
    height,
    aspect,
  },
});

export const getResized = ({ fullPath, width, height }) => ({
  type: 'GET_RESIZED',
  data: {
    width,
    height,
    fullPath,
  },
});

export const sendResized = ({ fullPath, base64 }) => ({
  type: 'SEND_RESIZED',
  data: {
    fullPath,
    base64,
  },
});

export const getColor = ({ fullPath, buffer }) => ({
  type: 'GET_COLOR',
  data: {
    buffer,
    fullPath,
  },
});

export const sendColor = ({ fullPath, color }) => ({
  type: 'SEND_COLOR',
  data: {
    fullPath,
    color,
  },
});

export const getBlured = ({ fullPath, width, height }) => ({
  type: 'GET_BLURED',
  data: {
    width,
    height,
    fullPath,
  },
});

export const sendBlured = ({ fullPath, base64 }) => ({
  type: 'SEND_BLURED',
  data: {
    fullPath,
    base64,
  },
});

export const sendFileList = ({ fileList }) => ({
  type: 'SEND_FILELIST',
  data: {
    fileList,
  },
});

export const getFileList = dir => ({
  type: 'GET_FILELIST',
  data: {
    dir,
  },
});

export const getConfigs = () => ({
  type: 'GET_CONFIGS',
  data: {},
});

export const getArguments = () => ({
  type: 'GET_ARGUMENTS',
  data: {},
});

export const updateConfigs = confs => ({
  type: 'UPDATE_CONFIGS',
  data: {
    confs,
  },
});

export const getExif = fullPath => ({
  type: 'GET_EXIF',
  data: {
    fullPath,
  },
});

export const sendExif = ({ exifData, fullPath }) => ({
  type: 'SEND_EXIF',
  data: {
    exifData,
    fullPath,
  },
});

export const writeImageToClipboard = ({ base64 }) => ({
  type: 'WRITE_IMAGE_TO_CLIPBOARD',
  data: {
    base64,
  },
});

export const setWindowSize = ({ height, width }) => ({
  type: 'SET_WINDOW_SIZE',
  data: {
    height,
    width,
  },
});

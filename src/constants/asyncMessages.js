const { ipcRenderer } = window.electron;

export const getProps = path => ({
  type: 'GET_PROPS',
  window: 'main',
  data: {
    fullPath: path,
  },
});

export const getResized = ({ path, width, height }) => ({
  type: 'GET_RESIZED',
  window: 'main',
  data: {
    width,
    height,
    fullPath: path,
  },
});

export const sendResized = ({ path, base64 }) => ({
  type: 'SEND_RESIZED',
  window: 'main',
  data: {
    fullPath: path,
    base64,
  },
});

export const sendProps = ({ width, height, aspect, path }) => ({
  type: 'SEND_PROPS',
  window: 'second',
  data: {
    fullPath: path,
    width,
    height,
    aspect,
  },
});

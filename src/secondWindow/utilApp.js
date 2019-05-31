import * as message from '../constants/asyncMessages';
import { resizeImage, getFileProps, blurImage, getDirectory, getExif } from './utils';

const { ipcRenderer } = window.electron;

ipcRenderer.on('asynchronous-message', async (event, arg) => {
  const { data, type } = arg;
  switch (type) {
    case 'GET_PROPS': {
      const props = await getFileProps(data.fullPath);
      const newProps = { ...props, path: data.fullPath };
      ipcRenderer.send('asynchronous-message', message.sendProps(newProps));
      break;
    }

    case 'GET_RESIZED': {
      const { width, height, fullPath } = data;
      const base64 = await resizeImage({ width, height, fullPath });
      const newMessage = { fullPath, base64 };
      ipcRenderer.send('asynchronous-message', message.sendResized(newMessage));
      break;
    }

    case 'GET_BLURED': {
      const { width, height, fullPath } = data;
      const base64 = await blurImage({ width, height, fullPath });
      const newMessage = { fullPath, base64 };
      ipcRenderer.send('asynchronous-message', message.sendBlured(newMessage));
      break;
    }

    case 'GET_FILELIST': {
      const { dir } = data;
      const fileList = await getDirectory(dir);
      const newMessage = { fileList };
      ipcRenderer.send('asynchronous-message', message.sendFileList(newMessage));
      break;
    }

    case 'GET_EXIF': {
      const { fullPath } = data;
      const exifData = await getExif(fullPath);
      const message_ = message.sendExif({ exifData, fullPath });
      ipcRenderer.send('asynchronous-message', message_);
      break;
    }

    default:
      break;
  }
});

import * as message from '../constants/asyncMessages';
import { resizeImage, getFileProps, getAverageColor, blurImage } from './utils';

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

    case 'GET_COLOR': {
      console.log(data);
      const { buffer, fullPath } = data;
      const color = await getAverageColor(buffer);
      const newMessage = { fullPath, color };
      ipcRenderer.send('asynchronous-message', message.sendColor(newMessage));
      break;
    }

    default:
      break;
  }
});

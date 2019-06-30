# Electron Image Viewer ![](src/index/icon-big.png)

*Press F1 in app to see full list of shortcuts*

![](https://raw.githubusercontent.com/Bonanov/Electron-Image-Viewer/assets/2.png)
![](https://raw.githubusercontent.com/Bonanov/Electron-Image-Viewer/assets/1.png)

## Install

### Linux

Download [latest release](https://github.com/Bonanov/Electron-Image-Viewer/releases), unpack and run `./image-viewer`.
You are going to need *graphicsmagick* installed.
It is probably will work without it, but some features like zooming, and file info may not work correctly.

### macOS, Windows

Have not tested it yet. 


### Known bugs

* There are a lot of them and they probably will not be fixed any time soon.
* There is *unprivileged containers* thing on some linux kernels, so you may want to run `sudo sysctl kernel.unprivileged_userns_clone=1`

!function(e){var t={};function a(n){if(t[n])return t[n].exports;var r=t[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,a),r.l=!0,r.exports}a.m=e,a.c=t,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)a.d(n,r,function(t){return e[t]}.bind(null,r));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="",a(a.s=6)}([function(e,t){e.exports=sharp},function(e,t){e.exports=path},function(e,t){e.exports=fs},function(e,t){e.exports=gm},function(e,t){e.exports=exif},function(e,t){!function(e,t){"use strict";if(!e.setImmediate){var a,n,r,s,i,o=1,c={},l=!1,u=e.document,f=Object.getPrototypeOf&&Object.getPrototypeOf(e);f=f&&f.setTimeout?f:e,"[object process]"==={}.toString.call(e.process)?a=function(e){process.nextTick(function(){d(e)})}:!function(){if(e.postMessage&&!e.importScripts){var t=!0,a=e.onmessage;return e.onmessage=function(){t=!1},e.postMessage("","*"),e.onmessage=a,t}}()?e.MessageChannel?((r=new MessageChannel).port1.onmessage=function(e){d(e.data)},a=function(e){r.port2.postMessage(e)}):u&&"onreadystatechange"in u.createElement("script")?(n=u.documentElement,a=function(e){var t=u.createElement("script");t.onreadystatechange=function(){d(e),t.onreadystatechange=null,n.removeChild(t),t=null},n.appendChild(t)}):a=function(e){setTimeout(d,0,e)}:(s="setImmediate$"+Math.random()+"$",i=function(t){t.source===e&&"string"==typeof t.data&&0===t.data.indexOf(s)&&d(+t.data.slice(s.length))},e.addEventListener?e.addEventListener("message",i,!1):e.attachEvent("onmessage",i),a=function(t){e.postMessage(s+t,"*")}),f.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),n=0;n<t.length;n++)t[n]=arguments[n+1];var r={callback:e,args:t};return c[o]=r,a(o),o++},f.clearImmediate=h}function h(e){delete c[e]}function d(e){if(l)setTimeout(d,0,e);else{var a=c[e];if(a){l=!0;try{!function(e){var a=e.callback,n=e.args;switch(n.length){case 0:a();break;case 1:a(n[0]);break;case 2:a(n[0],n[1]);break;case 3:a(n[0],n[1],n[2]);break;default:a.apply(t,n)}}(a)}finally{h(e),l=!1}}}}}("undefined"==typeof self?"undefined"==typeof global?this:global:self)},function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),s=a(3),i=a.n(s),o=a(2),c=a.n(o),l=a(1),u=a.n(l),f=a(4);const h=["jpg","jpeg","png","gif","webp"],d=new RegExp(/^.*\.(.{1,5})$/gim),{ipcRenderer:p}=(new RegExp(/(\.(jpg|png|gif|jpeg|webp|tiff))\??([^\/]*)?/gi),a(5),window.electron),g=async e=>{return{...await new Promise((t,a)=>{i()(e).size(async(e,a)=>{if(e)return t({err:e});t({width:a.width,height:a.height})})})}},m=e=>{return e.filter(e=>(e=>!!h.includes(e.toLowerCase()))(e.type))},y=async(e,t)=>{const a=[];return p.send("asynchronous-message",{type:"LOG",data:"got"}),await e.forEach(async e=>{const{size:n,mtimeMs:r,atimeMs:s,ctimeMs:i}=await c.a.statSync(u.a.join(t,e)),o=Math.floor(Math.random()*Date.now()),l=(e=>e.replace(d,"$1"))(e),f={fileName:e,fullPath:u.a.normalize(u.a.join(t,e)),url:"",dir:t,size:n,mtime:r,atime:s,ctime:i,isUrl:!1,type:l,id:o};a.push(f)}),a},{ipcRenderer:w}=window.electron;w.on("asynchronous-message",async(e,t)=>{const{data:a,type:n}=t;switch(n){case"GET_PROPS":{const e={...await(async e=>{const t=await g(e),{width:a,height:n,err:r}=t;return{width:a,height:n,aspect:a/n,err:r,fullPath:e}})(a.fullPath),path:a.fullPath};w.send("asynchronous-message",(({width:e,height:t,aspect:a,fullPath:n})=>({type:"SEND_PROPS",data:{fullPath:n,width:e,height:t,aspect:a}}))(e));break}case"GET_RESIZED":{const{width:e,height:t,fullPath:n}=a,s={fullPath:n,base64:await(async({fullPath:e,width:t,height:a})=>{return await new Promise((n,s)=>{r()(e).resize(Math.round(t),Math.round(a),{fit:r.a.fit.inside,kernel:r.a.kernel.lanczos3,withoutEnlargement:!0}).png({compressionLevel:0}).toBuffer().then(e=>n([new Uint8Array(e)])).catch(e=>s(e))})})({width:e,height:t,fullPath:n})};w.send("asynchronous-message",(({fullPath:e,base64:t})=>({type:"SEND_RESIZED",data:{fullPath:e,base64:t}}))(s));break}case"GET_BLURED":{const{width:e,height:t,fullPath:n}=a,s={fullPath:n,base64:await(async({fullPath:e,width:t,height:a})=>{return await new Promise((n,s)=>{r()(e).resize(Math.round(t),a,{fit:r.a.fit.fill,kernel:r.a.kernel.nearest,withoutEnlargement:!0}).blur(15).png({compressionLevel:0}).toBuffer().then(e=>n("data:image/jpeg;base64,"+e.toString("base64"))).catch(e=>s(e))})})({width:e,height:t,fullPath:n})};w.send("asynchronous-message",(({fullPath:e,base64:t})=>({type:"SEND_BLURED",data:{fullPath:e,base64:t}}))(s));break}case"GET_FILELIST":{const{dir:e}=a,t={fileList:await(async e=>{return await new Promise(t=>{c.a.readdir(e,async(a,n)=>{p.send("asynchronous-message",{type:"LOG",kind:"err",data:a});const r=await y(n,e),s=await m(r);t(s)})})})(e)};w.send("asynchronous-message",(({fileList:e})=>({type:"SEND_FILELIST",data:{fileList:e}}))(t));break}case"GET_EXIF":{const{fullPath:e}=a,t=(({exifData:e,fullPath:t})=>({type:"SEND_EXIF",data:{exifData:e,fullPath:t}}))({exifData:await(async e=>{return await new Promise(t=>{new f.ExifImage({image:e},(e,a)=>{if(e)return t({err:e});t(a)})})})(e),fullPath:e});w.send("asynchronous-message",t);break}}})}]);
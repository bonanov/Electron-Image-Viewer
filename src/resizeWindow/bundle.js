!function(e){var t={};function n(r){if(t[r])return t[r].exports;var a=t[r]={i:r,l:!1,exports:{}};return e[r].call(a.exports,a,a.exports,n),a.l=!0,a.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)n.d(r,a,function(t){return e[t]}.bind(null,a));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t){e.exports=sharp},function(e,t){e.exports=gm},function(e,t,n){"use strict";n.r(t);var r=n(0),a=n.n(r),o=n(1),i=n.n(o);const{ipcRenderer:s}=window.electron,{ipcRenderer:c}=window.electron;c.on("asynchronous-message",async(e,t)=>{const{data:n,type:r}=t;switch(r){case"GET_PROPS":{const e={...await h(n.fullPath),path:n.fullPath};c.send("asynchronous-message",(({width:e,height:t,aspect:n,path:r})=>({type:"SEND_PROPS",window:"second",data:{fullPath:r,width:e,height:t,aspect:n}}))(e));break}case"GET_RESIZED":{const{width:e,height:t,fullPath:r}=n,a={path:r,base64:await u({width:e,height:t,path:r})};c.send("asynchronous-message",(({path:e,base64:t})=>({type:"SEND_RESIZED",window:"main",data:{fullPath:e,base64:t}}))(a));break}}});const u=async({path:e,width:t,height:n})=>{return await new Promise((r,o)=>{a()(e).resize(t,n,{fit:a.a.fit.inside,kernel:a.a.kernel.lanczos3,withoutEnlargement:!0}).png({compressionLevel:0}).toBuffer().then(e=>r("data:image/png;base64,"+e.toString("base64"))).catch(e=>console.log(e))})},h=async e=>{const t=await l(e),{width:n,height:r,err:a}=t;return{width:n,height:r,aspect:n/r,err:a}},l=async e=>{return{...await new Promise((t,n)=>{i()(e).size(async(e,n)=>{if(e)return t({err:e});t({width:n.width,height:n.height})})})}}}]);
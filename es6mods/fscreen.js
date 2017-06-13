/*

https://github.com/rafrex/fscreen

import fscreen from 'fscreen';

fscreen.fullscreenEnabled === true / false;
// boolean to tell if fullscreen mode is supported
// replacement for: document.fullscreenEnabled
// mapped to: document.vendorMappedFullscreenEnabled

fscreen.fullscreenElement === null / DOM Element;
// null if not in fullscreen mode, or the DOM element that's in fullscreen mode
// replacement for: document.fullscreenElement
// mapped to: document.vendorMappedFullsceenElement
// note that fscreen.fullscreenElement uses a getter to retrieve the element
// each time the property is accessed.


fscreen.requestFullscreen(element);
// replacement for: element.requestFullscreen()
// mapped to: element.vendorMappedRequestFullscreen()

fscreen.requestFullscreenFunction(element);
// replacement for: element.requestFullscreen - without calling the function
// mapped to: element.vendorMappedRequestFullscreen

fscreen.exitFullscreeen();
// replacement for: document.exitFullscreen()
// mapped to: document.vendorMappedExitFullscreen()
// note that fscreen.exitFullscreen is mapped to
// document.vendorMappedExitFullscreen - without calling the function


fscreen.onfullscreenchange = handler;
// replacement for: document.onfullscreenchange = handler
// mapped to: document.vendorMappedOnfullscreenchange = handler

fscreen.addEventListener(‘fullscreenchange’, handler, options);
// replacement for: document.addEventListener(‘fullscreenchange’, handler, options)
// mapped to: document.addEventListener(‘vendorMappedFullscreenchange’, handler, options)

fscreen.removeEventListener(‘fullscreenchange’, handler);
// replacement for: document.removeEventListener(‘fullscreenchange’, handler)
// mapped to: document.removeEventListener(‘vendorMappedFullscreenchange’, handler)


fscreen.onfullscreenerror = handler;
// replacement for: document.onfullscreenerror = handler
// mapped to: document.vendorMappedOnfullscreenerror = handler

fscreen.addEventListener(‘fullscreenerror’, handler, options);
// replacement for: document.addEventListener(‘fullscreenerror’, handler, options)
// mapped to: document.addEventListener(‘vendorMappedFullscreenerror’, handler, options)

fscreen.removeEventListener(‘fullscreenerror’, handler);
// replacement for: document.removeEventListener(‘fullscreenerror’, handler)
// mapped to: document.removeEventListener(‘vendorMappedFullscreenerror’, handler)
Usage

Use it just like the spec API.

if (fscreen.fullscreenEnabled) {
 fscreen.addEventListener('fullscreenchange', handler, false);
 fscreen.requestFullscreen(element);
}

function handler() {
 if (fscreen.fullscreenElement !== null) {
   console.log('Entered fullscreen mode');
 } else {
   console.log('Exited fullscreen mode');
 }
}
*/



const key = {
  fullscreenEnabled: 0,
  fullscreenElement: 1,
  requestFullscreen: 2,
  exitFullscreen: 3,
  fullscreenchange: 4,
  fullscreenerror: 5,
};

const webkit = [
  'webkitFullscreenEnabled',
  'webkitFullscreenElement',
  'webkitRequestFullscreen',
  'webkitExitFullscreen',
  'webkitfullscreenchange',
  'webkitfullscreenerror',
];

const moz = [
  'mozFullScreenEnabled',
  'mozFullScreenElement',
  'mozRequestFullScreen',
  'mozCancelFullScreen',
  'mozfullscreenchange',
  'mozfullscreenerror',
];

const ms = [
  'msFullscreenEnabled',
  'msFullscreenElement',
  'msRequestFullscreen',
  'msExitFullscreen',
  'MSFullscreenChange',
  'MSFullscreenError',
];

// so it doesn't throw if no window or document
const document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};

const vendor = (
  ('fullscreenEnabled' in document && Object.keys(key)) ||
  (webkit[0] in document && webkit) ||
  (moz[0] in document && moz) ||
  (ms[0] in document && ms) ||
  []
);

export default {
  requestFullscreen: element => element[vendor[key.requestFullscreen]](),
  requestFullscreenFunction: element => element[vendor[key.requestFullscreen]],
  get exitFullscreen() { return document[vendor[key.exitFullscreen]].bind(document); },
  addEventListener: (type, handler, options) => document.addEventListener(vendor[key[type]], handler, options),
  removeEventListener: (type, handler) => document.removeEventListener(vendor[key[type]], handler),
  get fullscreenEnabled() { return Boolean(document[vendor[key.fullscreenEnabled]]); },
  set fullscreenEnabled(val) {},
  get fullscreenElement() { return document[vendor[key.fullscreenElement]]; },
  set fullscreenElement(val) {},
  get onfullscreenchange() { return document[`on${vendor[key.fullscreenchange]}`.toLowerCase()]; },
  set onfullscreenchange(handler) { return document[`on${vendor[key.fullscreenchange]}`.toLowerCase()] = handler; },
  get onfullscreenerror() { return document[`on${vendor[key.fullscreenerror]}`.toLowerCase()]; },
  set onfullscreenerror(handler) { return document[`on${vendor[key.fullscreenerror]}`.toLowerCase()] = handler; },
};
// URL.parse polyfill for PDF.js compatibility
// PDF.js uses URL.parse which is a Node.js API not available in browsers

if (typeof URL !== 'undefined' && typeof (URL as any).parse !== 'function') {
  (URL as any).parse = function parse(url, base) {
    if (base) {
      return new URL(url, base);
    }
    return new URL(url);
  };

  console.log('[PDF Polyfill] URL.parse polyfill applied');
}

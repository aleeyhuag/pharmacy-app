/*
 * Bridge between the app's plain JS (app.js) and Capacitor's native
 * plugins. Kept separate so app.js has no hard dependency on Capacitor
 * and can still be opened and tested in a normal desktop browser.
 *
 * window.Capacitor only exists when running inside the installed
 * Android app. In a normal browser it stays undefined, so
 * window.AGBridge is never created and app.js falls back to
 * browser-native behaviour (file download / clipboard) automatically.
 */
(function () {
  "use strict";
  if (typeof window === "undefined" || !window.Capacitor) return;

  var Plugins = window.Capacitor.Plugins || {};
  var Share = Plugins.Share;
  var Filesystem = Plugins.Filesystem;
  if (!Share || !Filesystem) return;

  // Capacitor's Filesystem.Directory.Cache ('CACHE') — files here are
  // private to the app and exactly what the app's built-in FileProvider
  // needs to hand a real file (not just text) to WhatsApp, Gmail, Drive.
  var CACHE_DIR = "CACHE";

  function writeFile(filename, data, isBase64) {
    var opts = { path: filename, directory: CACHE_DIR, data: data };
    if (!isBase64) opts.encoding = "utf8";
    return Filesystem.writeFile(opts);
  }

  window.AGBridge = {
    // Shares plain text only (used for very small things that don't
    // need to be a file, and as an internal fallback).
    shareText: function (title, text) {
      return Share.share({ title: title || "Pharmacy Price Book", text: text, dialogTitle: "Send to" });
    },

    // Writes data to a real file on the device, then opens the native
    // share sheet with that file attached — so WhatsApp/Gmail/Drive see
    // an actual .json / .csv / .pdf file, not a wall of text.
    // data: a UTF-8 string for text files, or a base64 string for
    // binary files (isBase64 = true) such as PDFs.
    shareFile: function (filename, data, isBase64, title) {
      return writeFile(filename, data, isBase64)
        .then(function () {
          return Filesystem.getUri({ path: filename, directory: CACHE_DIR });
        })
        .then(function (res) {
          return Share.share({
            title: title || filename,
            url: res.uri,
            dialogTitle: "Send " + filename
          });
        });
    }
  };
})();

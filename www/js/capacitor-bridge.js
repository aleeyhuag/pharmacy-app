/*
 * Small bridge between the app's plain JS (app.js) and Capacitor's native
 * plugins. Kept separate so app.js has no direct dependency on Capacitor
 * and can still be opened and tested in a normal desktop browser.
 *
 * Capacitor injects `window.Capacitor` only when running inside the
 * installed Android app (or iOS). In a normal browser this stays
 * undefined, so window.AGBridge is simply not created and app.js falls
 * back to navigator.share / clipboard copy automatically.
 */
(function () {
  "use strict";
  if (typeof window === "undefined" || !window.Capacitor) return;

  var Share = window.Capacitor.Plugins && window.Capacitor.Plugins.Share;
  if (!Share) return;

  window.AGBridge = {
    // Shares plain text (a backup export or a receipt) through Android's
    // native share sheet: WhatsApp, Gmail, Google Drive, Bluetooth, etc.
    share: function (title, text) {
      return Share.share({
        title: title || "Pharmacy Price Book",
        text: text,
        dialogTitle: "Send to"
      });
    }
  };
})();

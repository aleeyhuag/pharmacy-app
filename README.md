# Pharmacy Price Book (Android app)

Offline price lookup, expiry tracking and receipts for a single-device
pharmacy, built as a Capacitor app (plain HTML/CSS/JS inside a native
Android shell — no server, no internet required to use it).

## What's in this project

```
pharmacy-app/
├── www/                        The actual app (what runs on screen)
│   ├── index.html              Page shell
│   ├── css/style.css           All styling
│   └── js/
│       ├── app.js              All app logic: prices, expiry, sales, backup
│       └── capacitor-bridge.js Hands "Send" actions to Android's native share sheet
├── android/                    Generated native Android project (Gradle/Java)
├── .github/workflows/
│   └── build-apk.yml           Builds the APK automatically in the cloud
├── capacitor.config.json       App id, name, and web folder Capacitor points at
├── package.json                npm dependencies (Capacitor + plugins)
└── README.md                   This file
```

## How to get a working APK (no Android Studio needed)

1. Create a new GitHub repository and push this whole folder to it,
   on the `main` branch.
2. Open the repo on GitHub → the **Actions** tab. A workflow called
   "Build Android APK" runs automatically on every push (or trigger it
   manually with "Run workflow").
3. When it finishes (a few minutes), open that workflow run and
   download the **pharmacy-price-book-debug-apk** file under
   "Artifacts". That's the installable `.apk`.
4. Send that file to the pharmacy's tablet (WhatsApp, USB cable, or
   Google Drive) and open it there. Android will ask to allow install
   from this source the first time — that's normal for an app not
   downloaded from the Play Store.

This build is a **debug APK**, fine for testing on the client's own
device. Before a final handover, let's switch it to a signed
**release APK** (a one-time step: generate a signing key, add it as a
GitHub secret) so Android doesn't show any "unverified developer"
warnings.

## How to edit and test it yourself

The app itself is plain HTML/CSS/JS under `www/`, so day-to-day
changes (wording, colors, a new field) can be tested directly by
opening `www/index.html` in a desktop browser — no build needed for
that. Only Android-specific things (the native Share sheet, the app
icon, permissions) need an actual build.

If you install Node.js locally:

```
npm install
npx cap sync android
```

`npx cap sync android` copies the latest `www/` files into the
Android project — run it after any change to `www/` before building.

## Storage note

Medicines, batches and receipts are stored in the app's own local
storage on the device (not the cloud). This is private to the app —
uninstalling it or clearing the app's storage in Android Settings
will erase the data, so remind the client to use "Save my data" on
the Save data tab regularly. If the price list grows very large in
future, this can be upgraded to a proper on-device database.

## Known gaps for this first build

- The app icon is still Capacitor's default icon — swap in the real
  logo before handing this to the client.
- Bluetooth thermal-printer support (58mm/80mm receipt printers) is
  not included — the PDF receipt can be printed from any normal
  printer via Android's own print/share options once received.

## How files and sharing work now

- **Save my data** writes a real `.json` file (via `@capacitor/filesystem`)
  and opens Android's native share sheet (`@capacitor/share`) with that
  file attached — so WhatsApp, Gmail, or Drive receive an actual file,
  not pasted text. **Bring data back** now reads that file back in with
  a normal file picker.
- **Export price list (.csv)** writes a plain CSV of every medicine and
  price, which opens directly in Excel or Google Sheets.
- Each receipt's **Save & send PDF** builds a real PDF (via a bundled
  copy of `jsPDF` — no internet needed) and shares that file the same
  way. "Copy text" is kept as a manual fallback only.

## Sample (demo) data

The app ships with 28 sample medicines and 3 sample receipts so the
screen isn't empty on first open. Every seeded item is tagged
internally (`demo: true`) so it can be told apart from anything the
pharmacy actually enters.

The **Save data** tab shows a **"Delete sample data"** button only
while sample items remain — it removes only the tagged demo items,
never the pharmacy's own entries, and asks for confirmation first.
There is deliberately no "reset to demo data" button anymore: it
used to be possible to wipe real data back to the sample set by
mistake, which is exactly the kind of thing an untrained or
unauthorized user could trigger without meaning to.

## Backup reminder

The app tracks the last time "Send my data somewhere safe" was used
(`ag-pharmacy-last-backup-v1` in local storage) and the date it was
first installed. If it's been 7 or more days since the last backup
(or since install, if there's never been one), a banner appears at
the top of the Prices screen and a small "!" badge appears on the
Save data tab — both link straight to the Save data screen. The
7-day threshold is one constant (`REMIND_DAYS` near the top of
`www/js/app.js`) — change it to 3 there if you'd rather nudge more
often.

## App icon

The launcher icon is a bold white "Rx" on the app's brand teal, generated
from source files in `assets/` (`icon.png`, `icon-foreground.png`,
`icon-background.png`, plus `splash.png` / `splash-dark.png`). It covers
both older Android's flat icon and newer Android's adaptive icon (the
shape the system masks into a circle, squircle, etc.).

To change the artwork later: replace the files in `assets/` with new
1024x1024 PNGs (same names), then run:

```
npm install
npm run icon
```

That regenerates every density folder under `android/app/src/main/res/`
automatically — no manual resizing needed. Run `npx cap sync android`
afterwards as usual before rebuilding.

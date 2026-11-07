# Deploy to Hostinger

This folder contains **only** the files needed for the live website.

## Upload steps

1. Log in to **Hostinger hPanel** → **Files** → **File Manager**
2. Open **`public_html`** (root for your domain)
3. Upload **all files and folders from this `deploy` folder** into `public_html`:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `assets/` (entire folder)

## Correct structure on the server

```
public_html/
  index.html
  styles.css
  script.js
  assets/
    logo.png
    projects/
      ...
```

`index.html` must sit **directly** in `public_html`, not inside a subfolder.

## Zip upload (optional)

1. Select all items inside this `deploy` folder (not the folder itself)
2. Zip them
3. Upload the zip to `public_html` and extract

## After upload

- Visit `https://yourdomain.com`
- Test the contact form
- Test mobile menu and theme toggle

## Regenerate this folder

From the project root:

```bash
npm run deploy:prepare
```

## Do not upload

- `node_modules/`
- `.git/`
- `package.json` (not needed on the server)

The contact form uses Web3Forms from the browser; no server-side code is required.

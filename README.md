# Black Sapphire Systems — Website

Multi-page site for **Black Sapphire Systems** (medical billing, web development, SEO). The original homepage remains intact; navbar navigation changes the content in place while keeping the shared header and navbar fixed.

## Run in VS Code (recommended)

### Option A — One-click debug (local server + browser)

1. Open this folder in VS Code: **File → Open Folder** → select `BSWEB`
2. Install [Node.js](https://nodejs.org/) if you do not have it
3. Open the terminal in VS Code (**Terminal → New Terminal**) and run:

   ```bash
   npm install
   ```

4. Press **F5** (or **Run → Start Debugging**) and choose **Open site (Chrome)** or **Open site (Edge)**
5. The site opens at **http://localhost:8080**

To run the server only (no debug):

```bash
npm run dev
```

Then open http://localhost:8080 in your browser.

### Option B — Live Server extension

1. Install the **Live Server** extension (VS Code will suggest it when you open the project)
2. Right-click `index.html` → **Open with Live Server**
3. Site opens at **http://127.0.0.1:8080** (port set in `.vscode/settings.json`)

> **Important:** Do not open `index.html` by double-clicking the file. Use a local server so scripts and the contact form work correctly.

## Contact form email

Submissions go to **admin@blacksapcorp.com**.

For **automatic** inbox delivery (no visitor mail app):

1. Get a free key at [web3forms.com](https://web3forms.com) using **admin@blacksapcorp.com**
2. In `script.js`, set:

   ```javascript
   const WEB3FORMS_ACCESS_KEY = "your-key-here";
   ```

Until then, the form opens the visitor’s email app with the message pre-filled.

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| Services | `services.html` |
| Past work | `past-work.html` |
| Current projects | `projects.html` |
| Why us | `why-us.html` |
| Process | `process.html` |
| Feedback | `feedback.html` |
| Contact | `contact.html` |

The secondary page URLs load their content from `index.html` with `pages.js`. Run the site through a local web server (not `file://`) so those pages can fetch the shared content.

## Project files

| File        | Purpose                          |
|------------|-----------------------------------|
| `index.html` | Homepage, page sections, and shared navigation |
| `pages.js`   | Builds each secondary page from the shared sections |
| `styles.css` | Layout and design               |
| `script.js`  | Diamond, animations, contact form |
| `scripts/prepare-deploy.mjs` | Copies all pages and assets into `deploy/` |

## Sections

1. Hero — corporate message + 3D diamond  
2. Services — Medical Billing, Web Development, SEO  
3. Past work — portfolio  
4. Current projects — active work  
5. Why us  
6. Process  
7. Contact — form with multi-select services  

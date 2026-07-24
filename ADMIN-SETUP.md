# Admin Panel Setup — The Xyra Studio

The admin page (`admin.html`) lets you edit almost everything on the site
without touching code:

- **Site Settings** — homepage hero text, About page copy, footer tagline, email/WhatsApp/Instagram/LinkedIn
- **Portfolio** — case study cards
- **Services** — the offerings grid
- **Pricing** — tier cards
- **Testimonials** — the homepage quote slider
- **Stats** — the "By The Numbers" counters on About
- **FAQs** — the accordion on the Pricing page
- **Messages** / **Newsletter** — read-only views of what visitors submit

Changes save to a free **Firebase** backend (Google's hosting-agnostic
database) and show up live on the public pages. It works fine on GoDaddy
static hosting — no server or build step needed.

This takes about 10 minutes, once.

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and sign in with a Google account.
2. Click **Add project**, name it (e.g. "xyra-studio"), and finish the wizard (you can decline Google Analytics).

## 2. Add a Web App

1. In your new project, click the **`</>`** (Web) icon to register a web app.
2. Give it a nickname (e.g. "Xyra site") — you don't need Firebase Hosting.
3. Firebase will show you a `firebaseConfig` object. Copy it.
4. Open **`firebase-config.js`** in this folder and paste your values in, replacing the placeholders:

   ```js
   export const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

## 3. Turn on Firestore (the database)

1. In the left sidebar: **Build → Firestore Database → Create database**.
2. Choose **Start in production mode**, pick a region close to your visitors, click **Enable**.
3. Go to the **Rules** tab and replace the contents with the rules below, then **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       // Site-wide settings (hero text, about copy, contact/social links):
       // anyone can read, only signed-in admins can write.
       match /settings/{doc} {
         allow read: if true;
         allow write: if request.auth != null;
       }

       // Portfolio, services, pricing, testimonials, stats, FAQs: anyone
       // can read (so the public pages can display them), only signed-in
       // admins can write.
       match /portfolio/{doc} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /services/{doc} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /pricing/{doc} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /testimonials/{doc} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /stats/{doc} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /faqs/{doc} {
         allow read: if true;
         allow write: if request.auth != null;
       }

       // Contact submissions & newsletter signups: anyone can submit
       // (create), but only signed-in admins can read or delete them.
       match /submissions/{doc} {
         allow create: if true;
         allow read, delete: if request.auth != null;
       }
       match /newsletter/{doc} {
         allow create: if true;
         allow read, delete: if request.auth != null;
       }
     }
   }
   ```

## 4. Turn on sign-in and create your admin login

1. **Build → Authentication → Get started**.
2. Under **Sign-in method**, enable **Email/Password**.
3. Go to the **Users** tab → **Add user** → enter the email + password you want to log into `admin.html` with. There's no public sign-up page — you (or anyone with these credentials) are the only one who can log in.

## 5. Upload

Upload the whole site folder to GoDaddy exactly as before (it now also includes `admin.html`, `cms.js`, and `firebase-config.js`). Then visit:

```
https://yourdomain.com/admin.html
```

Sign in with the email/password from step 4, and start adding content. It'll appear on the live Portfolio, Services and Pricing pages within a page refresh — no static content is deleted, it's just hidden once you add your own items in that section.

## Notes

- If you customize "Headline — line 2" in Site Settings, it'll show as plain text — the default's mint-colored "Digital Movements." accent only applies to the original wording. Everything else keeps its styling.
- `admin.html` isn't linked from the public navigation, but it isn't secret either — anyone who knows the URL can see the login screen (they just can't get past it without a valid account). If you want extra obscurity, you can rename the file (e.g. `xyra-admin-7f2.html`).
- Free-tier Firebase (Spark plan) comfortably covers a small business site — the limits are far beyond what a marketing site's traffic and admin usage will hit.
- To add more admin logins later, repeat step 4.3 for each person.

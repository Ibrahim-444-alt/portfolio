# Muhammad Ibrahim Khalid — Portfolio

## Structure
```
index.html
css/style.css
js/main.js
assets/resume/   ← drop your resume PDF here
assets/img/      ← drop real project screenshots here
```

## Before going live

1. **Resume & photos**: your real CV, profile photo, certificate scans, and
   project screenshots are already wired in under `assets/`.

2. **Contact form (EmailJS)**: open `js/main.js`, find the `ContactForm`
   object near the bottom, and replace:
   ```js
   SERVICE_ID: "YOUR_EMAILJS_SERVICE_ID",
   TEMPLATE_ID: "YOUR_EMAILJS_TEMPLATE_ID",
   PUBLIC_KEY: "YOUR_EMAILJS_PUBLIC_KEY",
   ```
   with your real values from https://www.emailjs.com. Until then, the
   form shows a friendly message telling the visitor to email you directly.

3. **Project links**:
   - ImmuniTrack → live demo linked; GitHub button currently falls back to
     your profile (no repo link was given).
   - NGO Management System → linked to its real GitHub repo.
   - Liberty Electronics → linked to its live Vercel deploy and GitHub repo.
     Double check the live URL (`liberty-electronics-livid.vercel.app`) —
     Vercel domains normally end in `.vercel.app`, so if the site doesn't
     load, that's the first thing to check.
   - Hospital Management System → marked "40% Complete" with a 3-image
     carousel (doctor dashboard, admin dashboard, public site). GitHub
     button currently falls back to your profile until the repo is public.
     Update the `<span class="progress-badge">` text in `index.html` as
     the build progresses, and swap the fallback links once you have a repo.

4. **Certificates**: your two real Aptech "ACCP in AI" performance
   statements (Term 1 & Term 2) are shown with clickable thumbnails that
   open the full scan in a new tab.

5. **About photo**: your headshot appears in both the hero and the About
   section now — swap `assets/img/profile.jpg` any time to update both.

## Notes
- Dark/light mode preference is saved in the browser (`localStorage`).
- All animation respects `prefers-reduced-motion`.
- No build step — just open `index.html` or deploy the folder as-is
  (e.g. GitHub Pages, Netlify, Vercel static hosting).

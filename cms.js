/* ==========================================================================
   THE XYRA STUDIO — cms.js

   Loads editable content from Firestore and swaps it into the page:
   - Site settings (hero text, about copy, footer tagline, contact/social links)
   - Portfolio projects, Services, Pricing tiers
   - Testimonials, Stats (About page), FAQs (Pricing page)

   If Firestore has no data yet for a section (or isn't configured), the
   original static content already in the page stays put — nothing breaks,
   nothing goes blank. Also wires the contact + newsletter forms to save
   submissions to Firestore.

   NOTE: content rendered here deliberately does NOT use the `data-reveal`
   scroll-fade attribute (see style.css `[data-reveal] { opacity: 0 }`) —
   elements added after the page's one-time reveal pass would otherwise
   stay invisible forever. Dynamic content simply renders visible.
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, getDoc, doc, query, orderBy,
  addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (err) {
  console.warn("[cms] Firebase not configured yet — showing static content only.", err);
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase();
}

/* ---------------------------------------------------------------------
   Site settings (single doc: settings/site)
   Applied on every page — only touches elements that exist on that page.
--------------------------------------------------------------------- */
async function applySiteSettings() {
  if (!db) return;
  try {
    const snap = await getDoc(doc(db, "settings", "site"));
    if (!snap.exists()) return;
    const s = snap.data();

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.textContent = val;
    };
    setText("heroEyebrowText", s.heroEyebrow);
    setText("heroLine1Text", s.heroLine1);
    setText("heroLine2Text", s.heroLine2);
    setText("heroTagline", s.heroTagline);
    setText("aboutHeading", s.aboutHeading);
    setText("aboutIntro", s.aboutIntro);
    setText("missionText", s.missionText);
    setText("visionText", s.visionText);
    setText("valuesText", s.valuesText);

    document.querySelectorAll(".footer-tagline").forEach(el => {
      if (s.footerTagline) el.textContent = s.footerTagline;
    });

    // Social links (footer, every page) + contact page's link list
    const socialHrefs = {
      instagram: s.instagram ? (s.instagram.startsWith("http") ? s.instagram : `https://instagram.com/${s.instagram}`) : null,
      linkedin: s.linkedin ? (s.linkedin.startsWith("http") ? s.linkedin : `https://linkedin.com/company/${s.linkedin}`) : null,
      whatsapp: s.whatsapp ? `https://wa.me/${s.whatsapp.replace(/\D/g, "")}` : null
    };
    document.querySelectorAll("[data-social]").forEach(el => {
      const href = socialHrefs[el.dataset.social];
      if (href) el.href = href;
    });
    document.querySelectorAll('[data-contact="whatsapp"]').forEach(el => { if (socialHrefs.whatsapp) el.href = socialHrefs.whatsapp; });
    document.querySelectorAll('[data-contact="instagram"]').forEach(el => { if (socialHrefs.instagram) el.href = socialHrefs.instagram; });
    document.querySelectorAll('[data-contact="linkedin"]').forEach(el => { if (socialHrefs.linkedin) el.href = socialHrefs.linkedin; });
    document.querySelectorAll('[data-contact="email"]').forEach(el => {
      if (s.email) { el.href = `mailto:${s.email}`; el.lastChild.textContent = " " + s.email; }
    });
  } catch (err) {
    console.warn("[cms] Could not load site settings from Firestore.", err);
  }
}

/* ---------------------------------------------------------------------
   Portfolio grid (portfolio.html)
--------------------------------------------------------------------- */
async function renderPortfolio() {
  const grid = document.getElementById("portfolioGrid");
  if (!grid || !db) return;
  try {
    const snap = await getDocs(query(collection(db, "portfolio"), orderBy("order", "asc")));
    if (snap.empty) return;

    const gradClasses = ["grad-1", "grad-2", "grad-3", "grad-4", "grad-5", "grad-6"];
    grid.innerHTML = snap.docs.map((docSnap, i) => {
      const d = docSnap.data();
      const category = d.category || "branding";
      const label = category.charAt(0).toUpperCase() + category.slice(1);
      const media = d.imageUrl
        ? `<div class="portfolio-media" style="background-image:url('${escapeHtml(d.imageUrl)}');background-size:cover;background-position:center;"></div>`
        : `<div class="portfolio-media ${gradClasses[i % gradClasses.length]}"></div>`;
      return `<div class="portfolio-card" data-category="${escapeHtml(category)}">${media}<div class="portfolio-info"><span>${escapeHtml(label)} · Case Study</span><h3>${escapeHtml(d.title || "")}</h3></div></div>`;
    }).join("");
  } catch (err) {
    console.warn("[cms] Could not load portfolio from Firestore, showing static content.", err);
  }
}

/* ---------------------------------------------------------------------
   Services grid (services.html)
--------------------------------------------------------------------- */
async function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid || !db) return;
  try {
    const snap = await getDocs(query(collection(db, "services"), orderBy("order", "asc")));
    if (snap.empty) return;

    grid.innerHTML = snap.docs.map(docSnap => {
      const d = docSnap.data();
      const icon = d.icon || "sparkles";
      return `<div class="service-card group">
        <div class="service-glow"></div>
        <i data-lucide="${escapeHtml(icon)}" class="w-7 h-7 text-mint mb-5"></i>
        <h3 class="font-display text-xl mb-1">${escapeHtml(d.title || "")}</h3>
        <p class="text-mint text-xs mb-3">${escapeHtml(d.subtitle || "")}</p>
        <p class="text-gray text-sm leading-relaxed">${escapeHtml(d.description || "")}</p>
      </div>`;
    }).join("");
    refreshIcons();
  } catch (err) {
    console.warn("[cms] Could not load services from Firestore, showing static content.", err);
  }
}

/* ---------------------------------------------------------------------
   Pricing grid (pricing.html)
--------------------------------------------------------------------- */
async function renderPricing() {
  const grid = document.getElementById("pricingGrid");
  if (!grid || !db) return;
  try {
    const snap = await getDocs(query(collection(db, "pricing"), orderBy("order", "asc")));
    if (snap.empty) return;

    grid.innerHTML = snap.docs.map(docSnap => {
      const d = docSnap.data();
      const features = Array.isArray(d.features) ? d.features : [];
      const featureItems = features.map(f =>
        `<li><i data-lucide="check" class="w-4 h-4 text-mint"></i>${escapeHtml(f)}</li>`
      ).join("");
      const isPopular = !!d.popular;
      return `<div class="price-card${isPopular ? " popular" : ""}">
        ${isPopular ? '<span class="popular-badge">Most Popular</span>' : ""}
        <h3 class="font-display text-lg">${escapeHtml(d.name || "")}</h3>
        <p class="text-gray text-sm mt-2">${escapeHtml(d.description || "")}</p>
        <div class="price-amount"><span>${escapeHtml(d.price || "")}</span>${d.period ? escapeHtml(d.period) : ""}</div>
        <ul class="price-list">${featureItems}</ul>
        <a href="contact.html" class="${isPopular ? "btn-primary-sm" : "btn-glass-sm"} w-full justify-center mt-8">${escapeHtml(d.ctaText || "Get Started")}</a>
      </div>`;
    }).join("");
    refreshIcons();
  } catch (err) {
    console.warn("[cms] Could not load pricing from Firestore, showing static content.", err);
  }
}

/* ---------------------------------------------------------------------
   Testimonials (index.html Swiper)
--------------------------------------------------------------------- */
async function renderTestimonials() {
  const swiperEl = document.querySelector(".testimonialSwiper");
  const wrapper = swiperEl ? swiperEl.querySelector(".swiper-wrapper") : null;
  if (!wrapper || !db) return;
  try {
    const snap = await getDocs(query(collection(db, "testimonials"), orderBy("order", "asc")));
    if (snap.empty) return;

    wrapper.innerHTML = snap.docs.map(docSnap => {
      const t = docSnap.data();
      const stars = '<i data-lucide="star" class="w-4 h-4 text-mint fill-mint"></i>'.repeat(5);
      return `<div class="swiper-slide">
        <div class="glass-card testimonial-card">
          <div class="flex gap-1 mb-5 justify-center">${stars}</div>
          <p class="text-lg md:text-xl leading-relaxed font-body text-offwhite/90">"${escapeHtml(t.quote || "")}"</p>
          <div class="mt-8 flex items-center gap-4 justify-center">
            <div class="avatar-ring">${escapeHtml(t.initials || initials(t.name))}</div>
            <div class="text-left">
              <p class="font-display text-sm">${escapeHtml(t.name || "")}</p>
              <p class="text-gray text-xs">${escapeHtml(t.role || "")}</p>
            </div>
          </div>
        </div>
      </div>`;
    }).join("");
    refreshIcons();

    // Re-init Swiper against the new slides (whether or not script.js already
    // initialized it against the old static ones — order-independent).
    if (swiperEl.swiper) swiperEl.swiper.destroy(true, true);
    if (window.Swiper) {
      new window.Swiper(".testimonialSwiper", {
        loop: true, autoHeight: true, spaceBetween: 24,
        autoplay: { delay: 5500, disableOnInteraction: false },
        pagination: { el: ".swiper-pagination", clickable: true }
      });
    }
  } catch (err) {
    console.warn("[cms] Could not load testimonials from Firestore, showing static content.", err);
  }
}

/* ---------------------------------------------------------------------
   Stats (about.html animated counters)
--------------------------------------------------------------------- */
function animateStatCount(el) {
  const target = parseInt(el.getAttribute("data-count"), 10) || 0;
  const suffix = el.getAttribute("data-suffix") || "";
  const duration = 1600;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(tick);
}

async function renderStats() {
  const grid = document.getElementById("statsGrid");
  if (!grid || !db) return;
  try {
    const snap = await getDocs(query(collection(db, "stats"), orderBy("order", "asc")));
    if (snap.empty) return;

    grid.innerHTML = snap.docs.map(docSnap => {
      const s = docSnap.data();
      return `<div class="stat-card"><div class="stat-number" data-count="${Number(s.number) || 0}" data-suffix="${escapeHtml(s.suffix || "")}">0</div><p class="stat-label">${escapeHtml(s.label || "")}</p></div>`;
    }).join("");

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateStatCount(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    grid.querySelectorAll(".stat-number").forEach(c => io.observe(c));
  } catch (err) {
    console.warn("[cms] Could not load stats from Firestore, showing static content.", err);
  }
}

/* ---------------------------------------------------------------------
   FAQs (pricing.html accordion)
--------------------------------------------------------------------- */
async function renderFaqs() {
  const list = document.getElementById("faqList");
  if (!list || !db) return;
  try {
    const snap = await getDocs(query(collection(db, "faqs"), orderBy("order", "asc")));
    if (snap.empty) return;

    list.innerHTML = snap.docs.map(docSnap => {
      const f = docSnap.data();
      return `<div class="faq-item">
        <button class="faq-question">${escapeHtml(f.question || "")} <i data-lucide="plus" class="w-5 h-5 faq-icon"></i></button>
        <div class="faq-answer"><p>${escapeHtml(f.answer || "")}</p></div>
      </div>`;
    }).join("");
    refreshIcons();
  } catch (err) {
    console.warn("[cms] Could not load FAQs from Firestore, showing static content.", err);
  }
}

/* ---------------------------------------------------------------------
   Contact + newsletter form submissions -> Firestore
   (capture phase so we read values before script.js's handler resets
   the form — this works regardless of <script> tag order)
--------------------------------------------------------------------- */
function wireContactForm() {
  const form = document.getElementById("contactForm");
  if (!form || !db) return;
  document.addEventListener("submit", async (e) => {
    if (e.target !== form || !form.checkValidity()) return;
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      service: form.service ? form.service.value : "",
      message: form.message.value.trim(),
      createdAt: serverTimestamp(),
      read: false
    };
    try {
      await addDoc(collection(db, "submissions"), payload);
    } catch (err) {
      console.warn("[cms] Could not save contact submission to Firestore.", err);
    }
  }, true);
}

function wireNewsletterForms() {
  if (!db) return;
  const forms = document.querySelectorAll("#newsletterForm");
  if (!forms.length) return;
  document.addEventListener("submit", async (e) => {
    if (!Array.from(forms).includes(e.target)) return;
    const input = e.target.querySelector("input[type=email]");
    const email = input ? input.value.trim() : "";
    if (!email) return;
    try {
      await addDoc(collection(db, "newsletter"), { email, createdAt: serverTimestamp() });
    } catch (err) {
      console.warn("[cms] Could not save newsletter signup to Firestore.", err);
    }
  }, true);
}

document.addEventListener("DOMContentLoaded", () => {
  applySiteSettings();
  renderPortfolio();
  renderServices();
  renderPricing();
  renderTestimonials();
  renderStats();
  renderFaqs();
  wireContactForm();
  wireNewsletterForms();
});

/* ==========================================================
   Devan Placements – front-end logic
   1. Paste your deployed Apps Script Web App URL below.
   ========================================================== */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbweiLXX7eHazCMPhLBlmdTpm28O4zuUvElir6pk_rH76oBcuUU8LYaK-eLzmFAbd-33Ag/exec";
const MAX_FILE_MB = 10;
const ALLOWED_EXT = ["pdf", "doc", "docx"];

/* ---------- Content data (edit here, the page re-renders) ---------- */
const COUNTRIES = [
  ["🇸🇬", "High Demand", "Singapore", "Explore eligible opportunities in technical services, construction, hospitality, and logistics."],
  ["🇲🇾", "Active", "Malaysia", "Opportunities in electronics manufacturing, service industries, construction, and plantations."],
  ["🇦🇪", "Top Destination", "United Arab Emirates", "Positions across Dubai & Abu Dhabi in hospitality, facilities management, MEP, and drivers."],
  ["🇸🇦", "Megaprojects", "Saudi Arabia", "Rapid hiring for infrastructure projects, EPC engineering, heavy drivers, and technicians."],
  ["🇶🇦", "Gulf Hub", "Qatar", "Skilled recruitment in industrial maintenance, facilities management, and hospitality."],
  ["🇰🇼", "Active", "Kuwait", "Positions for maintenance technicians, riggers, food retail, and healthcare assistants."],
  ["🇴🇲", "GCC", "Oman", "Opportunities in manufacturing, automotive mechanics, civil engineering, and trade roles."],
  ["🇧🇭", "GCC", "Bahrain", "Vacancies across manufacturing plants, retail, hospitality, logistics, and skilled trades."],
  ["🇮🇪", "Europe", "Ireland", "Critical skills opportunities for chefs, healthcare staff, and industrial electricians."],
  ["🇨🇦", "Americas", "Canada", "Pathways for certified trade professionals, heavy mechanics, and long-haul drivers."],
  ["🇺🇸", "Americas", "USA", "Enquiries for qualified technical specialists, specialty culinary staff, and STEM roles."],
  ["🇪🇺", "Schengen & UK", "Europe", "Seasonal and long-term contracts across Poland, Romania, Croatia, and Malta."],
];

const CATEGORIES = [
  ["🔧", "Skilled Manpower", "Electricians, welders, plumbers, HVAC technicians, instrumentation mechanics, and precision tool makers."],
  ["🏗️", "Construction & Shipyard", "Construction workers, fabricators, fitters, crane riggers, scaffolding crews, and shipyard personnel."],
  ["📐", "Technical & Engineering", "Mechanical, electrical, civil, and industrial engineers, CAD draughtsmen, and QA/QC inspectors."],
  ["🍽️", "Hospitality & F&B", "Executive chefs, kitchen assistants, baristas, waitstaff, front desk associates, and housekeeping staff."],
  ["🚛", "Drivers & Logistics", "Heavy vehicle trailer drivers, forklift operators, dispatch coordinators, warehouse staff, and couriers."],
  ["🏭", "Semi-Skilled & General", "Factory assemblers, packers, agricultural workers, cleaning technicians, and loading assistants."],
];

const JOBS = [
  { code: "JOB-001", country: "Singapore", flag: "🇸🇬", loc: "Singapore 🇸🇬", title: "Senior Electrical Maintenance Technician",
    desc: "Leading contractor seeking licensed technicians for commercial building MEP systems and low-voltage controls.",
    salary: "Competitive / As Per Visa", exp: "3 - 5 Years", expMin: 3, benefits: "Accommodation • Transport • Overtime" },
  { code: "JOB-002", country: "United Arab Emirates", flag: "🇦🇪", loc: "UAE (Dubai) 🇦🇪", title: "Heavy Vehicle Trailer Driver",
    desc: "Logistics conglomerate recruiting experienced tractor-trailer drivers for regional freight distribution routes.",
    salary: "Standard Scale + Allowances", exp: "GCC / Heavy License + 2 Yrs", expMin: 2, benefits: "Accommodation • Medical • Annual Flight" },
  { code: "JOB-003", country: "Saudi Arabia", flag: "🇸🇦", loc: "Saudi Arabia 🇸🇦", title: "Structural Steel Welder / Fabricator",
    desc: "Major EPC contractor seeking certified 3G/4G/6G SMAW and MIG welders for petrochemical structure assembly.",
    salary: "Per Trade Test Scale", exp: "3+ Years Certified", expMin: 3, benefits: "Camp Housing • Food/Mess • Medical" },
  { code: "JOB-004", country: "Malaysia", flag: "🇲🇾", loc: "Malaysia 🇲🇾", title: "Sous Chef & Kitchen Supervisor",
    desc: "Reputed international dining group in Kuala Lumpur hiring experienced supervisors to oversee culinary prep.",
    salary: "Competitive MYR + Service", exp: "4+ Years Kitchen", expMin: 4, benefits: "Duty Meals • Housing Allowance • Permit" },
];

const TESTIMONIALS = [
  ["AK", "Arun Kumar", "MEP Maintenance • Singapore 🇸🇬", "Devan Placements explained the Singapore work visa process with complete clarity. Everything from medical testing to contract terms matched what was discussed on day one."],
  ["MR", "Mansoor Al-Rumaithi", "Operations Director • Dubai, UAE 🇦🇪", "As a contracting firm in UAE, we required 40 certified structural welders on tight notice. Devan Enterprises provided pre-screened, capable candidates who passed trade testing."],
  ["SS", "Saravanan S.", "Culinary Team • Malaysia 🇲🇾", "The communication over WhatsApp and phone was prompt. They guided me through document attestation and paperwork systematically for Malaysia."],
];

/* The Figma frame only had the questions. Answers below are placeholders: review before launch. */
const FAQS = [
  ["How can I apply for overseas jobs?", "Browse the latest vacancies, then complete the Candidate Registration Form and upload your updated resume. Our recruitment officers will review your profile against active employer requirements."],
  ["Which countries does Devan Placements serve?", "We support recruitment across Singapore, Malaysia, the GCC countries, Ireland, Canada, the USA, and selected European destinations. Availability depends on verified employer mandates."],
  ["What documents are required?", "Typically an updated resume, a valid passport, educational and trade certificates, and experience proof. Exact requirements vary by country and employer, and our team will guide you."],
  ["Is work experience mandatory?", "It depends on the role. Skilled and technical positions usually need relevant experience or trade certification, while some semi-skilled roles accept freshers."],
  ["Does registration guarantee employment?", "No. Registration allows our team to evaluate your profile for suitable openings. Selection is made by the employer based on requirements, trade tests, and eligibility."],
  ["Can Devan Placements assist with recruitment documentation?", "Yes. We guide candidates through profile evaluation, trade testing preparation, and the documentation procedures involved in the recruitment process."],
];

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Render sections ---------- */
function renderCountries() {
  $("#country-grid").innerHTML = COUNTRIES.map(([flag, tag, name, text]) => `
    <article class="country">
      <div class="country-top"><span class="flag">${flag}</span><span class="tag">${esc(tag)}</span></div>
      <h3>${esc(name)}</h3><p>${esc(text)}</p>
      <a href="#jobs" data-country="${esc(name)}">Explore Jobs →</a>
    </article>`).join("");

  const options = COUNTRIES.map(([, , name]) => `<option>${esc(name)}</option>`).join("");
  $("#filter-country").insertAdjacentHTML("beforeend", options);
  $("#reg-country").insertAdjacentHTML("beforeend", options);

  // "Explore Jobs" pre-selects the country filter
  $$("#country-grid a").forEach((a) =>
    a.addEventListener("click", () => {
      $("#filter-country").value = a.dataset.country;
      renderJobs();
    })
  );
}

function renderCategories() {
  $("#category-grid").innerHTML = CATEGORIES.map(([icon, title, text]) => `
    <article class="card cat">
      <i class="icon-box">${icon}</i><h3>${esc(title)}</h3><p>${esc(text)}</p>
      <a href="#jobs" data-cat="${esc(title)}">Explore Opportunities →</a>
    </article>`).join("");
  $$("#category-grid a").forEach((a) =>
    a.addEventListener("click", () => {
      const sel = $("select[name='category']");
      const match = [...sel.options].find((o) => o.text === a.dataset.cat);
      if (match) sel.value = match.value;
    })
  );
}

function renderJobs() {
  const title = $("#filter-title").value.trim().toLowerCase();
  const country = $("#filter-country").value;
  const exp = $("#filter-exp").value;

  const list = JOBS.filter((j) => {
    if (title && !(j.title + " " + j.desc).toLowerCase().includes(title)) return false;
    if (country && j.country !== country) return false;
    if (exp === "0-2" && j.expMin > 2) return false;
    if (exp === "3-5" && (j.expMin < 3 || j.expMin > 5)) return false;
    if (exp === "5+" && j.expMin < 5) return false;
    return true;
  });

  $("#job-grid").innerHTML = list.map((j) => `
    <article class="card job" data-code="${j.code}">
      <div>
        <div class="job-top"><span class="code">CODE: ${j.code}</span><span class="loc">${esc(j.loc)}</span></div>
        <h3>${esc(j.title)}</h3>
        <p class="desc">${esc(j.desc)}</p>
        <div class="job-meta">
          <div><small>Salary</small><b>${esc(j.salary)}</b></div>
          <div><small>Experience</small><b>${esc(j.exp)}</b></div>
          <div class="benefits"><small>Benefits</small>${esc(j.benefits)}</div>
        </div>
      </div>
      <div class="job-actions">
        <button class="apply" data-code="${j.code}" data-country="${esc(j.country)}" data-title="${esc(j.title)}">Apply Now</button>
        <button class="details" aria-expanded="false">View Details</button>
      </div>
      <div class="more">Reference <b>${j.code}</b> when you contact our recruitment desk on WhatsApp +91 86810 22518 for the full job brief and requirements.</div>
    </article>`).join("");

  $("#job-empty").hidden = list.length > 0;

  $$(".job .details").forEach((btn) =>
    btn.addEventListener("click", () => {
      const card = btn.closest(".job");
      const open = card.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      btn.textContent = open ? "Hide Details" : "View Details";
    })
  );
  $$(".job .apply").forEach((btn) =>
    btn.addEventListener("click", () => {
      const msg =
        `Hello Devan Placements, I want to apply for ` +
        `${btn.dataset.title} (${btn.dataset.code}) in ${btn.dataset.country}.`;
      window.open(
        "https://wa.me/919551110777?text=" + encodeURIComponent(msg),
        "_blank",
        "noopener"
      );
    })
  );
}

function renderTestimonials() {
  $("#testimonial-grid").innerHTML = TESTIMONIALS.map(([init, name, role, text]) => `
    <article class="card quote">
      <div><span class="mark">“</span><p>${esc(text)}</p></div>
      <div class="who"><b>${init}</b><div><strong>${esc(name)}</strong><span>${esc(role)}</span></div></div>
    </article>`).join("");
}

function renderFaq() {
  $("#faq-list").innerHTML = FAQS.map(([q, a]) =>
    `<details class="faq-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");
  // keep only one open at a time
  $$(".faq-item").forEach((d) =>
    d.addEventListener("toggle", () => {
      if (d.open) $$(".faq-item").forEach((o) => o !== d && (o.open = false));
    })
  );
}

/* ---------- Navigation ---------- */
function initNav() {
  const toggle = $(".nav-toggle");
  const menu = $("#nav-menu");
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  $$("#nav-menu a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("open")));
}

/* ---------- File upload (drag & drop) ---------- */
let resumeFile = null;

function validateFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) return "Please upload a PDF, DOC or DOCX file.";
  if (file.size > MAX_FILE_MB * 1024 * 1024) return `File is larger than ${MAX_FILE_MB}MB.`;
  return "";
}

function setResume(file) {
  const status = $("#candidate-form .form-status");
  const error = validateFile(file);
  if (error) {
    resumeFile = null;
    $("#dz-text").innerHTML = "Drag &amp; Drop Your Resume Here or <u>Browse Files</u>";
    showStatus(status, error, "err");
    return;
  }
  resumeFile = file;
  $("#dz-text").textContent = `📎 ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
  showStatus(status, "", "");
}

function initDropzone() {
  const zone = $("#dropzone");
  const input = $("#resume");
  input.addEventListener("change", () => input.files[0] && setResume(input.files[0]));
  ["dragenter", "dragover"].forEach((ev) =>
    zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add("drag"); }));
  ["dragleave", "drop"].forEach((ev) =>
    zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove("drag"); }));
  zone.addEventListener("drop", (e) => e.dataTransfer.files[0] && setResume(e.dataTransfer.files[0]));
}

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });

/* ---------- Forms → Google Apps Script ---------- */
function showStatus(el, msg, type) {
  el.textContent = msg;
  el.className = "form-status" + (type ? " " + type : "");
}

function validateForm(form) {
  let ok = true;
  $$("input, select, textarea", form).forEach((el) => {
    el.classList.remove("invalid");
    if (el.type === "file") return;
    const empty = el.type === "checkbox" ? !el.checked : !el.value.trim();
    const badEmail = el.type === "email" && el.value && !/^\S+@\S+\.\S+$/.test(el.value);
    const badPhone = el.type === "tel" && el.value && !/^[+\d][\d\s\-()]{6,}$/.test(el.value);
    if ((el.required && empty) || badEmail || badPhone) {
      el.classList.add("invalid");
      ok = false;
    }
  });
  return ok;
}

async function submitToSheet(payload) {
  if (SCRIPT_URL.startsWith("PASTE_")) throw new Error("Set SCRIPT_URL in script.js first.");
  // text/plain avoids the CORS preflight that Apps Script cannot answer
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.result !== "success") throw new Error(data.message || "Server error");
  return data;
}

function bindForm(formId, formType, { beforeSend, onDone, successMsg }) {
  const form = $(formId);
  const status = $(".form-status", form);
  const btn = $("button[type='submit']", form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return showStatus(status, "Please fill the highlighted fields correctly.", "err");

    const payload = Object.fromEntries(new FormData(form).entries());
    delete payload.resume;
    payload.formType = formType;
    payload.pageUrl = location.href;

    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending...";
    showStatus(status, "", "");

    try {
      if (beforeSend) await beforeSend(payload);
      await submitToSheet(payload);
      showStatus(status, successMsg, "ok");
      form.reset();
      onDone && onDone();
    } catch (err) {
      console.error(err);
      showStatus(status, err.message.includes("SCRIPT_URL") ? err.message : "Something went wrong. Please try again or contact us on WhatsApp.", "err");
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
}

function initForms() {
  bindForm("#candidate-form", "candidate", {
    successMsg: "Application received. Our recruitment desk will contact you shortly.",
    beforeSend: async (payload) => {
      if (!resumeFile) throw new Error("Please upload your resume (PDF, DOC or DOCX).");
      payload.resumeName = resumeFile.name;
      payload.resumeMime = resumeFile.type || "application/octet-stream";
      payload.resumeBase64 = await fileToBase64(resumeFile);
    },
    onDone: () => {
      resumeFile = null;
      $("#dz-text").innerHTML = "Drag &amp; Drop Your Resume Here or <u>Browse Files</u>";
    },
  });
  bindForm("#employer-form", "employer", { successMsg: "Enquiry sent. Our corporate desk will respond promptly." });
  bindForm("#contact-form", "contact", { successMsg: "Message sent. We will get back to you soon." });
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  renderCountries();
  renderCategories();
  renderJobs();
  renderTestimonials();
  renderFaq();
  initNav();
  initDropzone();
  initForms();
  $("#job-filter").addEventListener("submit", (e) => { e.preventDefault(); renderJobs(); });
  ["#filter-title", "#filter-country", "#filter-exp"].forEach((s) => $(s).addEventListener("input", renderJobs));
});

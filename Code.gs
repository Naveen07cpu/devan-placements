/**
 * Devan Placements – Google Apps Script backend
 *
 * Handles three forms sent from script.js:
 *   formType = "candidate"  -> sheet "Candidates"  (+ resume saved to Drive)
 *   formType = "employer"   -> sheet "Employers"
 *   formType = "contact"    -> sheet "Contacts"
 *
 * Setup: open a Google Sheet -> Extensions -> Apps Script -> paste this file.
 * Then run setup() once (authorize), and deploy as a Web App.
 */

const NOTIFY_EMAIL = "devanplacements@gmail.com";   // gets an email for every submission
const RESUME_FOLDER_NAME = "Devan Placements - Resumes";
const MAX_RESUME_BYTES = 5 * 1024 * 1024;           // 5 MB
const ALLOWED_EXT = ["pdf", "doc", "docx"];

const SHEETS = {
  candidate: {
    name: "Candidates",
    headers: ["Timestamp", "Full Name", "Phone", "Email", "Location", "Preferred Country",
              "Job Category", "Qualification", "Experience", "Job Role", "Resume Link", "Consent", "Page URL"],
    row: (d, resumeUrl) => [new Date(), d.fullName, d.phone, d.email, d.location, d.country,
                            d.category, d.qualification, d.experience, d.jobRole, resumeUrl,
                            d.consent ? "Yes" : "No", d.pageUrl],
    subject: (d) => "New candidate: " + d.fullName + " (" + d.country + ")",
  },
  employer: {
    name: "Employers",
    headers: ["Timestamp", "Company", "Contact Person", "Country", "Email", "Phone",
              "Required Positions", "Number of Workers", "Requirements", "Page URL"],
    row: (d) => [new Date(), d.company, d.contactPerson, d.country, d.email, d.phone,
                 d.positions, d.workers, d.requirements, d.pageUrl],
    subject: (d) => "New employer enquiry: " + d.company + " (" + d.country + ")",
  },
  contact: {
    name: "Contacts",
    headers: ["Timestamp", "Name", "Email", "Phone", "Enquiry Type", "Message", "Page URL"],
    row: (d) => [new Date(), d.name, d.email, d.phone, d.enquiryType, d.message, d.pageUrl],
    subject: (d) => "New message (" + d.enquiryType + ") from " + d.name,
  },
};

/** Run once from the editor: creates the sheets with header rows and the Drive folder. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(function (key) {
    getSheet_(ss, SHEETS[key]);
  });
  getResumeFolder_();
  const first = ss.getSheetByName("Sheet1");
  if (first && first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const data = JSON.parse(e.postData.contents);
    const cfg = SHEETS[data.formType];
    if (!cfg) return json_({ result: "error", message: "Unknown form type" });

    const errors = validate_(data);
    if (errors) return json_({ result: "error", message: errors });

    let resumeUrl = "";
    if (data.formType === "candidate") resumeUrl = saveResume_(data);

    const sheet = getSheet_(SpreadsheetApp.getActiveSpreadsheet(), cfg);
    sheet.appendRow(cfg.row(data, resumeUrl));

    notify_(cfg, data, resumeUrl);
    return json_({ result: "success" });
  } catch (err) {
    return json_({ result: "error", message: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("Devan Placements web app is running.");
}

/* ---------------- helpers ---------------- */

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet_(ss, cfg) {
  let sheet = ss.getSheetByName(cfg.name);
  if (!sheet) {
    sheet = ss.insertSheet(cfg.name);
    sheet.appendRow(cfg.headers);
    sheet.getRange(1, 1, 1, cfg.headers.length).setFontWeight("bold").setBackground("#0b1f3a").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getResumeFolder_() {
  const it = DriveApp.getFoldersByName(RESUME_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(RESUME_FOLDER_NAME);
}

function validate_(d) {
  const email = /^\S+@\S+\.\S+$/;
  const need = {
    candidate: ["fullName", "phone", "email", "location", "country", "category", "qualification", "experience"],
    employer: ["company", "contactPerson", "country", "email", "phone", "positions", "workers"],
    contact: ["name", "email", "phone", "enquiryType", "message"],
  }[d.formType];
  for (let i = 0; i < need.length; i++) {
    if (!d[need[i]] || !String(d[need[i]]).trim()) return "Missing field: " + need[i];
  }
  if (!email.test(d.email)) return "Invalid email address";
  if (d.formType === "candidate" && !d.resumeBase64) return "Resume is required";
  return "";
}

function saveResume_(d) {
  const ext = String(d.resumeName || "").split(".").pop().toLowerCase();
  if (ALLOWED_EXT.indexOf(ext) === -1) throw new Error("Only PDF, DOC or DOCX resumes are allowed.");

  const bytes = Utilities.base64Decode(d.resumeBase64);
  if (bytes.length > MAX_RESUME_BYTES) throw new Error("Resume is larger than 5MB.");

  const safeName = String(d.fullName).replace(/[^\w\- ]/g, "").trim().replace(/\s+/g, "_");
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");
  const blob = Utilities.newBlob(bytes, d.resumeMime || "application/octet-stream", safeName + "_" + stamp + "." + ext);
  const file = getResumeFolder_().createFile(blob);
  return file.getUrl();
}

function notify_(cfg, d, resumeUrl) {
  const skip = ["resumeBase64", "resumeMime", "pageUrl", "formType"];
  const lines = Object.keys(d)
    .filter(function (k) { return skip.indexOf(k) === -1; })
    .map(function (k) { return k + ": " + d[k]; });
  if (resumeUrl) lines.push("Resume: " + resumeUrl);
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: d.email,
    subject: cfg.subject(d),
    body: lines.join("\n"),
  });
}

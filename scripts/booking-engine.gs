/**
 * Google Apps Script: Autonomous Systems Architecture Booking & Communications Inlet Relay Engine
 * 
 * Host: Saheed Olaide (@sirsahol) — Principal Systems Architect
 * Client Surfaces:
 *   - sirsahol.github.io/meet (Synchronous booking & Google Calendar reservation)
 *   - sirsahol.github.io/#contact (Asynchronous Technical Brief Inlet)
 *   - sirsahol.github.io modal (Pop-out Technical Brief Dialog)
 * 
 * Security & Relay Architecture:
 *   - Acts as private zero-trust relay shielding internal notification endpoints.
 *   - All secrets, tokens, webhooks, and spreadsheet IDs are stored in Script Properties.
 *   - Form submissions are sanitized, recorded in Google Sheets, and dispatched to mobile push rails.
 * 
 * Mobile Push Notification Rails Supported:
 *   1. ntfy.sh (Recommended for iOS/macOS/Android: Instant lock-screen push alerts via free ntfy app)
 *   2. Telegram Bot (Instant push alert to Telegram on iPhone, Apple Watch, Mac, Android)
 *   3. Dedicated Webhook (Private Discord channel, Slack, or Google Chat incoming webhook)
 *   4. Direct Priority Email (via MailApp.sendEmail to sirsahol@gmail.com)
 * 
 * Setup Instructions:
 * 1. Open Google Drive -> New -> Google Sheets (name it: "Advisory Booking & Inquiries Ledger")
 * 2. In Sheet 1 (rename to "Ledger"), set Row 1 headers:
 *    Timestamp | Email | Name | Topic | SlotStart | Tier | PaystackRef | MeetURL | Status | EventId
 * 3. Extensions -> Apps Script
 * 4. Paste this script into Code.gs
 * 5. Project Settings (Gear icon) -> Script Properties -> Add Property:
 *    - SPREADSHEET_ID: <Google Sheet ID from URL: /d/<ID>/edit>
 *    - NOTIFICATION_EMAIL: sirsahol@gmail.com
 *    - (Optional Mobile Push Rail A) NTFY_TOPIC: <your-private-topic-name> e.g. sirsahol-brief-alerts-7x
 *    - (Optional Mobile Push Rail B) TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID
 *    - (Optional Mobile Push Rail C) MOBILE_NOTIFY_WEBHOOK: <your-dedicated-webhook-url>
 * 6. Deploy -> New Deployment -> Web App -> Execute as: Me -> Who has access: Anyone
 * 7. Copy the deployed Web App URL and set SCRIPT_WEBAPP_URL in sirsahol.github.io components.
 */

var CONFIG = {
  SPREADSHEET_ID: "", // Fallback if not configured in Script Properties
  SHEET_NAME: "Ledger",
  INQUIRIES_SHEET_NAME: "Inquiries",
  NOTIFICATION_EMAIL: "sirsahol@gmail.com",
  TIMEZONE: "GMT+3", // Istanbul/East Africa timezone
  FALLBACK_MEET_URL: "https://meet.google.com/znh-vypq-rvw", // Default Google Meet room URL
  WORKING_HOURS_START: 11, // 11:00 AM
  WORKING_HOURS_END: 19,   // 7:00 PM
  SLOT_DURATION_MINUTES: 30,
  FREE_SESSION_DURATION: 20,
  PAID_SESSION_DURATION: 45
};

/**
 * HTTP GET Router
 */
function doGet(e) {
  var params = (e && e.parameter) || {};
  var action = params.action || "health";
  var response = {};

  try {
    if (action === "check") {
      var email = (params.email || "").trim().toLowerCase();
      if (!email) {
        response = { error: "Email parameter required" };
      } else {
        var count = getSessionCountForEmail(email);
        response = {
          email: email,
          session_count: count,
          eligible_for_free: count === 0
        };
      }
    } else if (action === "availability") {
      response = getAvailableSlots();
    } else {
      response = {
        status: "ready",
        service: "autonomous-booking-and-inlet-engine",
        version: "2.0.0",
        endpoints: ["check", "availability", "doPost(booking)", "doPost(inlet_brief)"]
      };
    }
  } catch (err) {
    response = { error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * HTTP POST Router
 * Routes between Synchronous Calendar Booking and Asynchronous Technical Brief Ingestion
 */
function doPost(e) {
  var data = {};
  try {
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Route 1: Asynchronous Technical Brief Inlet
    if (data.action === "inlet_brief" || (data.message && (data.track || data.firstName || data.organization))) {
      return handleInletBrief(data);
    }

    // Route 2: Synchronous Architecture Booking Reservation
    return handleCalendarBooking(data);

  } catch (err) {
    return errorResponse("Handler error: " + err.toString());
  }
}

/**
 * Handles Asynchronous Technical Brief Submissions from sirsahol.github.io
 */
function handleInletBrief(data) {
  var firstName = (data.firstName || "").trim();
  var lastName = (data.lastName || "").trim();
  var fullName = (data.fullName || (firstName ? (firstName + " " + lastName).trim() : data.name) || "Anonymous Client").trim();
  var email = (data.email || "").trim().toLowerCase();
  var org = (data.organization || data.org || "Independent").trim();
  var track = (data.track || "General Systems Architecture").trim();
  var message = (data.message || data.brief || "").trim();
  var source = (data.source || "sirsahol.github.io/contact-inlet").trim();
  var timestamp = new Date();

  if (!email || !message) {
    return errorResponse("Missing required fields: email and message are mandatory.");
  }

  var entry = {
    timestamp: timestamp,
    fullName: fullName,
    email: email,
    org: org,
    track: track,
    message: message,
    source: source
  };

  // 1. Persist to "Inquiries" Sheet Tab in Google Spreadsheet
  logInquiryToSheet(entry);

  // 2. Dispatch Mobile Push Alerts (Apple / iOS / Android / macOS)
  dispatchMobilePushAlert(entry);

  // 3. Dispatch Priority Email Notification to Owner
  sendInletEmailAlert(entry);

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: "Technical brief received, ledger updated, and mobile push notifications dispatched.",
    inquiry: {
      name: fullName,
      email: email,
      track: track,
      timestamp: timestamp.toISOString()
    }
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles Synchronous Calendar Booking Reservations from /meet
 */
function handleCalendarBooking(data) {
  var email = (data.email || "").trim().toLowerCase();
  var name = (data.name || "").trim();
  var topic = (data.topic || "General Architecture Advisory").trim();
  var slotStartStr = data.slot_start;
  var tier = data.tier || "free_intro"; // free_intro | paid_advisory
  var paystackRef = (data.paystack_ref || "").trim();

  if (!email || !name || !slotStartStr) {
    return errorResponse("Missing required fields: email, name, slot_start");
  }

  // Fair Use Policy Enforcement
  var previousCount = getSessionCountForEmail(email);
  if (tier === "free_intro" && previousCount > 0) {
    return errorResponse("Complimentary 20-min briefing already redeemed for this email. Subsequent advisory sessions require paid booking.");
  }

  if (tier === "paid_advisory" && !paystackRef) {
    return errorResponse("Paid advisory sessions require a valid Paystack payment reference.");
  }

  var startDate = new Date(slotStartStr);
  if (isNaN(startDate.getTime())) {
    return errorResponse("Invalid slot_start timestamp");
  }

  var durationMinutes = (tier === "free_intro") ? CONFIG.FREE_SESSION_DURATION : CONFIG.PAID_SESSION_DURATION;
  var endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  var calendar = CalendarApp.getDefaultCalendar();
  var title = "Architecture Briefing — Saheed Olaide & " + name;
  var meetUrl = CONFIG.FALLBACK_MEET_URL;

  var description = [
    "Systems Architecture & Technical Advisory Briefing",
    "--------------------------------------------------",
    "Principal Systems Architect: Saheed Olaide",
    "Client / Collaborator: " + name + " (" + email + ")",
    "Engagement Scope: " + topic,
    "Session Tier: " + (tier === "free_intro" ? "Complimentary 20-Min Architecture Briefing" : "Standard 45-Min Technical Advisory"),
    tier === "paid_advisory" ? "Paystack Reference: " + paystackRef : "Entitlement: Complimentary 1st Session",
    "",
    "Google Meet Room: " + meetUrl,
    "",
    "Rescheduling Policy: Up to 24 hours prior via reply to this calendar invitation."
  ].join("\n");

  var event = calendar.createEvent(title, startDate, endDate, {
    description: description,
    location: meetUrl,
    guests: email,
    sendInvites: true
  });

  logBookingToSheet({
    timestamp: new Date(),
    email: email,
    name: name,
    topic: topic,
    slotStart: startDate.toISOString(),
    tier: tier,
    paystackRef: paystackRef || "COMPLIMENTARY",
    meetUrl: meetUrl,
    status: "CONFIRMED",
    eventId: event.getId()
  });

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    event_id: event.getId(),
    meet_url: meetUrl,
    title: title,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    tier: tier
  })).setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Returns active Spreadsheet ID from Script Properties or CONFIG
 */
function getSpreadsheetId() {
  try {
    var propId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    if (propId) return propId.trim();
  } catch (e) {
    Logger.log("Failed to read SPREADSHEET_ID from Script Properties: " + e);
  }
  return CONFIG.SPREADSHEET_ID || "";
}

/**
 * Logs an inlet technical brief to the "Inquiries" sheet tab
 */
function logInquiryToSheet(entry) {
  var ssId = getSpreadsheetId();
  if (!ssId) {
    Logger.log("Notice: SPREADSHEET_ID not configured. Skipping sheet ledger append.");
    return;
  }

  try {
    var ss = SpreadsheetApp.openById(ssId);
    var sheetName = CONFIG.INQUIRIES_SHEET_NAME || "Inquiries";
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow([
        "Timestamp",
        "Full Name",
        "Email",
        "Organization",
        "Inquiry Track",
        "Message / Scope",
        "Source",
        "Status"
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      entry.timestamp,
      entry.fullName,
      entry.email,
      entry.org,
      entry.track,
      entry.message,
      entry.source,
      "NEW"
    ]);
  } catch (err) {
    Logger.log("Error logging inquiry to sheet: " + err);
  }
}

/**
 * Dispatches instant mobile push notifications across configured rails
 */
function dispatchMobilePushAlert(entry) {
  var props = PropertiesService.getScriptProperties();
  var ntfyTopic = (props.getProperty("NTFY_TOPIC") || "").trim();
  var mobileWebhook = (props.getProperty("MOBILE_NOTIFY_WEBHOOK") || "").trim();
  var tgToken = (props.getProperty("TELEGRAM_BOT_TOKEN") || "").trim();
  var tgChatId = (props.getProperty("TELEGRAM_CHAT_ID") || "").trim();

  // Rail 1: ntfy.sh (Apple iOS / macOS / Android instant lock-screen alert)
  var resolvedNtfyTopic = ntfyTopic;
  if (!resolvedNtfyTopic && mobileWebhook.indexOf("ntfy.sh/") !== -1) {
    resolvedNtfyTopic = mobileWebhook.split("ntfy.sh/")[1].split("?")[0].trim();
  }

  if (resolvedNtfyTopic) {
    try {
      UrlFetchApp.fetch("https://ntfy.sh/" + resolvedNtfyTopic, {
        method: "post",
        headers: {
          "Title": "⚡ Brief: " + entry.track,
          "Priority": "urgent",
          "Tags": "briefcase,zap",
          "Click": "https://sirsahol.github.io"
        },
        payload: "Client: " + entry.fullName + " (" + entry.email + ")\nOrg: " + entry.org + "\n\nScope:\n" + entry.message,
        muteHttpExceptions: true
      });
    } catch (ntfyErr) {
      Logger.log("ntfy.sh alert failed: " + ntfyErr);
    }
  }

  // Rail 2: Telegram Bot (Native push to iPhone, iPad, Mac, Android)
  if (tgToken && tgChatId) {
    try {
      var tgText = "⚡ *New Technical Brief Received*\n\n" +
        "👤 *Client:* " + escapeTg(entry.fullName) + "\n" +
        "📧 *Email:* " + escapeTg(entry.email) + "\n" +
        "🏢 *Org:* " + escapeTg(entry.org) + "\n" +
        "🎯 *Track:* " + escapeTg(entry.track) + "\n" +
        "🌐 *Source:* " + escapeTg(entry.source) + "\n\n" +
        "📝 *Brief Scope:*\n" + escapeTg(entry.message);

      UrlFetchApp.fetch("https://api.telegram.org/bot" + tgToken + "/sendMessage", {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify({
          chat_id: tgChatId,
          text: tgText,
          parse_mode: "Markdown"
        }),
        muteHttpExceptions: true
      });
    } catch (tgErr) {
      Logger.log("Telegram alert failed: " + tgErr);
    }
  }

  // Rail 3: Dedicated Custom / Discord / Slack / Google Chat Webhook
  if (mobileWebhook && mobileWebhook.indexOf("ntfy.sh") === -1) {
    try {
      if (mobileWebhook.indexOf("discord.com") !== -1) {
        var discordPayload = {
          username: "Portfolio Communications Inlet",
          avatar_url: "https://sirsahol.github.io/favicon.svg",
          embeds: [{
            title: "⚡ Technical Systems Inquiry: " + entry.track,
            color: 0x0284c7,
            fields: [
              { name: "Client Name", value: entry.fullName, inline: true },
              { name: "Work Email", value: entry.email, inline: true },
              { name: "Organization", value: entry.org, inline: true },
              { name: "Inquiry Track", value: entry.track, inline: false },
              { name: "Technical Scope & Context", value: entry.message.length > 1024 ? entry.message.substring(0, 1020) + "..." : entry.message }
            ],
            footer: { text: "Verified delivery via sirsahol.github.io communications inlet" },
            timestamp: new Date().toISOString()
          }]
        };

        UrlFetchApp.fetch(mobileWebhook, {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(discordPayload),
          muteHttpExceptions: true
        });
      } else {
        // Slack / Google Chat / Generic Webhook
        UrlFetchApp.fetch(mobileWebhook, {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify({
            text: "⚡ *New Technical Brief*: " + entry.track + " from " + entry.fullName + " (" + entry.email + ")\n" + entry.message
          }),
          muteHttpExceptions: true
        });
      }
    } catch (webhookErr) {
      Logger.log("Webhook alert failed: " + webhookErr);
    }
  }
}

/**
 * Dispatches priority email alert directly to owner
 */
function sendInletEmailAlert(entry) {
  var props = PropertiesService.getScriptProperties();
  var recipient = (props.getProperty("NOTIFICATION_EMAIL") || CONFIG.NOTIFICATION_EMAIL || "sirsahol@gmail.com").trim();

  try {
    MailApp.sendEmail({
      to: recipient,
      replyTo: entry.email,
      subject: "[URGENT] New Technical Brief: " + entry.track + " — " + entry.fullName,
      body: [
        "URGENT: Technical Brief Received via sirsahol.github.io",
        "=======================================================",
        "",
        "Client Name:  " + entry.fullName,
        "Email:        " + entry.email,
        "Organization: " + entry.org,
        "Inquiry Track:" + entry.track,
        "Source:       " + entry.source,
        "Timestamp:    " + entry.timestamp.toUTCString(),
        "",
        "Scope & Context:",
        "-------------------------------------------------------",
        entry.message,
        "",
        "-------------------------------------------------------",
        "Reply directly to this email to contact " + entry.fullName + " (" + entry.email + ")."
      ].join("\n")
    });
  } catch (err) {
    Logger.log("Email dispatch failed: " + err);
  }
}

function escapeTg(str) {
  if (!str) return "";
  return str.replace(/([_*\[\]()~`>#+=|{}.!-])/g, "\\$1");
}

function getSessionCountForEmail(email) {
  var ssId = getSpreadsheetId();
  if (!ssId) return 0;
  try {
    var ss = SpreadsheetApp.openById(ssId);
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return 0;

    var count = 0;
    for (var i = 1; i < data.length; i++) {
      var rowEmail = String(data[i][1] || "").trim().toLowerCase();
      var status = String(data[i][8] || "").toUpperCase();
      if (rowEmail === email && status !== "CANCELLED") {
        count++;
      }
    }
    return count;
  } catch (e) {
    Logger.log("Error querying sheet: " + e);
    return 0;
  }
}

function logBookingToSheet(entry) {
  var ssId = getSpreadsheetId();
  if (!ssId) return;
  try {
    var ss = SpreadsheetApp.openById(ssId);
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getSheets()[0];
    sheet.appendRow([
      entry.timestamp,
      entry.email,
      entry.name,
      entry.topic,
      entry.slotStart,
      entry.tier,
      entry.paystackRef,
      entry.meetUrl,
      entry.status,
      entry.eventId
    ]);
  } catch (e) {
    Logger.log("Failed to append booking row to sheet: " + e);
  }
}

function getAvailableSlots() {
  var now = new Date();
  var slots = [];
  var dayOffsets = [1, 2, 3, 4, 5, 8, 9];

  for (var i = 0; i < dayOffsets.length; i++) {
    var day = new Date(now.getTime() + dayOffsets[i] * 24 * 60 * 60 * 1000);
    var dayOfWeek = day.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    var slotTimes = [11, 14, 16, 17];
    for (var j = 0; j < slotTimes.length; j++) {
      var slotDate = new Date(day);
      slotDate.setHours(slotTimes[j], 0, 0, 0);

      var slotHash = (dayOffsets[i] * 7 + slotTimes[j]) % 5;
      var isOpen = (slotHash === 1 || (dayOffsets[i] === 2 && slotTimes[j] === 14));

      slots.push({
        start: slotDate.toISOString(),
        status: isOpen ? "open" : "reserved"
      });
    }
  }

  return {
    timezone: CONFIG.TIMEZONE,
    slots: slots
  };
}

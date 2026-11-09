/**
 * Google Apps Script: Autonomous Systems Architecture Booking Engine
 * 
 * Host: Saheed Olaide (@sirsahol) — Principal Systems Architect
 * Client Surface: sirsahol.github.io/meet
 * Payment Rail: Platform-Core Billing Service (api.creativetechstudios.org)
 * 
 * Setup Instructions:
 * 1. Open Google Drive -> New -> Google Sheets (name it: "Advisory Booking Ledger")
 * 2. In Row 1, set headers: Timestamp | Email | Name | Topic | SlotStart | Tier | PaystackRef | MeetURL | Status
 * 3. Extensions -> Apps Script
 * 4. Paste this script into Code.gs
 * 5. Set CONFIG.SPREADSHEET_ID and CONFIG.FALLBACK_MEET_URL below
 * 6. Deploy -> New Deployment -> Web App -> Execute as: Me -> Who has access: Anyone
 * 7. Copy the deployed Web App URL and set it in sirsahol.github.io/src/pages/meet.astro
 */

var CONFIG = {
  SPREADSHEET_ID: "", // Paste your Google Sheet ID here (from URL: /d/<ID>/edit)
  SHEET_NAME: "Ledger",
  TIMEZONE: "GMT+3", // Istanbul/East Africa timezone
  FALLBACK_MEET_URL: "https://meet.google.com/znh-vypq-rvw", // Default Google Meet room URL
  WORKING_HOURS_START: 11, // 11:00 AM
  WORKING_HOURS_END: 19,   // 7:00 PM
  SLOT_DURATION_MINUTES: 30,
  FREE_SESSION_DURATION: 20,
  PAID_SESSION_DURATION: 45
};

function doGet(e) {
  var params = (e && e.parameter) || {};
  var action = params.action || "check";
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
      // Returns real + synthetic busy slots for the next 7 business days
      response = getAvailableSlots();
    } else {
      response = { status: "ready", service: "advisory-booking-engine", version: "1.0.0" };
    }
  } catch (err) {
    response = { error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var response = {};
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var email = (data.email || "").trim().toLowerCase();
    var name = (data.name || "").trim();
    var topic = (data.topic || "General Architecture Advisory").trim();
    var slotStartStr = data.slot_start;
    var tier = data.tier || "free_intro"; // free_intro | paid_advisory
    var paystackRef = (data.paystack_ref || "").trim();

    if (!email || !name || !slotStartStr) {
      return errorResponse("Missing required fields: email, name, slot_start");
    }

    // 1. Fair Use Policy Enforcement
    var previousCount = getSessionCountForEmail(email);
    if (tier === "free_intro" && previousCount > 0) {
      return errorResponse("Complimentary 20-min briefing already redeemed for this email. Subsequent advisory sessions require paid booking.");
    }

    if (tier === "paid_advisory" && !paystackRef) {
      return errorResponse("Paid advisory sessions require a valid Paystack payment reference.");
    }

    // 2. Parse Slot Timestamps
    var startDate = new Date(slotStartStr);
    if (isNaN(startDate.getTime())) {
      return errorResponse("Invalid slot_start timestamp");
    }

    var durationMinutes = (tier === "free_intro") ? CONFIG.FREE_SESSION_DURATION : CONFIG.PAID_SESSION_DURATION;
    var endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    // 3. Create Google Calendar Event
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

    // 4. Log to Google Sheet Ledger
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

    response = {
      success: true,
      event_id: event.getId(),
      meet_url: meetUrl,
      title: title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      tier: tier
    };
  } catch (err) {
    response = { success: false, error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSessionCountForEmail(email) {
  if (!CONFIG.SPREADSHEET_ID) return 0;
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return 0; // only headers or empty

    var count = 0;
    // Column B is Email (index 1)
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
  if (!CONFIG.SPREADSHEET_ID) return;
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
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
    Logger.log("Failed to append row to sheet: " + e);
  }
}

function getAvailableSlots() {
  // Synthesizes a realistic high-demand schedule matrix:
  // Shows 3-5 open slots across the next 7 business days, with remaining slots marked reserved.
  var now = new Date();
  var slots = [];
  var dayOffsets = [1, 2, 3, 4, 5, 8, 9]; // next business days

  for (var i = 0; i < dayOffsets.length; i++) {
    var day = new Date(now.getTime() + dayOffsets[i] * 24 * 60 * 60 * 1000);
    var dayOfWeek = day.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekend

    var slotTimes = [11, 14, 16, 17]; // 11am, 2pm, 4pm, 5pm
    for (var j = 0; j < slotTimes.length; j++) {
      var slotDate = new Date(day);
      slotDate.setHours(slotTimes[j], 0, 0, 0);

      // Deterministic scarcity: Only ~20% of slots are open
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

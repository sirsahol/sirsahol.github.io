/**
 * Form Normalization & Sanitization Pipeline
 * Modeled after admin-scaffold-protocol (core/backend/normalization-pipeline.ts)
 * 
 * Strict 3-Phase Invariant:
 * 1. Normalization: whitespace trimming, NFC unicode, lowercase email
 * 2. Sanitization: control character stripping, XSS prevention
 * 3. Validation: boundary checking (min/max lengths, RFC email regex, Unicode name regex)
 */

export const NAME_REGEX = /^[\p{L}\p{M}'-]+(?:\.|\s[\p{L}\p{M}'-]+|\.[\p{L}\p{M}'-]+)*$/u;
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function normalizeWhitespace(val: string): string {
  return val.trim().replace(/\s+/g, " ");
}

export function normalizeName(val: string): string {
  return normalizeWhitespace(val.normalize("NFC"));
}

export function normalizeEmail(val: string): string {
  return val.trim().toLowerCase();
}

export function stripControlChars(val: string): string {
  return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export function sanitizeText(val: string): string {
  return stripControlChars(val)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
}

export interface InletFormInput {
  firstName: string;
  lastName: string;
  email: string;
  organization?: string;
  track: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  normalizedData: InletFormInput;
}

export function validateInletForm(raw: {
  firstName?: string;
  lastName?: string;
  email?: string;
  organization?: string;
  track?: string;
  message?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  // Phase 1 & 2: Normalize & Sanitize
  const firstName = sanitizeText(normalizeName(raw.firstName || ""));
  const lastName = sanitizeText(normalizeName(raw.lastName || ""));
  const email = normalizeEmail(raw.email || "");
  const organization = sanitizeText(normalizeWhitespace(raw.organization || ""));
  const track = sanitizeText(normalizeWhitespace(raw.track || "Fractional Systems Architecture"));
  const message = sanitizeText(stripControlChars((raw.message || "").trim()));

  // Phase 3: Validate
  if (!firstName || firstName.length < 2) {
    errors.firstName = "First name must be at least 2 characters.";
  } else if (firstName.length > 50) {
    errors.firstName = "First name cannot exceed 50 characters.";
  } else if (!NAME_REGEX.test(firstName)) {
    errors.firstName = "First name contains invalid characters.";
  }

  if (!lastName || lastName.length < 2) {
    errors.lastName = "Last name must be at least 2 characters.";
  } else if (lastName.length > 50) {
    errors.lastName = "Last name cannot exceed 50 characters.";
  } else if (!NAME_REGEX.test(lastName)) {
    errors.lastName = "Last name contains invalid characters.";
  }

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Please provide a valid work or professional email address.";
  }

  if (organization && organization.length > 100) {
    errors.organization = "Organization cannot exceed 100 characters.";
  }

  if (!message || message.length < 20) {
    errors.message = "Technical brief must be at least 20 characters to provide context.";
  } else if (message.length > 5000) {
    errors.message = "Technical brief cannot exceed 5,000 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData: {
      firstName,
      lastName,
      email,
      organization,
      track,
      message,
    },
  };
}

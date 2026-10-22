export type WifiPayload = {
  networkName: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden: boolean;
};

export type ContactPayload = {
  name: string;
  phone: string;
  email: string;
  organization: string;
};

export type EmailPayload = {
  email: string;
  subject: string;
  message: string;
};

export type SmsPayload = {
  phone: string;
  message: string;
};

export type LocationPayload = {
  latitude: string;
  longitude: string;
};

function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

function clean(value: string): string {
  return value.trim();
}

export function buildUrl(value: string): string {
  const url = clean(value);

  if (!url) return "";

  // Add HTTPS when the user enters a domain without a scheme.
  if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url)) {
    return `https://${url}`;
  }

  return url;
}

export function buildText(value: string): string {
  return clean(value);
}

export function buildWifi(value: WifiPayload): string {
  const ssid = escapeWifi(clean(value.networkName));
  const password = escapeWifi(value.password);

  if (!ssid) return "";

  if (value.security !== "nopass" && !password) return "";

  return `WIFI:T:${value.security};S:${ssid};P:${escapeWifi(password)};H:${value.hidden ? "true" : "false"};;`;
}

export function buildContact(value: ContactPayload): string {
  const name = clean(value.name);

  if (!name) return "";

  const escapeVCard = (input: string) =>
    clean(input)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");

  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${escapeVCard(name)}`];

  if (clean(value.phone)) {
    lines.push(`TEL:${escapeVCard(value.phone)}`);
  }

  if (clean(value.email)) {
    lines.push(`EMAIL:${escapeVCard(value.email)}`);
  }

  if (clean(value.organization)) {
    lines.push(`ORG:${escapeVCard(value.organization)}`);
  }

  lines.push("END:VCARD");

  return lines.join("\r\n");
}

export function buildEmail(value: EmailPayload): string {
  const email = clean(value.email);

  if (!email) return "";

  const params = new URLSearchParams();

  if (clean(value.subject)) params.set("subject", clean(value.subject));
  if (clean(value.message)) params.set("body", clean(value.message));

  const query = params.toString();

  return `mailto:${email}${query ? `?${query}` : ""}`;
}

export function buildPhone(value: string): string {
  const phone = clean(value);

  return phone ? `tel:${phone}` : "";
}

export function buildSms(value: SmsPayload): string {
  const phone = clean(value.phone);

  if (!phone) return "";

  return `SMSTO:${phone}:${clean(value.message)}`;
}

export function buildLocation(value: LocationPayload): string {
  const latitude = Number(value.latitude);
  const longitude = Number(value.longitude);

  if (
    !clean(value.latitude) ||
    !clean(value.longitude) ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return "";
  }

  return `geo:${latitude},${longitude}`;
}

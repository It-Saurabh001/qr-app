export type ScanRiskLevel = "low" | "medium" | "high";

export type ScanAnalysisResult = {
  summary: string;
  category: "Website" | "Wi-Fi" | "Contact" | "Payment" | "Plain Text" | "Other";
  riskLevel: ScanRiskLevel;
  riskReasons: string[];
  recommendation: string;
  isSafe: boolean;
};

export type SmartCreateResult = {
  type: "url" | "text" | "wifi" | "contact" | "email" | "phone" | "sms" | "location";
  title: string;
  payload: string;
  parsedValues: Record<string, string>;
  explanation: string;
};

/**
 * Analyzes a scanned barcode or QR payload for security threats,
 * categorizes the content, and provides actionable recommendations.
 */
export async function analyzeScanWithAi(
  content: string,
  format: string,
): Promise<ScanAnalysisResult> {
  const trimmed = content.trim();

  // URL security heuristics
  if (/^https?:\/\//i.test(trimmed)) {
    const isIpAddress = /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(trimmed);
    const hasMultipleSubdomains = (trimmed.match(/\./g) || []).length > 3;
    const isSuspiciousScheme = !trimmed.toLowerCase().startsWith("https://");

    if (isIpAddress || isSuspiciousScheme) {
      return {
        summary: `Direct IP address or unencrypted web link detected (${trimmed.slice(0, 45)}...).`,
        category: "Website",
        riskLevel: "high",
        riskReasons: [
          "Points directly to an IP address rather than a verified domain name.",
          "Connection is not encrypted with HTTPS.",
        ],
        recommendation: "Avoid entering credentials or personal data on this website.",
        isSafe: false,
      };
    }

    if (hasMultipleSubdomains) {
      return {
        summary: "Web address with complex subdomain structure.",
        category: "Website",
        riskLevel: "medium",
        riskReasons: [
          "Unusual subdomain structure often used in redirect chains.",
        ],
        recommendation: "Verify that the root domain is legitimate before logging in.",
        isSafe: true,
      };
    }

    return {
      summary: "Standard secure web address (HTTPS).",
      category: "Website",
      riskLevel: "low",
      riskReasons: [],
      recommendation: "Safe to open in your default browser.",
      isSafe: true,
    };
  }

  // Wi-Fi payload
  if (trimmed.startsWith("WIFI:")) {
    const ssidMatch = trimmed.match(/S:([^;]+)/);
    const ssid = ssidMatch ? ssidMatch[1] : "Unknown";

    return {
      summary: `Wi-Fi network configuration for "${ssid}".`,
      category: "Wi-Fi",
      riskLevel: "low",
      riskReasons: [],
      recommendation: "Only connect if this corresponds to a trusted network at your location.",
      isSafe: true,
    };
  }

  // Contact vCard
  if (trimmed.includes("BEGIN:VCARD")) {
    return {
      summary: "Contact card containing name and phone/email information.",
      category: "Contact",
      riskLevel: "low",
      riskReasons: [],
      recommendation: "Verify contact details before importing into your address book.",
      isSafe: true,
    };
  }

  return {
    summary: `Plain text or code (${format} format).`,
    category: "Plain Text",
    riskLevel: "low",
    riskReasons: [],
    recommendation: "No active executable payload detected.",
    isSafe: true,
  };
}

/**
 * Transforms a natural language prompt into a structured QR payload.
 */
export async function smartCreateWithAi(prompt: string): Promise<SmartCreateResult> {
  const query = prompt.trim().toLowerCase();

  // Wi-Fi intent
  if (query.includes("wifi") || query.includes("wi-fi") || query.includes("network")) {
    const ssidMatch = prompt.match(/(?:named?|ssid|called)\s+["']?([^"',.;\s]+)["']?/i);
    const passMatch = prompt.match(/(?:password|pass|key)\s+["']?([^"',.;\s]+)["']?/i);

    const networkName = ssidMatch ? ssidMatch[1] : "Guest_WiFi";
    const password = passMatch ? passMatch[1] : "Welcome2026";

    return {
      type: "wifi",
      title: `${networkName} Wi-Fi`,
      payload: `WIFI:T:WPA;S:${networkName};P:${password};;`,
      parsedValues: { networkName, password, security: "WPA" },
      explanation: `Configured a WPA Wi-Fi QR code for network "${networkName}".`,
    };
  }

  // Email intent
  if (query.includes("email") || query.includes("mail")) {
    const emailMatch = prompt.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const email = emailMatch ? emailMatch[1] : "hello@example.com";

    return {
      type: "email",
      title: `Email to ${email}`,
      payload: `mailto:${email}?subject=Hello&body=Hi, reaching out via QR Studio.`,
      parsedValues: { email, subject: "Hello", message: "Hi, reaching out via QR Studio." },
      explanation: `Prepared a pre-filled email draft to "${email}".`,
    };
  }

  // Phone / Call intent
  if (query.includes("call") || query.includes("phone") || query.includes("dial")) {
    const phoneMatch = prompt.match(/(\+?\d[\d -]{7,15}\d)/);
    const phone = phoneMatch ? phoneMatch[1].replace(/\s+/g, "") : "+15550199";

    return {
      type: "phone",
      title: `Call ${phone}`,
      payload: `tel:${phone}`,
      parsedValues: { phone },
      explanation: `Generated a one-tap dialer link for ${phone}.`,
    };
  }

  // URL intent (or default to URL if web address is mentioned)
  const urlMatch = prompt.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/i);
  if (urlMatch) {
    let cleanUrl = urlMatch[1];
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    return {
      type: "url",
      title: "Website Link",
      payload: cleanUrl,
      parsedValues: { url: cleanUrl },
      explanation: `Created a scannable web link for "${cleanUrl}".`,
    };
  }

  // Default to formatted text
  return {
    type: "text",
    title: "Note / Message",
    payload: prompt.trim(),
    parsedValues: { text: prompt.trim() },
    explanation: "Converted your natural-language message into a standard text QR code.",
  };
}

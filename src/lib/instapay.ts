export type InstapayConfig = {
  link: string;
};

const ALLOWED_PROTOCOLS = ["http:", "https:", "tel:", "mailto:"];

export function normalizeInstapayLink(raw: string) {
  const value = raw.trim();
  if (!value) return { error: "Instapay link is required." as const };

  if (ALLOWED_PROTOCOLS.some((protocol) => value.startsWith(protocol))) {
    try {
      const url = new URL(value);
      if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
        return { error: "Use an http(s), tel, or mailto link." as const };
      }
      return { link: value };
    } catch {
      return { error: "Enter a valid Instapay link." as const };
    }
  }

  const digits = value.replace(/[^\d+]/g, "");
  if (digits.length >= 8) {
    return { link: `tel:${digits}` };
  }

  return { error: "Enter a full URL or a phone number for Instapay." as const };
}

export function formatInstapayDisplay(link: string) {
  if (!link) return "";
  if (link.startsWith("tel:")) return link.slice(4);
  if (link.startsWith("mailto:")) return link.slice(7);
  return link;
}

export function instapayLinkForInput(link: string) {
  return formatInstapayDisplay(link);
}

export function instapayOpensInNewTab(link: string) {
  return link.startsWith("http://") || link.startsWith("https://");
}

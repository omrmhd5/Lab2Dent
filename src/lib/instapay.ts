export type InstapayConfig = {
  link: string;
};

const ALLOWED_PROTOCOLS = ["http:", "https:", "tel:", "mailto:"];

export type InstapayErrorCode =
  | "instapayRequired"
  | "instapayProtocol"
  | "instapayInvalid"
  | "instapayPhone";

export function normalizeInstapayLink(
  raw: string,
): { link: string } | { error: InstapayErrorCode } {
  const value = raw.trim();
  if (!value) return { error: "instapayRequired" };

  if (ALLOWED_PROTOCOLS.some((protocol) => value.startsWith(protocol))) {
    try {
      const url = new URL(value);
      if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
        return { error: "instapayProtocol" };
      }
      return { link: value };
    } catch {
      return { error: "instapayInvalid" };
    }
  }

  const digits = value.replace(/[^\d+]/g, "");
  if (digits.length >= 8) {
    return { link: `tel:${digits}` };
  }

  return { error: "instapayPhone" };
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

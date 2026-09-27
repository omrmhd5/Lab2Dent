import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OG_IMAGE_SIZE } from "@/lib/og-image";

export const runtime = "nodejs";
export const alt = "Lab2Dent — We handle the rest.";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(
    join(process.cwd(), "public/Light Full Logo.PNG"),
  );
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 36,
        background:
          "linear-gradient(180deg, #ffffff 0%, #f9f8f4 55%, #e7edf6 100%)",
        color: "#133563",
        padding: 64,
        textAlign: "center",
      }}>
      <img
        src={logoSrc}
        width={480}
        height={200}
        alt=""
        style={{ objectFit: "contain" }}
      />
      <div
        style={{
          fontSize: 40,
          fontWeight: 700,
          color: "#f37728",
          maxWidth: 900,
          lineHeight: 1.2,
        }}>
        We handle the rest.
      </div>
      <div
        style={{
          fontSize: 26,
          color: "#5c6d88",
          maxWidth: 860,
          lineHeight: 1.35,
        }}>
        Register a dental lab case, pay with Instapay, and track it with a code.
      </div>
    </div>,
    { ...size },
  );
}

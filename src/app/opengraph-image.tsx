import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Lab2Dent — We handle the rest.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "public/Logo.svg"));
  const logoSrc = `data:image/svg+xml;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 28,
          background:
            "linear-gradient(145deg, #0d274c 0%, #133563 52%, #1a4a86 100%)",
          color: "#f9f8f4",
          padding: 72,
          textAlign: "center",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}>
          <img src={logoSrc} width={112} height={112} alt="" />
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}>
            Lab2Dent
          </div>
        </div>
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
            fontSize: 28,
            color: "#d7e2f2",
            maxWidth: 860,
            lineHeight: 1.35,
          }}>
          Register a dental lab case, pay with Instapay, and track it with a
          code.
        </div>
      </div>
    ),
    { ...size },
  );
}

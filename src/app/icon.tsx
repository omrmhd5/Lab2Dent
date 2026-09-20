import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e7490",
          borderRadius: 8,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 256 256">
          <path
            fill="#fff"
            d="M168 24H88A56 56 0 0 0 32 79.75c0 42.72 8 75.4 14.7 95.28 8.72 25.8 20.62 45.49 32.64 54A15.67 15.67 0 0 0 88.47 232a16.09 16.09 0 0 0 16-14.9c.85-11.52 5-49.11 23.53-49.11s22.68 37.59 23.53 49.11a16.09 16.09 0 0 0 9.18 13.36 15.69 15.69 0 0 0 15.95-1.41c12-8.53 23.92-28.22 32.64-54C216 155.15 224 122.47 224 79.75A56 56 0 0 0 168 24Z"
          />
        </svg>
      </div>
    ),
    size,
  );
}

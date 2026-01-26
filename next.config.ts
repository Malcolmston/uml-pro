import type { NextConfig } from "next";

const nodeEnv = process.env.NODE_ENV;
const isProd = nodeEnv === "production" || nodeEnv === ("prod" as string);

const csp = [
  "default-src 'self'",
  `script-src 'self'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  `connect-src 'self'${isProd ? "" : " ws: http://localhost:* http://127.0.0.1:*"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
        ],
      },
    ];
  },
};

export default nextConfig;

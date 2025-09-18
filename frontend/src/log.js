// src/log.js

const LOG_API_URL = process.env.REACT_APP_LOG_API_URL;
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYX...';
;

/**
 * Sends a log to the evaluation server
 * @param {string} stack - "frontend"
 * @param {string} level - "debug" | "info" | "warn" | "error" | "fatal"
 * @param {string} pkg - "api" | "component" | "hook" | "page" | "state" | "style"
 * @param {string} message - descriptive log message
 */
export async function log(stack, level, pkg, message) {
  try {
    console.log('LOG_API_URL:', LOG_API_URL);
    console.log('TOKEN:', TOKEN);
    const res = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });

    if (!res.ok) {
      console.error("Logging failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data; // { logID: "...", message: "log created successfully" }
  } catch (error) {
    console.error("Error sending log:", error);
    return null;
  }
}

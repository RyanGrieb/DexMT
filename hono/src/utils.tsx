import fs from "fs";
import { html } from "hono/html";
import path from "path";

// helper to format as MM-DD-YY-h:mma in configured TZ
function getFormattedDate(): string {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", //FIXME: use configured timezone
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const parts = fmt.formatToParts(now);
  const mm = parts.find((p) => p.type === "month")!.value;
  const dd = parts.find((p) => p.type === "day")!.value;
  const yy = parts.find((p) => p.type === "year")!.value;
  const hh = parts.find((p) => p.type === "hour")!.value;
  const mi = parts.find((p) => p.type === "minute")!.value;
  const ss = parts.find((p) => p.type === "second")!.value;
  const ampm = parts.find((p) => p.type === "dayPeriod")!.value.toUpperCase();
  return `${mm}-${dd}-${yy}-${hh}:${mi}:${ss}${ampm}`;
}

// generate a fully resolved logs directory and file path
const logsDir = path.resolve(__dirname, "logs");
const logFileName = `server-${getFormattedDate()}.log`;
const logFilePath = path.join(logsDir, logFileName);

function ensureLogsDirectory() {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create logs directory:", error);
  }
}

function logOutput(message: string, lvl: "info" | "error" | "warn" | "debug" = "info") {
  const level = lvl.toUpperCase();
  try {
    ensureLogsDirectory();

    // debug where we're writing
    //console.debug(`Writing log entry to ${logFilePath}`);

    const logEntry = `[${getFormattedDate()}] [${level}] ${message}\n`;

    // append with encoding option object
    fs.appendFileSync(logFilePath, logEntry, { encoding: "utf8" });

    console.log(`${level}: ${message}`);
  } catch (error) {
    console.error("Failed to write to log file:", error);
    console.log(`${level}: ${message}`);
  }
}

function clearOldLogs(keepCount: number = 5) {
  try {
    ensureLogsDirectory();

    // read all files in logs directory
    const files = fs.readdirSync(logsDir);

    // filter files that match the log file pattern
    const logFiles = files.filter((file) => file.startsWith("server-") && file.endsWith(".log"));

    // sort files by creation time (newest first)
    logFiles.sort((a, b) => {
      const aTime = fs.statSync(path.join(logsDir, a)).mtime.getTime();
      const bTime = fs.statSync(path.join(logsDir, b)).mtime.getTime();
      return bTime - aTime;
    });

    // remove old log files beyond the keep count
    for (let i = keepCount; i < logFiles.length; i++) {
      fs.unlinkSync(path.join(logsDir, logFiles[i]));
      console.log(`Deleted old log file: ${logFiles[i]}`);
    }
  } catch (error) {
    console.error("Failed to clear old logs:", error);
  }
}

// Helper functions (reuse from leaderboard.tsx)
function abbreviateNumber(value: number | string): string {
  const num = Number(value) || 0;
  if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
}

function getPlatformIcon(platform: string | null | undefined): ReturnType<typeof html> {
  if (!platform) {
    return html`<span style="color:#666;">-</span>`;
  }

  const platformLower = platform.toLowerCase();

  switch (platformLower) {
    case "gmx":
      return html`<span style="color:#4f46e5; font-weight: bold;">GMX</span>`;
    case "dydx":
      return html`<span style="color:#6366f1; font-weight: bold;">dYdX</span>`;
    case "hyperliquid":
      return html`<span style="color:#8b5cf6; font-weight: bold;">HL</span>`;
    default:
      return html`<span style="font-size:0.75rem;color:#888;">${platform.toUpperCase()}</span>`;
  }
}

function generateIconColor(address: string): string {
  const hash = address.slice(2, 8);
  const r = parseInt(hash.slice(0, 2), 16);
  const g = parseInt(hash.slice(2, 4), 16);
  const b = parseInt(hash.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

const utils = {
  abbreviateNumber,
  getPlatformIcon,
  generateIconColor,
  logOutput,
  clearOldLogs,
};

export default utils;

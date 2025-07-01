import fs from "fs";
import path from "path";

// generate a fully resolved logs directory and file path
const logsDir = path.resolve(__dirname, "..", "logs");
const logFileName = `server-${getFormattedDate()}.log`;
const logFilePath = path.join(logsDir, logFileName);

function resetTraderLogs() {
  try {
    const addressDir = path.join(logsDir, "address");
    if (fs.existsSync(addressDir)) {
      fs.rmSync(addressDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Failed to reset trader logs:", error);
  }
}

function ensureLogsDirectory() {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create logs directory:", error);
  }
}

function ensureAddressDirectory() {
  // Create the 'address' directory inside the logs directory
  if (!fs.existsSync(path.join(logsDir, "address"))) {
    fs.mkdirSync(path.join(logsDir, "address"), { recursive: true });
  }
}

function address(address: string, message: string, lvl: "info" | "error" | "warn" | "debug" = "info") {
  ensureLogsDirectory();
  ensureAddressDirectory();

  const addressLogFilePath = path.join(logsDir, "address", `${address}.log`);
  const level = lvl.toUpperCase();
  try {
    // debug where we're writing
    //console.debug(`Writing log entry to ${addressLogFilePath}`);

    const logEntry = `[${getFormattedDate()}] [${level}] ${message}\n`;

    // append with encoding option object
    fs.appendFileSync(addressLogFilePath, logEntry, { encoding: "utf8" });

    console.log(`${level}: ${message}`);
  } catch (error) {
    console.error("Failed to write to address log file:", error);
    console.log(`${level}: ${message}`);
  }
}

function output(message: string, lvl: "info" | "error" | "warn" | "debug" = "info") {
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

function error(error: any) {
  if (!(error instanceof Error) || !error.message) {
    console.error("An error occurred, but it is not an instance of Error or does not have a message.");
    return;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? `\nStack trace:\n${error.stack}` : "";
  console.error(`Error: ${errorMessage}${stackTrace}`);
  output(`Error: ${errorMessage}${stackTrace}`, "error");
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

const log = {
  resetTraderLogs,
  clearOldLogs,
  address,
  output,
  error,
};

export default log;

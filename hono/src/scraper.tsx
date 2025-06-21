import puppeteer from "puppeteer";
import { Trader } from "./types/trader";

/**
 * Fetch top traders for a given platform.
 */
async function getTopTraders(opts: {
  platform: string;
  limit: number;
}): Promise<Trader[]> {
  const { platform, limit } = opts;

  if (platform !== "gmx" && platform !== "gmxv2") {
    throw new Error(
      'Unsupported platform. Only "gmx" and "gmxv2" are currently supported.'
    );
  }

  console.log(`Starting scraper for ${platform} with limit ${limit}`);

  let browser;
  let page;

  try {
    // Launch browser with more robust settings for Docker
    browser = await puppeteer.launch({
      headless: true,
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        //"--single-process",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--disable-extensions",
        "--disable-plugins",
        "--disable-images",
        //"--disable-javascript",
        "--memory-pressure-off",
        "--max_old_space_size=4096",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
      ],
      timeout: 60000, // Increase timeout
      protocolTimeout: 60000,
    });

    page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 720 }); // Smaller viewport
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Block unnecessary resources to save memory
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (
        resourceType === "stylesheet" ||
        resourceType === "image" ||
        resourceType === "font"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log("Navigating to GMX leaderboard...");

    // Navigate to the GMX leaderboard with retries
    let retries = 3;
    while (retries > 0) {
      try {
        await page.goto("https://app.gmx.io/#/leaderboard", {
          waitUntil: "domcontentloaded", // Changed from networkidle2
          timeout: 45000,
        });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(
          `Navigation failed, retrying... (${retries} attempts left)`
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log("Page loaded, waiting for table...");

    // Wait for the leaderboard table to load with retries
    let tableRetries = 10; // Increased retries
    let tableFound = false;

    while (tableRetries > 0 && !tableFound) {
      try {
        await page.waitForSelector("table", { timeout: 10000 });
        console.log("Table element found, waiting for data to load...");

        // Wait a bit more for JavaScript to populate the table
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Check if we have actual data (not loading skeletons)
        const dataStatus = await page.evaluate(() => {
          const rows = document.querySelectorAll(
            "table tbody tr"
          ) as NodeListOf<HTMLTableRowElement>;

          // Check for loading skeletons
          const hasLoadingSkeletons = document.querySelectorAll(
            ".react-loading-skeleton"
          ).length;
          const hasAriaLoading =
            document.querySelectorAll('[aria-busy="true"]').length;

          // Check if we have actual content (not just skeleton characters)
          let hasRealData = false;
          for (let i = 0; i < Math.min(5, rows.length); i++) {
            const cells = rows[i].querySelectorAll("td");
            for (let j = 0; j < cells.length; j++) {
              const cellText = cells[j].textContent?.trim() || "";
              // Check if cell has real content (not just skeleton characters)
              if (cellText && cellText !== "‌" && cellText.length > 1) {
                hasRealData = true;
                break;
              }
            }
            if (hasRealData) break;
          }

          return {
            rowCount: rows.length,
            hasLoadingSkeletons,
            hasAriaLoading,
            hasRealData,
            firstCellText:
              rows.length > 0
                ? rows[0].cells[0]?.textContent?.trim() || ""
                : "",
          };
        });

        console.log("Data status:", dataStatus);

        if (
          dataStatus.rowCount > 0 &&
          dataStatus.hasRealData &&
          !dataStatus.hasLoadingSkeletons
        ) {
          console.log(
            `Found ${dataStatus.rowCount} rows with real data in leaderboard table`
          );
          tableFound = true;
        } else {
          console.log(
            `Table found but still loading... Skeletons: ${dataStatus.hasLoadingSkeletons}, Real data: ${dataStatus.hasRealData}, Retries left: ${tableRetries - 1}`
          );
          tableRetries--;
          if (tableRetries > 0) {
            // Wait longer between retries when data is still loading
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
      } catch (error: any) {
        console.log(`Table wait attempt failed: ${error.message}`);
        tableRetries--;
        if (tableRetries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    if (!tableFound) {
      // Let's see what's actually on the page
      const pageContent = await page.evaluate(() => {
        const hasLoadingSkeletons = document.querySelectorAll(
          ".react-loading-skeleton"
        ).length;
        const hasAriaLoading =
          document.querySelectorAll('[aria-busy="true"]').length;

        return {
          title: document.title,
          url: window.location.href,
          bodyLength: document.body.textContent?.length || 0,
          hasTable: !!document.querySelector("table"),
          tableCount: document.querySelectorAll("table").length,
          loadingSkeletons: hasLoadingSkeletons,
          ariaLoading: hasAriaLoading,
          bodyStart:
            document.body.textContent?.substring(0, 500) || "No body content",
        };
      });

      console.log("Page debug info:", pageContent);

      if (pageContent.loadingSkeletons > 0 || pageContent.ariaLoading > 0) {
        throw new Error(
          "GMX leaderboard is still loading after multiple attempts. Data may be taking too long to load."
        );
      } else {
        throw new Error("Could not find leaderboard table with real data");
      }
    }

    console.log("Table found, extracting data...");

    // First, let's debug what we actually have in the table
    const debugInfo = await page.evaluate(() => {
      const rows = document.querySelectorAll("table tbody tr");
      const debugData = [];

      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");

        debugData.push({
          rowIndex: i,
          cellCount: cells.length,
          rowHTML: row.outerHTML.substring(0, 500), // Truncate for readability
          cellTexts: Array.from(cells).map(
            (cell) => cell.textContent?.trim() || ""
          ),
        });
      }

      return {
        totalRows: rows.length,
        firstFiveRows: debugData,
      };
    });

    console.log("Debug info from page:", JSON.stringify(debugInfo, null, 2));

    // Extract the top traders data and convert to Trader objects
    const users = await page.evaluate((maxUsers) => {
      const rows = document.querySelectorAll("table tbody tr");
      const extractedUsers = [];
      const debugLogs = [];

      debugLogs.push(`Found ${rows.length} rows in the leaderboard`);

      for (let i = 0; i < Math.min(rows.length, maxUsers); i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");

        debugLogs.push(`Processing row ${i}: ${cells.length} cells`);

        if (cells.length >= 7) {
          try {
            // Extract rank (first cell)
            const rankText = cells[0].textContent?.trim() || `${i + 1}`;
            const rank = parseInt(rankText) || i + 1;

            // Extract address with multiple fallback strategies
            let address = "";

            // Strategy 1: Try to get from href attribute
            const linkElement = cells[1].querySelector("a[href]");
            if (linkElement) {
              const href = linkElement.getAttribute("href") || "";
              debugLogs.push(`Row ${i} - Link href: "${href}"`);

              const addressMatch = href.match(/\/accounts\/([0-9a-fA-Fx]+)/);
              if (addressMatch) {
                address = addressMatch[1];
                debugLogs.push(
                  `Row ${i} - Extracted address from href: "${address}"`
                );
              }
            }

            // Strategy 2: Try different CSS selectors for address text
            if (!address) {
              const addressSelectors = [
                ".AddressView-trader-id",
                "[class*='AddressView']",
                "a span",
                "span",
              ];

              for (const selector of addressSelectors) {
                const element = cells[1].querySelector(selector);
                if (element) {
                  const text = element.textContent?.trim() || "";
                  debugLogs.push(
                    `Row ${i} - Found text with selector "${selector}": "${text}"`
                  );

                  if (
                    text &&
                    text !== "You" &&
                    (text.startsWith("0x") || text.length === 42)
                  ) {
                    address = text;
                    break;
                  }
                }
              }
            }

            // Strategy 3: Get any text from the second cell
            if (!address) {
              const cellText = cells[1].textContent?.trim() || "";
              debugLogs.push(`Row ${i} - Cell 1 full text: "${cellText}"`);

              // Look for patterns that might be addresses
              const addressPattern = /(0x[a-fA-F0-9]{40})/;
              const match = cellText.match(addressPattern);
              if (match) {
                address = match[1];
                debugLogs.push(
                  `Row ${i} - Found address via regex: "${address}"`
                );
              }
            }

            // Extract other data
            const plnStr = cells[2]?.textContent?.trim() || "0";
            const pnlNum = parseFloat(plnStr.replace(/[+,$]/g, ""));
            const pnl: number = isNaN(pnlNum) ? 0 : pnlNum;

            const pnlPercentageStr = cells[3]?.textContent?.trim() || "0";
            const pnlPercentageNum = parseFloat(
              pnlPercentageStr.replace(/[%]/g, "")
            );
            const pnlPercentage: number = isNaN(pnlPercentageNum)
              ? 0
              : pnlPercentageNum;

            const avgSizeStr = cells[4]?.textContent?.trim() || "0";
            const avgSizeNum = parseFloat(avgSizeStr.replace(/[$,]/g, ""));
            const avgSize: number = isNaN(avgSizeNum) ? 0 : avgSizeNum;

            const avgLeverageStr = cells[5]?.textContent?.trim() || "0";
            const avgLeverageNum = parseFloat(
              avgLeverageStr.replace(/[Xx]/g, "")
            );
            const avgLeverage: number = isNaN(avgLeverageNum)
              ? 0
              : avgLeverageNum;

            const winLossText = cells[6]?.textContent?.trim() || "0/1";
            const winLossParts = winLossText.split("/");
            const wins = parseFloat(winLossParts[0] || "0");
            const losses = parseFloat(winLossParts[1] || "1");
            const winRatio: number = losses > 0 ? wins / losses : wins;

            debugLogs.push(
              `Row ${i} extracted data: rank=${rank}, address="${address}", pnl="${pnl}", avgSize="${avgSize}"`
            );

            // Validate address more thoroughly
            const isValidAddress =
              address &&
              address !== "You" &&
              address.startsWith("0x") &&
              address.length === 42 &&
              /^0x[a-fA-F0-9]{40}$/.test(address);

            if (isValidAddress) {
              const extractedAddress = address;
              // Return data that can be used to create Trader objects
              extractedUsers.push({
                address: extractedAddress,
                platform_ranking: rank,
                pnl,
                pnlPercentage,
                avgSize,
                avgLeverage,
                winRatio,
              });
              debugLogs.push(
                `✅ Added user ${extractedUsers.length}: ${extractedAddress}`
              );
            } else {
              debugLogs.push(
                `❌ Skipped row ${i} - invalid address: "${address}" (length: ${address.length})`
              );
            }
          } catch (error: any) {
            debugLogs.push(`Error processing row ${i}: ${error.message}`);
          }
        } else {
          debugLogs.push(`Row ${i} has insufficient cells: ${cells.length}`);
        }
      }

      debugLogs.push(
        `Extraction complete. Found ${extractedUsers.length} valid users out of ${rows.length} rows`
      );

      return {
        users: extractedUsers,
        debugLogs: debugLogs,
      };
    }, limit);

    const extractedUsers = users.users;

    // Convert extracted data to Trader objects
    const traders: Trader[] = extractedUsers.map(
      (userData: {
        address: string;
        platform_ranking: number;
        pnl: number;
        pnlPercentage: number;
        avgSize: number;
        avgLeverage: number;
        winRatio: number;
      }) => {
        return new Trader({
          address: userData.address,
          balance: "0", // Default balance since GMX doesn't provide this
          chainId: "0xa4b1", // Arbitrum chain ID for GMX
          platformRanking: userData.platform_ranking,
          dexPlatform: platform, // Use the platform parameter (gmx/gmxv2)
          isDexmtTrader: false,
          pnl: userData.pnl,
          pnlPercentage: userData.pnlPercentage,
          avgSize: userData.avgSize,
          avgLeverage: userData.avgLeverage,
          winRatio: userData.winRatio,
          updatedAt: new Date().toISOString(), // Current timestamp
        });
      }
    );
    return traders;
  } catch (error) {
    console.error("Error scraping GMX leaderboard:", error);
    throw error;
  } finally {
    // Ensure cleanup happens properly
    try {
      if (page) {
        await page.close();
      }
    } catch (e) {
      console.warn("Error closing page:", e);
    }

    try {
      if (browser) {
        await browser.close();
      }
    } catch (e) {
      console.warn("Error closing browser:", e);
    }
  }
}

// bundle into a single object so you can do `scraper.getTopUsers()`
const scraper = {
  getTopTraders,
};

export default scraper;

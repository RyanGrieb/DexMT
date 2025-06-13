import { showUserInfo } from "./user-info";

// Define User interface in this file since this is where it's primarily used
export interface User {
  address: string;
  balance: string;
  chainId: string;
  platform_ranking: number | null;
  dex_platform: string | null;
  pnl: number | null;
  pnlPercentage: number | null;
  avgSize: number | null;
  avgLeverage: number | null;
  winRatio: number | null;
  watching?: number | null;
  updatedAt: string;
}

export function abbreviateNumber(value: number | string): string {
  const num = Number(value) || 0;
  if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

export function updateUsersUI(): void {
  const usersList = document.querySelector(
    ".user-list"
  ) as HTMLTableSectionElement;
  if (!usersList) {
    console.warn("User list element not found");
    return;
  }

  fetch("/api/users")
    .then((res: Response) => res.json())
    .then((users: User[]) => {
      const fragment = document.createDocumentFragment();

      if (Array.isArray(users) && users.length > 0) {
        users.forEach((user: User, index: number) => {
          const pnlValue = Number(user.pnlPercentage) || 0;
          const pnlClass = pnlValue >= 0 ? "positive" : "negative";
          const pnlText = pnlValue.toFixed(2);

          const sizeText = abbreviateNumber(user.avgSize ?? 0);

          const leverageValue = Number(user.avgLeverage) || 0;
          const leverageText = leverageValue.toFixed(1);

          const winRatioValue = Number(user.winRatio) || 0;
          const winRatioText = winRatioValue.toFixed(2);

          const watchingCount = user.watching || 0;

          // Get platform icon
          const platformIcon = getPlatformIcon(user.dex_platform);

          const addressHash = user.address.slice(2, 4).toUpperCase();
          const userRow = document.createElement("tr");
          userRow.className = "user-item";
          userRow.innerHTML = `
            <td class="user-rank">#${user.platform_ranking || index + 1}</td>
            <td class="user-platform">${platformIcon}</td>
            <td class="user-trader">
              <div class="trader-icon">${addressHash}</div>
              <div class="trader-address">
                ${user.address.slice(0, 6)}...${user.address.slice(-4)}
              </div>
            </td>
            <td class="user-pnl ${pnlClass}">${pnlText}%</td>
            <td class="user-size">${sizeText}</td>
            <td class="user-leverage">${leverageText}x</td>
            <td class="user-winratio">${winRatioText}</td>
            <td class="user-watching">${watchingCount}</td>
          `;
          userRow.addEventListener("click", () => selectUser(user));
          fragment.appendChild(userRow);
        });
      } else {
        const emptyRow = document.createElement("tr");
        emptyRow.className = "user-item";
        emptyRow.innerHTML = `
          <td colspan="8" style="text-align:center;color:#666;padding:20px">
            No users found
          </td>`;
        fragment.appendChild(emptyRow);
      }

      usersList.replaceChildren(fragment);
      console.log(`Loaded ${users.length} users`);
    })
    .catch((error: Error) => {
      console.error("Error fetching users:", error);
      const fragment = document.createDocumentFragment();
      const errorRow = document.createElement("tr");
      errorRow.className = "user-item";
      errorRow.innerHTML = `
        <td colspan="8" style="text-align:center;color:#f44336;padding:20px">
          Failed to load users
        </td>`;
      fragment.appendChild(errorRow);
      usersList.replaceChildren(fragment);
    });
}

function getPlatformIcon(platform: string | null): string {
  if (!platform) {
    return '<span style="color:#666;">-</span>';
  }

  const platformLower = platform.toLowerCase();

  switch (platformLower) {
    case "gmx":
      return `
        <svg width="24" height="24" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gmx-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path fill="url(#gmx-gradient)" transform="translate(-525.667 -696) scale(1)" d="m555.182 717.462-14.735-21.462-14.78 21.462h20.592l-5.812-8.191-2.883 4.256h-3.064l5.949-8.557 8.6 12.493z"/>
        </svg>
      `;
    case "dydx":
      return `<span style="font-size:0.75rem;color:#888;">DYDX</span>`;
    case "hyperliquid":
      return `<span style="font-size:0.75rem;color:#888;">HL</span>`;
    default:
      // Fallback to text if no icon available
      return `<span style="font-size:0.75rem;color:#888;">${platform.toUpperCase()}</span>`;
  }
}

function selectUser(user: User): void {
  console.log("User selected:", user);
  showUserInfo(user);
}

export function generateIconColor(address: string): string {
  const hash = address.slice(2, 8);
  const r = parseInt(hash.slice(0, 2), 16);
  const g = parseInt(hash.slice(2, 4), 16);
  const b = parseInt(hash.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

// Export to global window (for compatibility)
(window as any).UsersManager = {
  updateUsersUI,
  abbreviateNumber,
  generateIconColor,
  selectUser,
};

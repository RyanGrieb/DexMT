// Define Trade interface in this file since this is where it's primarily used
export interface Trade {
  id: number;
  user_address: string;
  token_in: string;
  token_out: string;
  amount_in: string;
  amount_out: string;
  price: string;
  transaction_hash: string;
  block_number: number;
  chain_id: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export function updateTradesUI(): void {
  console.log("Updating trades UI...");
  // TODO: Implement trades UI update
}

export function fetchUserTrades(userAddress: string): Promise<Trade[]> {
  console.log(`Fetching trades for user: ${userAddress}`);

  return fetch(`/api/trades/${userAddress}`)
    .then((response: Response) => response.json())
    .then((trades: Trade[]) => {
      console.log(`Loaded ${trades.length} trades for ${userAddress}`);
      return trades;
    })
    .catch((error: Error) => {
      console.error("Error fetching trades:", error);
      return [];
    });
}

export function displayUserTrades(trades: Trade[]): void {
  // TODO: Implement trade display logic
  console.log("Displaying trades:", trades);
}

// Export to global window (for compatibility)
(window as any).TradesManager = {
  updateTradesUI,
  fetchUserTrades,
  displayUserTrades,
};

import { ethers } from "ethers";
import { getWalletAddr, provider } from "../metamask";
import profile from "../profile";
import router from "../router";
import utils from "../utils";

async function init() {
  document.body.addEventListener("click", async (e) => {
    const traderIdentity = (e.target as HTMLElement).closest(".trader-identity");

    if (traderIdentity) {
      e.preventDefault();

      const traderCard = traderIdentity.closest(".trader-card") as HTMLElement;
      const address = traderCard?.getAttribute("data-address");
      if (address) {
        router.loadProfile(address);
      }
    }

    const btn = (e.target as HTMLElement).closest("button");
    if (btn) {
      // SELECT
      if (btn.classList.contains("select-trader")) {
        await handleSelect(btn as HTMLButtonElement);
      }
      // UNSELECT
      else if (btn.classList.contains("selected")) {
        await handleUnselect(btn as HTMLButtonElement);
      }
      // REMOVE
      else if (btn.classList.contains("remove-trader")) {
        await handleRemove(btn as HTMLButtonElement);
      }
    }
  });

  // Handle auto‐copy toggle switch
  utils.watchElementsOfQuery("#mirrorToggle", (mirrorToggle) => {
    // Set initial state based on user's current auto-copy setting

    mirrorToggle.addEventListener("change", async (e) => {
      await handleMirrorToggle(mirrorToggle as HTMLInputElement);
    });
  });

  // Tab‐switching logic
  utils.watchElementsOfQuery(".tab-button", (element) => {
    const tabBtn = element as HTMLElement;
    tabBtn.addEventListener("click", () => {
      const tab = tabBtn.getAttribute("data-tab");
      if (!tab) return;

      // deactivate all tab buttons and panes
      document.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));

      // activate clicked button & its pane
      tabBtn.classList.add("active");
      const pane = document.getElementById(`${tab}-tab`);
      if (pane) pane.classList.add("active");
    });
  });
}

async function handleMirrorToggle(toggle: HTMLInputElement) {
  const walletAddr = getWalletAddr();

  if (!provider || !walletAddr) {
    utils.showNotification("Please connect your wallet first", "error");
    // revert UI toggle if no wallet
    toggle.checked = !toggle.checked;
    return;
  }

  const targetEnable = toggle.checked;

  // immediately revert the checkbox so it only reflects confirmed state
  toggle.checked = !targetEnable;
  toggle.disabled = true;

  // show awaiting‐signature text
  const labelText = toggle.parentElement?.nextElementSibling as HTMLElement;
  if (labelText) {
    labelText.textContent = "Awaiting signature…";
  }

  try {
    const ts = Date.now();
    const msg = `${targetEnable ? "Enable" : "Disable"} auto-copy trading for ${walletAddr} at ${ts}`;
    // prompt MetaMask signature
    const sig = await provider.request({
      method: "personal_sign",
      params: [msg, walletAddr],
    });

    // call backend
    const res = await fetch(`/api/traders/${walletAddr}/auto_copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, signature: sig, timestamp: ts, enable: targetEnable }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to update auto-copy setting");
    }

    // on success, reflect the new state
    toggle.checked = targetEnable;
    if (labelText) {
      labelText.textContent = targetEnable ? "Disable Auto-Copy" : "Enable Auto-Copy";
    }
    utils.showNotification(`Auto-copy trading ${targetEnable ? "enabled" : "disabled"}`, "success");
  } catch (err: any) {
    console.error(err);
    utils.showNotification(err.message, "error");

    // on error, keep it reverted and restore correct label
    if (labelText) {
      labelText.textContent = targetEnable ? "Enable Auto-Copy" : "Disable Auto-Copy";
    }
  } finally {
    toggle.disabled = false;
  }
}

async function handleRemove(button: HTMLButtonElement) {
  if (!button.dataset.address) {
    return console.error("No trader address specified for removal");
  }

  const copyAddr = ethers.getAddress(button.dataset.address);
  const walletAddr = getWalletAddr();

  if (!copyAddr) return console.error("No trader address");

  if (!walletAddr) {
    return utils.showNotification("Please connect your wallet first", "error");
  }

  const origText = button.textContent;
  button.textContent = "Processing...";
  button.disabled = true;

  try {
    await profile.favoriteTrader(copyAddr, false);

    utils.showNotification("Trader removed from favorites", "success");

    // Find and remove the trader card/row from the UI
    const traderCard: HTMLElement =
      button.closest(".trader-card") || (button.closest(".watchlist-item") as HTMLElement);
    if (traderCard) {
      // Add fade-out animation
      traderCard.style.transition = "opacity 0.3s ease-out";
      traderCard.style.opacity = "0";

      // Remove element after animation completes
      setTimeout(() => {
        traderCard.remove();
      }, 300);
    }
  } catch (err: any) {
    console.error(err);
    utils.showNotification(err.message || "Failed to remove trader", "error");
    button.textContent = origText;
  } finally {
    if (!button.isConnected) return; // Don't try to update if element was removed
    button.disabled = false;
  }
}

async function handleSelect(button: HTMLButtonElement) {
  if (!button.dataset.address) {
    return console.error("No trader address specified for selection");
  }

  const walletAddr = getWalletAddr();
  const copyAddr = ethers.getAddress(button.dataset.address);

  if (!copyAddr) return console.error("No trader address");

  if (!provider || !walletAddr) {
    return utils.showNotification("Please connect your wallet first", "error");
  }

  const origText = button.textContent;
  button.textContent = "Processing...";
  button.disabled = true;

  try {
    const ts = Date.now();
    const msg = `Select traders ${copyAddr} for ${walletAddr} at ${ts}`;
    const sig = await provider.request({
      method: "personal_sign",
      params: [msg, walletAddr],
    });

    const res = await fetch(`/api/traders/${walletAddr}/select_traders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        traderAddresses: [copyAddr],
        signature: sig,
        message: msg,
        timestamp: ts,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to select trader");
    }

    utils.showNotification("Trader selected", "success");
    button.textContent = "✓ Selected for Copying";
    button.classList.replace("select-trader", "unselect-trader");
    button.classList.replace("btn-primary", "btn-success");
    button.classList.add("selected");
  } catch (err: any) {
    console.error(err);
    utils.showNotification(err.message, "error");
    button.textContent = origText;
  } finally {
    button.disabled = false;
  }
}

async function handleUnselect(button: HTMLButtonElement) {
  if (!button.dataset.address) {
    return console.error("No trader address specified for unselection");
  }

  const walletAddr = getWalletAddr();
  const copyAddr = ethers.getAddress(button.dataset.address);

  if (!copyAddr) return console.error("No trader address");

  if (!provider || !walletAddr) {
    return utils.showNotification("Please connect your wallet first", "error");
  }

  const origText = button.textContent;
  button.textContent = "Processing...";
  button.disabled = true;

  try {
    const ts = Date.now();
    const msg = `Unselect traders ${copyAddr} for ${walletAddr} at ${ts}`;
    const sig = await provider.request({
      method: "personal_sign",
      params: [msg, walletAddr],
    });

    const res = await fetch(`/api/traders/${walletAddr}/unselect_traders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        traderAddresses: [copyAddr],
        signature: sig,
        message: msg,
        timestamp: ts,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to unselect trader");
    }

    utils.showNotification("Trader unselected", "success");
    button.textContent = "Select for Copying";
    button.classList.replace("unselect-trader", "select-trader");
    button.classList.replace("btn-success", "btn-primary");
    button.classList.remove("selected");
  } catch (err: any) {
    console.error(err);
    utils.showNotification(err.message, "error");
    button.textContent = origText;
  } finally {
    button.disabled = false;
  }
}

export default { init };

export type ViewType = "top-traders" | "watch-list";

export interface Route {
  path: string;
  view: ViewType;
  title: string;
}

export const routes: Route[] = [
  {
    path: "/toptraders",
    view: "top-traders",
    title: "Top Traders - DEXMT",
  },
  {
    path: "/mywatchlist",
    view: "watch-list",
    title: "My Watch List - DEXMT",
  },
];

export class Router {
  private currentView: ViewType = "top-traders";

  constructor() {
    // Listen for browser back/forward navigation
    window.addEventListener("popstate", (event) => {
      const view = event.state?.view || this.getViewFromPath();
      this.loadView(view, false); // false = don't push to history
    });
  }

  // Get view from current URL path
  private getViewFromPath(): ViewType {
    const path = window.location.pathname;
    const route = routes.find((r) => r.path === path);
    return route?.view || "top-traders";
  }

  // Navigate to a specific view
  public navigateTo(view: ViewType, pushToHistory: boolean = true): void {
    const route = routes.find((r) => r.view === view);
    if (!route) return;

    if (pushToHistory) {
      window.history.pushState({ view }, route.title, route.path);
    }

    document.title = route.title;
    this.currentView = view;
    this.loadView(view, false);
  }

  // Load view content and update UI
  private async loadView(
    view: ViewType,
    pushToHistory: boolean = true
  ): Promise<void> {
    try {
      // Update navigation buttons
      this.updateNavigationButtons(view);

      // Load the appropriate content
      if (view === "top-traders") {
        await this.loadTopTraders();
      } else if (view === "watch-list") {
        await this.loadWatchList();
      }

      this.currentView = view;
    } catch (error) {
      console.error(`Error loading ${view} view:`, error);
      // Import showToast dynamically to avoid circular dependencies
      const { showToast } = await import("./utils");
      showToast(`Failed to load ${view.replace("-", " ")}`, "error");
    }
  }

  private async loadTopTraders(): Promise<void> {
    const response = await fetch("/html/top-traders.html");
    const html = await response.text();

    const indexContent = document.querySelector(".index-content");
    if (indexContent) {
      indexContent.innerHTML = html;

      // Import and call updateUsersUI dynamically
      const { updateUsersUI } = await import("./users");
      updateUsersUI();
    }
  }

  private async loadWatchList(): Promise<void> {
    // Import showWatchList dynamically to avoid circular dependencies
    const { showWatchList } = await import("./watch-list");
    showWatchList();
  }

  private updateNavigationButtons(view: ViewType): void {
    const topTradersBtn = document.getElementById("topTradersBtn");
    const myWatchListBtn = document.getElementById("myWatchListBtn");

    if (topTradersBtn && myWatchListBtn) {
      // Remove active class from both
      topTradersBtn.classList.remove("active");
      myWatchListBtn.classList.remove("active");

      // Add active class to current view
      if (view === "top-traders") {
        topTradersBtn.classList.add("active");
      } else if (view === "watch-list") {
        myWatchListBtn.classList.add("active");
      }
    }
  }

  // Initialize router and load current view
  public async init(): Promise<void> {
    const initialView = this.getViewFromPath();
    await this.loadView(initialView, false);
  }

  // Get current view
  public getCurrentView(): ViewType {
    return this.currentView;
  }
}

// Export singleton instance
export const router = new Router();

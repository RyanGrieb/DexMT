import utils from "./utils";

function init() {
  utils.watchElementsOfClass("select-trader", (button) => {
    button.addEventListener("click", () => {
      console.log("Select trader button clicked");
    });
  });
}

const watchlist = {
  init,
};

export default watchlist;

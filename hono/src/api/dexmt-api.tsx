import { Hono } from "hono";
import traders from "./traders";
import wallet from "./wallet";

async function init(app: Hono) {
  wallet.init(app);
  traders.init(app);
}

const api = {
  init,
};
export default api;

import { html } from "hono/html";
import { Trader } from "../../types/trader";

export async function renderCopiedPositions(traders: Trader[]) {}

function renderNoCopyingPositions() {
  return html`
    <div class="no-copying-positions">
      <h4>No positions being copied</h4>
    </div>
  `;
}

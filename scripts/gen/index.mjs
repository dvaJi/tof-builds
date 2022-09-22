import { main as mainItems } from "./generateItems.mjs";
import { main as mainSimulacra } from "./generateSimulacra.mjs";

async function main() {
  await mainItems();
  await mainSimulacra();
}

main();

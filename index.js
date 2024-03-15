import { donner_aggregate, party_aggregate } from "./util.js";
import { readJsonFile } from "./json.js";
import { flush } from "./src/flush.js";

async function run() {
  const donners = await readJsonFile("./out/donners.json");
  const parties = await readJsonFile("./out/parties.json");
  const d = donner_aggregate(donners);
  const p = party_aggregate(parties);

  flush(d, "donner_wise");
  flush(p, "party_wise");
}
await run();

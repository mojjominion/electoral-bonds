import tablemark from "tablemark";
import { flush } from "./flush.js";
import { percent } from "../util.js";
import { readJsonFile } from "../json.js";

export async function convertToMarkdown() {
  const donners = await readJsonFile("out/donner_wise.json");
  const parties = await readJsonFile("out/party_wise.json");

  const ops = {
    wrapWidth: 30,
    wrapWithGutters: true,
  };

  const donnersTotal = donners.reduce((a, c) => a + c.totalAmount, 0);
  const partiesTotal = parties.reduce((a, c) => a + c.totalAmount, 0);

  const d = tablemark(
    donners.map((x) => ({
      donner: x.donner,
      totalAmount: x.totalAmountString,
      totalTransactions: x.totalTransactions,
      percentage: percent(x.totalAmount, donnersTotal),
    })),
    ops,
  );

  const p = tablemark(
    parties.map((x) => ({
      party: x.party,
      totalAmount: x.totalAmountString,
      totalTransactions: x.totalTransactions,
      percentage: percent(x.totalAmount, partiesTotal),
    })),
    ops,
  );

  flush(d, "donner", "md", ".");
  flush(p, "parties", "md", ".");
}

convertToMarkdown();

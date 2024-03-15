import tablemark from "tablemark";
import { flush } from "./flush.js";
import { percent, formatter } from "../util.js";
import { readJsonFile } from "../json.js";
import { appendFile } from "fs";

function setTotal(data) {
  const amount = data.reduce((a, c) => a + c.totalAmount, 0);
  const transactions = data.reduce((a, c) => a + c.totalTransactions, 0);

  data.push({});
  data.push({
    donner: "Total",
    party: "Total",
    totalAmount: amount,
    totalAmountString: formatter.format(amount),
    totalTransactions: transactions,
    percentage: "",
  });

  return { amount };
}
export async function convertToMarkdown() {
  const donners = await readJsonFile("out/donner_wise.json");
  const parties = await readJsonFile("out/party_wise.json");

  const ops = {
    wrapWidth: 100,
    wrapWithGutters: true,
  };

  const { amount: partyAmount } = setTotal(parties);
  const { amount: donnerAmount } = setTotal(donners);

  const d = tablemark(
    donners.map((x, i) => ({
      serial: i + 1,
      donner: x.donner,
      totalAmount: x.totalAmountString,
      totalTransactions: x.totalTransactions,
      percentage: percent(x.totalAmount, donnerAmount),
    })),
    ops,
  );

  const p = tablemark(
    parties.map((x, i) => ({
      serial: i + 1,
      party: x.party,
      totalAmount: x.totalAmountString,
      totalTransactions: x.totalTransactions,
      percentage: percent(x.totalAmount, partyAmount),
    })),
    ops,
  );

  flush(d, "donners", "md", ".");
  flush(p, "README", "md", ".");
  appendToMarkdownFile(
    "README.md",
    "\n\n- Donners List [donners](./donners.md)",
  );
}

function appendToMarkdownFile(filePath, line) {
  appendFile(filePath, line + "\n", (err) => {
    if (err) {
      console.error("Error appending to file:", err);
    } else {
      console.log("Line added successfully!");
    }
  });
}

await convertToMarkdown();

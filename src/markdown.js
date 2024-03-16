import tablemark from "tablemark";
import { flush } from "./flush.js";
import { percent, formatter } from "../util.js";
import { readJsonFile } from "./json.js";
import { appendFile, appendFileSync } from "fs";
import { table } from "console";

function appendToMarkdownFile(filePath, line) {
  appendFile(filePath, line + "\n", (err) => {
    if (err) {
      console.error("Error appending to file:", err);
    } else {
      console.log("Line added successfully!");
    }
  });
}

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
    percentage: undefined,
  });

  return { amount };
}

function mapper(data = []) {
  const isParty = data.some((x) => x.party);
  const { amount } = setTotal(data);
  return data.map((x, i) => ({
    serial: x.totalAmount ? i + 1 : "",
    [isParty ? "party" : "donner"]: isParty ? x.party : x.donner,
    totalAmount: x.totalAmountString,
    totalTransactions: x.totalTransactions,
    percentage: x.totalAmount ? percent(x.totalAmount, amount) : "",
  }));
}

export async function convertToMarkdown() {
  const donners = await readJsonFile("out/donner_wise.json");
  const parties = await readJsonFile("out/party_wise.json");
  const dateParties = await readJsonFile("out/date_party_wise.json");

  const ops = {
    wrapWidth: 100,
    wrapWithGutters: true,
  };

  const d = tablemark(mapper(donners), ops);
  const p = tablemark(mapper(parties), ops);
  flush(d, "donners", "md", ".");

  // create README.md
  flush("# Overall\n\n", "README", "md", ".");
  appendToMarkdownFile("README.md", p.toString());

  for (const list of dateParties) {
    if (!list.length) continue;
    appendToMarkdownFile(
      "README.md",
      `\n\n\n## ${list[0].transactions[0].date.slice(3).replace("/", " ")}`,
    );
    const dp = tablemark(mapper(list), ops);
    appendToMarkdownFile("README.md", dp.toString());
  }

  appendToMarkdownFile(
    "README.md",
    "\n\n- Donners List [donners](./donners.md)\n\n\n",
  );
}

await convertToMarkdown();

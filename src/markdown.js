import tablemark from "tablemark";
import { flush } from "./flush.js";
import { percent, formatter } from "../util.js";
import { readJsonFile } from "./json.js";
import { appendFile, promises } from "fs";

const ops = {
  wrapWidth: 100,
  wrapWithGutters: true,
};

async function appendToMarkdownFile(filePath, line) {
  try {
    await promises.appendFile(filePath, line + "\n");
  } catch (err) {
    if (err) {
      console.error("Error appending to file:", err);
    } else {
      console.log("Line added successfully!");
    }
  }
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

async function appendData(fileName, data, overall) {
  // create README.md
  const file = fileName.split(".");
  const title = overall.length ? "# Overall\n\n" : "## Month wise data\n\n";
  await flush(title, file[0], file[1], ".");
  await appendToMarkdownFile(fileName, overall);

  for (const list of data) {
    const header = `\n\n\n## ${list[0].transactions[0].date.slice(3).replace("/", " ")}`;
    await appendToMarkdownFile(fileName, header);
    await appendToMarkdownFile(fileName, tablemark(mapper(list), ops));
  }
}

export async function convertToMarkdown() {
  // Donners
  const donners = await readJsonFile("out/donner_wise.json");
  const dateDonners = await readJsonFile("out/date_donner_wise.json");
  await flush(tablemark(mapper(donners), ops), "donners", "md", ".");
  await appendData("DATE_DONNERS.md", dateDonners, "");
  await appendToMarkdownFile(
    "DATE_DONNERS.md",
    "\n\n- Donners List [donners](./donners.md)\n\n\n",
  );

  // Parties
  const parties = await readJsonFile("out/party_wise.json");
  const dateParties = await readJsonFile("out/date_party_wise.json");
  await appendData("README.md", dateParties, tablemark(mapper(parties), ops));
  await appendToMarkdownFile(
    "README.md",
    "\n\n- Donners List [donners](./donners.md)\n\n\n",
  );
}

await convertToMarkdown();

import tablemark from "tablemark";
import { flush } from "./flush.js";
import { percent, formatter, grouper } from "../util.js";
import { readJsonFile } from "./json.js";
import { appendFile, promises } from "fs";

const ops = {
  wrapWidth: 150,
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
  return data.map((x, i) => ({
    serial: x.totalAmount ? i + 1 : "",
    donnner: x.donner,
    party: x.party,
    totalAmount: x.totalAmountString,
    totalTransactions: x.totalTransactions,
    // percentage: x.totalAmount ? percent(x.totalAmount, amount) : "",
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
  // Parties
  const collatedData = await readJsonFile("out/encashed.json");
  const grouped = Object.values(
    collatedData.reduce(
      grouper((x) => x.party),
      {},
    ),
  ).sort(
    (a, b) =>
      b.reduce((a, x) => a + x.totalAmount, 0) -
      a.reduce((a, y) => a + y.totalAmount, 0),
  );

  const fileName = "README.md";
  const file = fileName.split(".");
  await flush("Party wise data", file[0], file[1], ".");
  for (const list of grouped) {
    const header = `\n\n\n## ${list[0].party}`;
    await appendToMarkdownFile(fileName, header);
    const data = list.sort((a, b) => b.totalAmount - a.totalAmount);
    setTotal(data);
    await appendToMarkdownFile(fileName, tablemark(mapper(data), ops));
  }
  await appendToMarkdownFile(
    "README.md",
    "\n\n- Donners List [donners](./donners.md)\n\n\n",
  );
}

await convertToMarkdown();

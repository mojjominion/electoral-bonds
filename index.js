import { readFileSync, writeFile } from "fs";
import { getDocument } from "pdfjs-dist";
import { donner_aggregate, party_aggregate, isName } from "./util.js";
import { readJsonFile } from "./json.js";

const DateRegex =
  /\d{1,2}\/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\/\d{4}/;

async function reader(filePath, isParty = false) {
  // Read the PDF file
  const pdfData = new Uint8Array(readFileSync(filePath));
  const rows = [];

  try {
    const pdf = await getDocument(pdfData).promise;
    const numPages = pdf.numPages;
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent({
        normalizeWhitespace: true,
        // disableCombineTextItems: true,
      });
      const pageText = textContent.items
        .filter((x) => !!x.str.toString().trim())
        .map((x) => x.str);

      const indexes = pageText
        .map((x, i) => (DateRegex.test(x) ? i : -1))
        .filter((x) => x > -1);

      for (let i = 0; i + 1 < indexes.length; i += 1) {
        const curIndex = indexes[i];
        const nextIndex = indexes[i + 1];
        const names = pageText.slice(curIndex + 1, nextIndex - 1);
        rows.push({
          date: pageText[curIndex],
          [isParty ? "party" : "donner"]: names.join(" "),
          value: pageText[nextIndex - 1],
        });
      }
    }
  } catch (error) {
    console.error("[PDF Error]:", error);
  }

  return rows;
}

function flush(data, name) {
  const jsonString = JSON.stringify(data, null, 2); // null and 2 are optional for formatting
  writeFile(`./out/${name}.json`, jsonString, "utf8", (err) => {
    if (err) {
      console.error("Error writing to file:", err);
      return;
    }
    console.log("JSON data has been written to output.json");
  });
}

async function processPdfs() {
  const donners = await reader("./donners.pdf");
  const parties = await reader("./parties.pdf", true);

  flush(donners, "donners");
  flush(parties, "parties");
}
processPdfs();

async function run() {
  const donners = await readJsonFile("./out/donners.json");
  const parties = await readJsonFile("./out/parties.json");
  const d = donner_aggregate(donners);
  const p = party_aggregate(parties);

  flush(d, "donner_wise");
  flush(p, "party_wise");
}
// run();

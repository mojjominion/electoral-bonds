import { readFileSync, writeFile } from "fs";
import { getDocument } from "pdfjs-dist";
import { donner_aggregate, party_aggregate } from "./util.js";
import { readJsonFile } from "./json.js";

async function reader(filePath, isParty = false) {
  // Read the PDF file
  const pdfData = new Uint8Array(readFileSync(filePath));
  const rows = [];

  try {
    const pdf = await getDocument(pdfData).promise;
    const numPages = pdf.numPages;
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((x) => !!x.str.toString().trim())
        .map((x) => x.str);

      const index = pageNum == 1 && isParty ? 4 : 3;
      for (let i = index; i + 2 < pageText.length; i += 3) {
        rows.push({
          date: pageText[i],
          [isParty ? "party" : "donner"]: pageText[i + 1],
          value: pageText[i + 2],
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

async function run() {
  // const donners = await reader("./donners.pdf");
  // const parties = await reader("./parties.pdf", 4);
  // flush(donners, "donners");
  // flush(parties, "parties");

  const donners = await readJsonFile("./out/donners.json");
  const parties = await readJsonFile("./out/parties.json");
  const d = donner_aggregate(donners);
  const p = party_aggregate(parties);

  flush(d, "donner_wise");
  flush(p, "party_wise");
}

run();

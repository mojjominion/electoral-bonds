import { readFileSync } from "fs";
import { getDocument } from "pdfjs-dist";

const DateRegex =
  /\d{1,2}\/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\/\d{4}/;

export async function reader(filePath, isParty = false) {
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

const purchaserColumns = [
  "serialNo",
  "urn",
  "journalDate",
  "date",
  "dateOfExpiry",
  "donner",
  "prefix",
  "bondNumber",
  "value",
  "issueBranchCode",
  "issueTeller",
  "status",
];

function splitIndexes(data = [], start) {
  const indexes = [];
  for (let i = 0; i < data.length; i++) {
    if (+data[i] == start + 1) {
      indexes.push(i);
      start++;
    }
  }
  return indexes;
}

export async function exhaustiveReader(filePath) {
  // Read the PDF file
  const pdfData = new Uint8Array(readFileSync(filePath));
  const rows = [];
  let serialStart = 0;

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

      const indexes = splitIndexes(pageText, serialStart);
      serialStart = +pageText[indexes[[indexes.length - 1]]];

      for (let j = 0; j < indexes.length; j++) {
        const curIndex = indexes[j];
        const nextIndex = indexes[j + 1];
        const cells = pageText.slice(curIndex, nextIndex);
        const obj = cells.reduce((acc, cur, index) => {
          purchaserColumns[index] && (acc[purchaserColumns[index]] = cur);
          return acc;
        }, {});
        rows.push(obj);
      }
    }
  } catch (error) {
    console.error("[PDF Error]:", error);
  }

  return rows;
}

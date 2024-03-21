import { readFileSync } from "fs";
import { getDocument } from "pdfjs-dist";

function splitIndexes(data = [], start) {
  const indexes = [];
  for (let i = 0; i < data.length; i++) {
    if (+data[i] == start + 1 && data[i].length === `${start + 1}`.length) {
      indexes.push(i);
      start++;
    }
  }
  return indexes;
}

export async function reader(filePath, columns) {
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
          columns[index] && (acc[columns[index]] = cur);
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

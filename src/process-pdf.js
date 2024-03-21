import { flush } from "./flush.js";
import { exhaustiveReader, reader } from "./reader.js";

export async function processPdfs() {
  // const donners = await reader("input/donners.pdf");
  // const parties = await reader("input/parties.pdf", true);
  // flush(donners, "donners");
  // flush(parties, "parties");

  const purchasers = await exhaustiveReader("input/purchasers.pdf");
  flush(purchasers, "purchasers");
}
await processPdfs();

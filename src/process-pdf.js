import { flush } from "./flush.js";
import { reader } from "./reader.js";

export async function processPdfs() {
  const donners = await reader("input/donners.pdf");
  const parties = await reader("input/parties.pdf", true);

  flush(donners, "donners");
  flush(parties, "parties");
}
processPdfs();

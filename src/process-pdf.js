import { flush } from "./flush.js";
import { reader } from "./reader.js";

const purchasersColumns = [
  "serialNo",
  "urn",
  "journalDate",
  "dateOfPurchase",
  "dateOfExpiry",
  "donner",
  "prefix",
  "bondNumber",
  "value",
  "issueBranchCode",
  "issueTeller",
  "status",
];

const redeemersColumns = [
  "serialNo",
  "dateOfEncashment",
  "party",
  "accountNumber",
  "prefix",
  "bondNumber",
  "value",
  "payBranchCode",
  "payTeller",
];

export async function processPdfs() {
  const purchasers = await reader("input/purchasers.pdf", purchasersColumns);
  const redeemers = await reader("input/redeemers.pdf", redeemersColumns);
  flush(purchasers, "donners");
  flush(redeemers, "parties");
}
await processPdfs();

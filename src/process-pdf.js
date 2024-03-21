import { flush } from "./flush.js";
import { exhaustiveReader } from "./reader.js";

const purchasersColumns = [
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

const redeemersColumns = [
  "serialNo",
  "date",
  "party",
  "accountNumber",
  "prefix",
  "bondNumber",
  "value",
  "payBranchCode",
  "payTeller",
];

export async function processPdfs() {
  const purchasers = await exhaustiveReader(
    "input/purchasers.pdf",
    purchasersColumns,
  );
  const redeemers = await exhaustiveReader(
    "input/redeemers.pdf",
    redeemersColumns,
  );
  flush(purchasers, "donners");
  flush(redeemers, "parties");
}
await processPdfs();

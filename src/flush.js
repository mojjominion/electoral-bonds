import { promises } from "fs";

export async function flush(data, name, ext = "json", baseDir = "./out") {
  const jsonString = ext === "json" ? JSON.stringify(data, null, 2) : data; // null and 2 are optional for formatting
  try {
    await promises.writeFile(`${baseDir}/${name}.${ext}`, jsonString, "utf8");
  } catch (err) {
    if (err) {
      console.error("Error writing to file:", err);
      return;
    }
    console.log("JSON data has been written to output.json");
  }
}

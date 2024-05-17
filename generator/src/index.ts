import { generatePackages } from "./generate";
import path from "node:path";
import fs from "node:fs/promises";

async function main() {
  const packagesDirectory = path.join(__dirname, "..", "..", "packages");

  await fs.rm(packagesDirectory, { recursive: true });

  generatePackages({
    directory: packagesDirectory,
    numPackages: 80,
  });
}

if (require.main === module) {
  main();
}

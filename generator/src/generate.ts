import fs from "node:fs/promises";
import path from "node:path";

class ParkMillerPRNG {
  private _currentSeed: number;

  constructor(seed: number) {
    this._currentSeed = seed % 2147483647;
    if (this._currentSeed <= 0) {
      this._currentSeed += 2147483646;
    }
  }

  generate() {
    this._currentSeed = (this._currentSeed * 16807) % 2147483647;
    return this._currentSeed / 2147483647;
  }
}

const CHARACTER_SET = "abcdefghijklmnopqrstuvwxyz";

function randomString({
  length,
  prng,
}: {
  length: number;
  prng: ParkMillerPRNG;
}) {
  const buffer: Array<string> = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(prng.generate() * CHARACTER_SET.length);
    buffer.push(CHARACTER_SET[randomIndex]);
  }
  return buffer.join("");
}

function generateRandomFunctionString(prng: ParkMillerPRNG): string {
  const functionName = randomString({ length: 25, prng });

  const functionString = `
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ${functionName}(): boolean {
  return true;
}
`;

  return functionString;
}

export async function generatePackages({
  directory,
  numPackages,
}: {
  directory: string;
  numPackages: number;
}) {
  await fs.mkdir(directory, { recursive: true });

  const packageNames = [];

  for (let i = 0; i < numPackages; i++) {
    const packagePrng = new ParkMillerPRNG(i * 1_000_000);

    const packageName = randomString({
      length: 10,
      prng: packagePrng,
    });

    await fs.mkdir(path.join(directory, packageName));

    const dependencyNames: Array<string> = [];

    const maxNumDependencies = Math.floor(
      packagePrng.generate() * Math.min(packageNames.length, 5)
    );

    for (let j = 0; j < maxNumDependencies; j++) {
      const dependencyIndex = Math.floor(
        packagePrng.generate() * packageNames.length
      );
      const dependencyName = packageNames[dependencyIndex];
      if (dependencyNames.find((dep) => dep === dependencyName) === undefined) {
        dependencyNames.push(dependencyName);
      }
    }

    const dependencies: { [key: string]: string } = dependencyNames.reduce(
      (acc, dep) => {
        acc[dep] = "1.0.0";
        return acc;
      },
      {} as { [key: string]: string }
    );

    const packageJSON = {
      name: packageName,
      version: "1.0.0",
      packageManager: "yarn@4.2.2",
      dependencies: {
        ...dependencies,
      },
      devDependencies: {
        "@eslint/js": "9.2.0",
        "@types/node": "^20.12.12",
        eslint: "9.2.0",
        typescript: "5.4.5",
        "typescript-eslint": "7.9.0",
      },
    };

    await fs.writeFile(
      path.join(directory, packageName, "package.json"),
      JSON.stringify(packageJSON, null, 2)
    );

    const tsconfigJson = {
      compilerOptions: {
        target: "es2016",
        module: "commonjs",
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        strict: true,
        skipLibCheck: true,
      },
    };

    await fs.writeFile(
      path.join(directory, packageName, "tsconfig.json"),
      JSON.stringify(tsconfigJson, null, 2)
    );

    await fs.mkdir(path.join(directory, packageName, "src"));

    const indexTsBuffer: Array<string> = [];

    for (let j = 0; j < 12_000; j++) {
      indexTsBuffer.push(generateRandomFunctionString(packagePrng));
    }

    await fs.writeFile(
      path.join(directory, packageName, "src", "index.ts"),
      indexTsBuffer.join("\n")
    );

    packageNames.push(packageName);
  }

  console.log(JSON.stringify(packageNames));
}

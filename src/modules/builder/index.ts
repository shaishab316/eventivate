/**
 *
 * Author: @shaishab316
 * Last modify: 03/03/2026
 *
 */

import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { table } from "table";
import {
  BUILDER_FILE_CONFIG,
  MODULE_DIR,
  TBuilderFile,
} from "./Builder.constant";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

async function main() {
  console.clear();
  console.log(chalk.cyan.bold("🚀 Module Builder\n"));

  const { moduleName, filesToCreate } = await inquirer.prompt([
    {
      type: "input",
      name: "moduleName",
      message: chalk.yellow("📦 Module name:"),
      validate: (input: string) =>
        input.trim() ? true : "Module name is required",
    },
    {
      type: "checkbox",
      name: "filesToCreate",
      message: chalk.yellow("📁 Select files:"),
      choices: Object.entries(BUILDER_FILE_CONFIG).map(([key, config]) => ({
        name: capitalize(key),
        value: key,
        checked: config.checked,
      })),
    },
  ]);

  const mName = capitalize(moduleName.trim());
  const folderPath = path.resolve(MODULE_DIR, moduleName);

  const spinner = ora(`Creating ${mName} module...`).start();

  try {
    fs.mkdirSync(folderPath, { recursive: true });

    const generated: Array<[string, string]> = [];

    for (const type of filesToCreate as TBuilderFile[]) {
      const config = BUILDER_FILE_CONFIG[type];

      const filePath = path.join(
        folderPath,
        `${mName}.${type}.${config.extension}`,
      );

      fs.writeFileSync(filePath, config.template(mName) + "\n");

      generated.push([type, chalk.gray(path.relative(MODULE_DIR, filePath))]);
    }

    spinner.succeed(`${mName} module created\n`);

    console.log(
      table([[chalk.cyan("Type"), chalk.cyan("Path")], ...generated]),
    );
  } catch (err) {
    spinner.fail("Failed to create module");
    console.error(err);
  }
}

if (process.env.NODE_ENV !== "production") {
  main();
}

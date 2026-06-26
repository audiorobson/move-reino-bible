/**
 * Admin Editorial — importação, validação de licenças e indexação.
 * CLI placeholder para operações editoriais.
 */

import { createImporter } from "@mrb/bible-importers";
import { validateLicenseForImport } from "@mrb/licensing";

const COMMANDS = ["import-bible", "validate-license", "help"] as const;

async function main() {
  const [,, command, ...args] = process.argv;

  switch (command) {
    case "import-bible": {
      const format = args[0] ?? "json";
      const file = args[1];
      if (!file) {
        console.error("Uso: import-bible <format> <arquivo>");
        process.exit(1);
      }
      const fs = await import("fs/promises");
      const data = await fs.readFile(file, "utf-8");
      const importer = createImporter(format as "json");
      const parsed = await importer.parse(data);
      const result = importer.validate(parsed);
      console.log("Resultado:", result);
      break;
    }
    case "validate-license": {
      const result = validateLicenseForImport({
        workName: "Exemplo",
        origin: "https://example.com",
        licenseType: "LICENSE_OK_PUBLIC_DOMAIN",
        commercialAllowed: false,
        redistributionAllowed: true,
        localStorageAllowed: true,
        attributionRequired: false,
      });
      console.log("Validação:", result);
      break;
    }
    default:
      console.log("Move Reino Bible — Admin Editorial");
      console.log("Comandos:", COMMANDS.join(", "));
  }
}

main().catch(console.error);

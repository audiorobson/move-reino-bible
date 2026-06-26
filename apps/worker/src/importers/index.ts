import {
  importFromJsonFile,
  importHelloaoById,
  importAllFromManifest,
} from "@mrb/bible-importers";

export { importFromJsonFile, importHelloaoById, importAllFromManifest };

export async function runImportJob(
  type: "file" | "helloao" | "all",
  target?: string
) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    switch (type) {
      case "file":
        if (!target) throw new Error("file path required");
        return await importFromJsonFile(prisma, target);
      case "helloao":
        if (!target) throw new Error("helloao id required");
        return await importHelloaoById(prisma, target);
      case "all":
        return await importAllFromManifest(prisma);
      default:
        throw new Error(`Unknown import type: ${type}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

import fs from "node:fs/promises";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/piyus/OneDrive/Documents/TribeTalk/TribeTalk_Minor_Project_Proposal.pptx";
const outputDir = "C:/Users/piyus/OneDrive/Documents/TribeTalk/.tmp/tribetalk-proposal-deck/rendered";

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const presentation = await PresentationFile.importPptx(await FileBlob.load(inputPath));
  for (const [index, slide] of presentation.slides.items.entries()) {
    const image = await presentation.export({ slide, format: "png", scale: 1.5 });
    await writeBlob(`${outputDir}/slide-${String(index + 1).padStart(2, "0")}.png`, image);
  }
  const inspection = await presentation.inspect({ kind: "slide,textbox,shape,notes", maxChars: 30000 });
  await fs.writeFile(`${outputDir}/inspection.ndjson`, inspection.ndjson, "utf8");
  console.log(`Rendered ${presentation.slides.items.length} slides to ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

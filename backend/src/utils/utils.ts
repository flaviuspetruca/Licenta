import AdmZip from "adm-zip";
import lgr from "./logger";

export const addFilesToZip = async (zipBlob: Blob, filesToAdd: { name: string; content: Buffer }[]) => {
    try {
        const blobConverted = await zipBlob.arrayBuffer();
        const buffer = Buffer.from(blobConverted);

        const zip = new AdmZip(buffer);

        filesToAdd.forEach((file) => {
            zip.addFile(file.name, file.content);
        });

        const updatedZipBuffer = zip.toBuffer();

        return updatedZipBuffer;
    } catch (error) {
        lgr.error("Error adding files to ZIP:", error);
        return null;
    }
};

export const unpackZip = async (zipBuffer: Buffer) => {
    try {
        const zip = new AdmZip(zipBuffer);
        const zipEntries = zip.getEntries();
        const files = zipEntries.map((entry) => {
            return {
                name: entry.entryName,
                content: entry.getData(),
            };
        });
        return files;
    } catch (error) {
        lgr.error("Error unpacking ZIP:", error);
        return null;
    }
};

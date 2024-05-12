import {
    BlobSASPermissions,
    BlobServiceClient,
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters,
} from "@azure/storage-blob";

import lgr from "../utils/logger";
import { __dirname } from "..";

import { AZURE_ACCOUNT, AZURE_KEY, AZURE_TMP } from "../configs/globals";

const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_ACCOUNT, AZURE_KEY);
const blobServiceClient = new BlobServiceClient(`https://${AZURE_ACCOUNT}.blob.core.windows.net`, sharedKeyCredential);

export const uploadFile = async (zipBuffer: Buffer, fileName: string) => {
    const containerClient = blobServiceClient.getContainerClient(AZURE_TMP);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    try {
        await blockBlobClient.uploadData(zipBuffer);
        return true;
    } catch (error) {
        lgr.ierror(`Error uploading file "${fileName}":`, error);
        return false;
    }
};

export const generatePreSignedUrl = async (containerName: string, blobName: string) => {
    const blobClient = blobServiceClient.getContainerClient(containerName).getBlobClient(blobName);
    const expiresOn = new Date();
    expiresOn.setMinutes(expiresOn.getMinutes() + 60);
    const sasToken = generateBlobSASQueryParameters(
        {
            containerName: containerName,
            blobName: blobName,
            permissions: BlobSASPermissions.parse("r"),
            startsOn: new Date(),
            expiresOn: expiresOn,
        },
        sharedKeyCredential
    ).toString();
    return `${blobClient.url}?${sasToken}`;
};

export const moveDir = async (sourceContainer: string, destContainer: string, dirId: string) => {
    try {
        const sourceContainerClient = blobServiceClient.getContainerClient(sourceContainer);
        const destContainerClient = blobServiceClient.getContainerClient(destContainer);

        const files = sourceContainerClient.listBlobsFlat({ prefix: dirId });
        for await (const blob of files) {
            const sourceBlobClient = sourceContainerClient.getBlobClient(blob.name);

            const destinationBlobClient = destContainerClient.getBlobClient(blob.name);
            const copyPoller = await destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
            const result = await copyPoller.pollUntilDone();
            if (result.copyStatus !== "success") {
                lgr.ierror(`Error copying blob "${blob.name}"`);
                throw new Error(`Error copying blob "${blob.name}"`);
            }
            await sourceBlobClient.delete();
        }
        return true;
    } catch (error) {
        lgr.ierror(`Move dir: ${dirId}`, error);
        return false;
    }
};

export const downloadFile = async (containerName: string, fileName: string): Promise<Buffer> => {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobClient = containerClient.getBlockBlobClient(fileName);

    const downloadResp = await blobClient.download();
    if (!downloadResp.readableStreamBody) {
        throw new Error("Readable stream is not available");
    }

    const chunks: any[] = [];
    for await (const chunk of downloadResp.readableStreamBody) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
};

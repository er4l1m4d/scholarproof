// utils/uploadToIrys.ts
// Requires: npm install @irys/sdk
import Irys from "@irys/sdk";

export interface IrysUploadResult {
  irys_url: string;
  transaction_id: string;
}

/**
 * Uploads a file (Blob) to Irys Devnet and returns the URL and transaction ID.
 * @param file Blob or File to upload
 * @returns Promise<IrysUploadResult>
 */
export async function uploadToIrys(file: Blob): Promise<IrysUploadResult> {
  // Configure Irys for devnet
  const irys = new Irys({
    network: "devnet",
    token: "ethereum", // or your preferred token
    key: process.env.NEXT_PUBLIC_IRYS_PRIVATE_KEY, // Set this in your .env.local
  });

  // Convert Blob to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload
  const receipt = await irys.upload(buffer, {
    tags: [{ name: "App", value: "ScholarProof" }]
  });

  return {
    irys_url: `https://gateway.irys.xyz/${receipt.id}`,
    transaction_id: receipt.id,
  };
} 
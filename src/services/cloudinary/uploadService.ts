import { getCloudinaryUploadSignature } from "@/services/api/workerAuthService";
import { getIdToken } from "@/services/firebase/authService";

export type CloudinaryUploadResult = {
  assetId: string;
  publicId: string;
  secureUrl: string;
  format: string;
  createdAt: string;
  bytes: number;
};

/**
 * Uploads a generated QR PNG image to Cloudinary using secure signed upload parameters
 * requested from the Cloudflare Worker `/api/cloudinary/sign` endpoint.
 *
 * The Cloudflare Worker validates the user's Firebase ID token and signs the upload
 * using server-side secrets. The client never handles the Cloudinary API secret.
 */
export async function uploadQrToCloudinary(
  localUri: string,
  title: string,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  console.log(`[CloudinaryUpload] 📦 Starting signed upload flow for "${title}"...`);
  if (!localUri) {
    console.error("[CloudinaryUpload] ❌ Aborted: Invalid or missing local image URI.");
    throw new Error("Invalid or missing image data for upload.");
  }

  onProgress?.(15);

  // Step 1: Obtain the current Firebase ID token for authorization
  console.log("[CloudinaryUpload] ⏳ [1/4] Retrieving Firebase ID token...");
  const idToken = await getIdToken();
  if (!idToken) {
    console.error("[CloudinaryUpload] ❌ Aborted: No active Firebase ID token available.");
    throw new Error(
      "You must be signed in with an online account to back up QR images to Cloudinary.",
    );
  }
  console.log("[CloudinaryUpload] ✅ [1/4] Firebase ID token retrieved.");

  onProgress?.(30);

  // Step 2: Request signed Cloudinary upload signature from Cloudflare Worker
  console.log("[CloudinaryUpload] ⏳ [2/4] Requesting upload signature from Cloudflare Worker...");
  const signResult = await getCloudinaryUploadSignature(idToken);

  if (!signResult.success || !signResult.data) {
    console.error(`[CloudinaryUpload] ❌ [2/4] Worker signing failed: ${signResult.error}`);
    throw new Error(
      signResult.error || "Failed to obtain upload signature from server.",
    );
  }

  const signData = signResult.data;
  console.log(
    `[CloudinaryUpload] ✅ [2/4] Signature received (Cloud: ${signData.cloudName}, Folder: ${signData.folder}).`,
  );

  onProgress?.(55);

  // Step 3: Construct multipart FormData for Cloudinary signed upload API
  console.log("[CloudinaryUpload] ⏳ [3/4] Preparing multipart form payload...");
  const formData = new FormData();

  if (localUri.startsWith("data:")) {
    // Direct Data-URI payload
    formData.append("file", localUri);
  } else {
    // Local filesystem URI (React Native FormData file format)
    const fileName = `${signData.publicId || title || "qr_code"}.png`;
    formData.append("file", {
      uri: localUri,
      type: "image/png",
      name: fileName,
    } as any);
  }

  formData.append("api_key", signData.apiKey);
  formData.append("timestamp", String(signData.timestamp));
  formData.append("signature", signData.signature);
  formData.append("folder", signData.folder);

  if (signData.publicId) {
    formData.append("public_id", signData.publicId);
  }
  if (signData.overwrite !== undefined) {
    formData.append("overwrite", String(signData.overwrite));
  }

  onProgress?.(75);

  // Step 4: Execute signed upload directly to Cloudinary CDN
  const uploadEndpoint = `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`;
  console.log(`[CloudinaryUpload] ⏳ [4/4] Sending POST request to Cloudinary (${uploadEndpoint})...`);

  const response = await fetch(uploadEndpoint, {
    method: "POST",
    body: formData,
  });

  const responseStatus = response.status;
  const responseData: any = await response.json();

  if (!response.ok) {
    const errorMessage =
      responseData?.error?.message ||
      JSON.stringify(responseData) ||
      `Cloudinary upload error (${responseStatus})`;
    console.error(
      `[CloudinaryUpload] ❌ [4/4] Upload rejected (${responseStatus}): ${errorMessage}`,
    );
    throw new Error(errorMessage);
  }

  console.log(
    `[CloudinaryUpload] ✅ [4/4] Upload successful! Public ID: "${responseData.public_id}", CDN URL: ${responseData.secure_url}`,
  );

  onProgress?.(100);

  return {
    assetId: responseData.asset_id || `cld_${Date.now()}`,
    publicId: responseData.public_id || signData.publicId || "",
    secureUrl: responseData.secure_url,
    format: responseData.format || "png",
    createdAt: responseData.created_at || new Date().toISOString(),
    bytes: responseData.bytes || 0,
  };
}


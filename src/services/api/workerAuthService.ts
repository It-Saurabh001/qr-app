export const WORKER_API_BASE_URL =
  process.env.EXPO_PUBLIC_WORKER_API_URL ||
  "https://qr-app-worker.9494saurabhyadav.workers.dev";

export interface WorkerUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  [key: string]: unknown;
}

export interface WorkerAuthResponse {
  success: boolean;
  status: number;
  user?: WorkerUser;
  error?: string;
}

export interface CloudinarySignResponse {
  cloudName: string;
  apiKey: string;
  signature: string;
  timestamp: number;
  folder: string;
  publicId?: string;
  overwrite?: boolean;
  [key: string]: unknown;
}

/**
 * Sends a GET request to the Cloudflare Worker `/api/me` endpoint
 * using the Firebase ID token in the Authorization header.
 *
 * Header format: Authorization: Bearer <token>
 */
export async function verifyWithCloudflareWorker(
  idToken: string,
): Promise<WorkerAuthResponse> {
  if (!idToken || typeof idToken !== "string") {
    console.warn("[WorkerAuth] No valid ID token provided for Cloudflare Worker verification.");
    return {
      success: false,
      status: 400,
      error: "Missing or invalid ID token",
    };
  }

  const endpoint = `${WORKER_API_BASE_URL}/api/me`;
  console.log(`[WorkerAuth] 📡 Sending GET request to ${endpoint}...`);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        Accept: "application/json",
      },
    });

    const status = response.status;
    const responseText = await response.text();
    let responseData: any = null;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      console.warn(
        `[WorkerAuth] ⚠️ Cloudflare Worker verification returned status ${status}:`,
        responseData,
      );
      return {
        success: false,
        status,
        error: responseData?.error || responseData?.message || `HTTP ${status}`,
      };
    }

    console.log(
      `[WorkerAuth] ✅ Cloudflare Worker verified Firebase user successfully (status ${status}):`,
      responseData,
    );

    return {
      success: true,
      status,
      user: responseData?.user || responseData,
    };
  } catch (error: any) {
    console.error(
      "[WorkerAuth] ❌ Network error while calling Cloudflare Worker /api/me:",
      error,
    );
    return {
      success: false,
      status: 0,
      error: error?.message || "Network request failed",
    };
  }
}

/**
 * Requests signed Cloudinary upload parameters from the Cloudflare Worker.
 * Endpoint: POST /api/cloudinary/sign
 * Header: Authorization: Bearer <firebase_id_token>
 */
export async function getCloudinaryUploadSignature(
  idToken: string,
): Promise<{ success: boolean; data?: CloudinarySignResponse; error?: string }> {
  if (!idToken || typeof idToken !== "string") {
    console.warn("[WorkerAuth] ⚠️ Missing or invalid Firebase ID token for Cloudinary signing.");
    return {
      success: false,
      error: "Missing or invalid Firebase ID token for Cloudinary signing.",
    };
  }

  const endpoint = `${WORKER_API_BASE_URL}/api/cloudinary/sign`;
  console.log(`[WorkerAuth] 📡 Requesting Cloudinary upload signature from ${endpoint}...`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({}),
    });

    const status = response.status;
    const responseText = await response.text();
    let responseData: any = null;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      const errMsg = responseData?.error || responseData?.message || `HTTP ${status}`;
      console.warn(`[WorkerAuth] ⚠️ Cloudflare Worker /api/cloudinary/sign failed (${status}): ${errMsg}`);
      return {
        success: false,
        error: errMsg,
      };
    }

    console.log(
      `[WorkerAuth] ✅ Cloudinary signature generated (Folder: "${responseData.folder}", PublicId: "${responseData.publicId}").`,
    );

    return {
      success: true,
      data: responseData as CloudinarySignResponse,
    };
  } catch (error: any) {
    const errMsg = error?.message || "Network request failed";
    console.error(`[WorkerAuth] ❌ Cloudflare Worker /api/cloudinary/sign network error: ${errMsg}`);
    return {
      success: false,
      error: errMsg,
    };
  }
}


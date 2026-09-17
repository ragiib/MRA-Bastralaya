import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';

export interface SavedImageResult {
  url: string; // Relative URL (for local) or Secure HTTPS URL (for Cloudinary)
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Storage provider interface to support cloud migrations (e.g. Cloudinary / S3)
 * without requiring changes to upload forms or API routes.
 */
export interface ImageStorageProvider {
  saveImage(fileBuffer: Buffer, originalFilename: string, mimeType: string): Promise<SavedImageResult>;
  deleteImage(imageUrl: string): Promise<boolean>;
}

/**
 * Helper function to parse and extract the Cloudinary public_id from a full asset URL.
 * Handles transformations, version segments (e.g., v1725200000), folders, and extensions.
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  // If already a public ID (does not start with http/https or /)
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    return url;
  }

  const parts = url.split('/image/upload/');
  if (parts.length < 2) return null;

  let pathWithParams = parts[1];
  // Strip query parameters or hashes
  pathWithParams = pathWithParams.split('?')[0].split('#')[0];

  const segments = pathWithParams.split('/');
  const cleanSegments: string[] = [];
  let foundVersionOrFolder = false;

  for (const seg of segments) {
    // Check if version segment: e.g. v1726550000
    if (/^v\d+$/.test(seg)) {
      foundVersionOrFolder = true;
      continue;
    }
    // Skip transformation segment before folder (contains commas, colons, or standard prefix keys like c_scale,w_500)
    if (!foundVersionOrFolder && (seg.includes(',') || /^[a-z]{1,2}_/.test(seg))) {
      continue;
    }
    foundVersionOrFolder = true;
    cleanSegments.push(seg);
  }

  if (cleanSegments.length === 0) return null;

  const fullPath = cleanSegments.join('/');
  // Remove file extension from the last segment
  const dotIndex = fullPath.lastIndexOf('.');
  if (dotIndex !== -1) {
    return fullPath.substring(0, dotIndex);
  }
  return fullPath;
}

/**
 * Cloudinary implementation of ImageStorageProvider.
 * Uploads images under the 'mra-bastralaya/products' folder and returns secure HTTPS URLs.
 */
export class CloudinaryStorageProvider implements ImageStorageProvider {
  private readonly folder: string;

  constructor(customFolder?: string) {
    this.folder = customFolder || 'mra-bastralaya/products';
  }

  private configureCloudinary() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    const missingKeys: string[] = [];
    if (!cloudName) missingKeys.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missingKeys.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missingKeys.push('CLOUDINARY_API_SECRET');

    console.log('[CLOUDINARY CONFIG CHECK]', {
      cloud_name: cloudName ? `${cloudName.substring(0, 3)}*** (${cloudName.length} chars)` : '[MISSING]',
      api_key: apiKey ? `***${apiKey.slice(-4)} (${apiKey.length} chars)` : '[MISSING]',
      api_secret: apiSecret ? `[CONFIGURED] (${apiSecret.length} chars)` : '[MISSING]',
    });

    if (missingKeys.length > 0) {
      const msg = `Missing Cloudinary environment variable(s): [${missingKeys.join(', ')}]. Please configure them in .env.local and restart the server.`;
      console.error(`[CLOUDINARY CONFIG ERROR] ${msg}`);
      throw new Error(msg);
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    console.log('[CLOUDINARY CONFIG OK] Cloudinary configured successfully.');
  }

  async saveImage(fileBuffer: Buffer, originalFilename: string, mimeType: string): Promise<SavedImageResult> {
    console.log(`[CLOUDINARY UPLOAD START] Uploading "${originalFilename}" (${(fileBuffer.length / 1024).toFixed(1)} KB, MIME: ${mimeType}) to folder "${this.folder}"...`);
    this.configureCloudinary();

    return new Promise<SavedImageResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: this.folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            console.error('[CLOUDINARY UPLOAD FAILED]', {
              message: error?.message,
              http_code: error?.http_code,
              name: error?.name,
            });
            return reject(error || new Error('Upload to Cloudinary failed with empty response.'));
          }

          console.log(`[CLOUDINARY UPLOAD SUCCESS] Asset uploaded successfully. Public ID: "${result.public_id}", URL: ${result.secure_url}`);
          resolve({
            url: result.secure_url,
            filename: result.public_id,
            size: result.bytes || fileBuffer.length,
            mimeType: result.format ? `image/${result.format}` : mimeType,
          });
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return false;
    }

    // Gracefully handle legacy local storage paths if any exist
    if (imageUrl.startsWith('/uploads/products/')) {
      try {
        const localProvider = new LocalFileStorageProvider();
        return await localProvider.deleteImage(imageUrl);
      } catch {
        return false;
      }
    }

    const publicId = extractCloudinaryPublicId(imageUrl);
    if (!publicId) {
      console.warn(`[CLOUDINARY STORAGE] Could not extract publicId from URL: ${imageUrl}`);
      return false;
    }

    try {
      this.configureCloudinary();
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true,
      });

      return result.result === 'ok' || result.result === 'not found';
    } catch (err) {
      console.error(`[CLOUDINARY STORAGE ERROR] Failed to delete asset ${publicId}:`, err);
      return false;
    }
  }
}

/**
 * Local filesystem implementation of ImageStorageProvider.
 * Saves files under process.cwd()/public/uploads/products.
 */
export class LocalFileStorageProvider implements ImageStorageProvider {
  private readonly uploadDir: string;
  private readonly publicUrlPrefix = '/uploads/products';

  constructor(customUploadDir?: string) {
    this.uploadDir = customUploadDir || path.join(process.cwd(), 'public', 'uploads', 'products');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private getExtensionFromMimeOrName(originalFilename: string, mimeType: string): string {
    const extFromMime: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };

    if (extFromMime[mimeType.toLowerCase()]) {
      return extFromMime[mimeType.toLowerCase()];
    }

    const ext = path.extname(originalFilename).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return ext === '.jpeg' ? '.jpg' : ext;
    }

    return '.jpg';
  }

  async saveImage(fileBuffer: Buffer, originalFilename: string, mimeType: string): Promise<SavedImageResult> {
    this.ensureDirectoryExists();

    const ext = this.getExtensionFromMimeOrName(originalFilename, mimeType);
    const uniqueId = crypto.randomUUID();
    const timestamp = Date.now();
    const filename = `${timestamp}-${uniqueId}${ext}`;
    const targetFilePath = path.join(this.uploadDir, filename);

    await fs.promises.writeFile(targetFilePath, fileBuffer);

    return {
      url: `${this.publicUrlPrefix}/${filename}`,
      filename,
      size: fileBuffer.length,
      mimeType,
    };
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    // Only delete files belonging to the upload directory
    if (!imageUrl || !imageUrl.startsWith(this.publicUrlPrefix)) {
      return false;
    }

    // Extract filename and guard against path traversal
    const filename = path.basename(imageUrl);
    const targetFilePath = path.join(this.uploadDir, filename);

    // Verify resolved path stays strictly within uploadDir
    const normalizedTarget = path.normalize(targetFilePath);
    if (!normalizedTarget.startsWith(path.normalize(this.uploadDir))) {
      console.warn(`[SECURITY WARNING] Attempted path traversal in image deletion: ${imageUrl}`);
      return false;
    }

    try {
      if (fs.existsSync(targetFilePath)) {
        await fs.promises.unlink(targetFilePath);
        return true;
      }
      return false;
    } catch (err) {
      console.error(`[STORAGE ERROR] Failed to delete image file ${targetFilePath}:`, err);
      return false;
    }
  }
}

// Global singleton instance - swapped to CloudinaryStorageProvider
export const imageStorage: ImageStorageProvider = new CloudinaryStorageProvider();
export default imageStorage;

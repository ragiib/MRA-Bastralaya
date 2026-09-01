import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface SavedImageResult {
  url: string; // Relative URL, e.g. '/uploads/products/1725200000000-uuid.webp'
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Storage provider interface to support future cloud migrations (e.g. S3 / R2 / GCS)
 * without requiring changes to API routes or frontend components.
 */
export interface ImageStorageProvider {
  saveImage(fileBuffer: Buffer, originalFilename: string, mimeType: string): Promise<SavedImageResult>;
  deleteImage(imageUrl: string): Promise<boolean>;
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

// Global singleton instance
export const imageStorage: ImageStorageProvider = new LocalFileStorageProvider();
export default imageStorage;

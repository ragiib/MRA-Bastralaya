import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { imageStorage } from '@/lib/storage/image-storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Megabytes
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * POST /api/admin/products/upload-image
 * Authenticated ADMIN endpoint to accept multipart image upload.
 * Validates mime type and file size, saves locally or to cloud provider via abstraction.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator credentials required.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided in request.' },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Invalid file type (${file.type}). Only JPEG, PNG, and WebP images are allowed.`,
        },
        { status: 400 }
      );
    }

    // Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await imageStorage.saveImage(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
      size: result.size,
    });
  } catch (error) {
    console.error('[API ADMIN IMAGE UPLOAD ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to upload and store product image.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/upload-image
 * Allows authenticated admin to immediately remove an uploaded image file.
 */
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator credentials required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Image URL is required.' }, { status: 400 });
    }

    const deleted = await imageStorage.deleteImage(url);

    return NextResponse.json({
      success: true,
      deleted,
    });
  } catch (error) {
    console.error('[API ADMIN IMAGE DELETE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to delete image file.' },
      { status: 500 }
    );
  }
}

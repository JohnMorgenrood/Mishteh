import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

// Maximum file size (5MB)
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880');
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf').split(',');

// POST - Upload document
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const requestId = formData.get('requestId') as string | null;
    const isPublicRequestPhoto = documentType === 'REQUEST_PHOTO';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
      return NextResponse.json({ error: 'Secure private storage is not configured.' }, { status: 503 });
    }

    if (isPublicRequestPhoto) {
      if (!requestId || !file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Request photos must be JPG or PNG images attached to a request.' }, { status: 400 });
      }
      const helpRequest = await prisma.request.findUnique({ where: { id: requestId }, select: { userId: true } });
      if (!helpRequest || (helpRequest.userId !== session.user.id && session.user.userType !== 'ADMIN')) {
        return NextResponse.json({ error: 'You cannot add a photo to this request.' }, { status: 403 });
      }
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blob = await put(isPublicRequestPhoto ? `request-media/${requestId}/${safeName}` : `identity/${session.user.id}/document-${safeName}`, file, {
      access: isPublicRequestPhoto ? 'public' : 'private',
      addRandomSuffix: true,
    });

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        requestId: requestId || undefined,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: blob.url,
        documentType: documentType || 'general',
        status: isPublicRequestPhoto ? 'VERIFIED' : 'PENDING',
      },
    });

    return NextResponse.json(
      { 
        message: 'Document uploaded successfully',
        document: { id: document.id, fileName: document.fileName, fileType: document.fileType, fileSize: document.fileSize, filePath: isPublicRequestPhoto ? document.filePath : undefined, documentType: document.documentType, status: document.status, uploadedAt: document.uploadedAt },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

// GET - Fetch user's documents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    const where: any = { userId: session.user.id };
    if (requestId) {
      where.requestId = requestId;
    }

    const documents = await prisma.document.findMany({
      where,
      select: { id: true, fileName: true, fileType: true, fileSize: true, documentType: true, status: true, uploadedAt: true, verifiedAt: true },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return NextResponse.json({ documents }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

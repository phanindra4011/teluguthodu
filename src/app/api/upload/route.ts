import { NextRequest, NextResponse } from 'next/server';

// Ensure this route runs in the Node.js runtime (not edge) so native libs work
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.type === 'application/pdf') {
      // Use dynamic import with proper error handling
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const data = await pdfParse(fileBuffer);
        text = data.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json({ error: 'Failed to parse PDF file.' }, { status: 500 });
      }
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const mammoth = await import('mammoth');
        const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
        text = value;
      } catch (mammothError) {
        console.error('Word document parsing error:', mammothError);
        return NextResponse.json({ error: 'Failed to parse Word document.' }, { status: 500 });
      }
    } else if (file.type === 'text/plain') {
      text = fileBuffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('File processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to process file: ${errorMessage}` }, { status: 500 });
  }
}

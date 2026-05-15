import type { NextApiRequest, NextApiResponse } from 'next';

interface OCRResponse {
    success: boolean;
    text?: string;
    filename?: string;
    processing_time?: number;
    confidence?: number;
    file_size_kb?: number;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<OCRResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // Use backend:8000 in Docker, localhost:8000 for local development
        const isDocker = process.env.NEXT_ENV === 'docker' || process.env.NODE_ENV === 'production';
        const apiBase = isDocker ? 'http://backend:8000' : 'http://localhost:8000';

        console.log('API Base:', apiBase);
        console.log('Content-Type:', req.headers['content-type']);

        // Read the raw stream from the request
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const body = Buffer.concat(chunks);

        console.log('Body size:', body.length);
        console.log('Body is Buffer:', Buffer.isBuffer(body));

        // Forward the multipart form data with original headers
        const response = await fetch(`${apiBase}/api/ocr`, {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': req.headers['content-type'] || '',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Backend error:', data);
            return res.status(response.status).json({
                success: false,
                error: data.detail || data.error || 'OCR processing failed',
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('API Route Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        });
    }
}

// Disable Next.js body parsing to get raw multipart stream
export const config = {
    api: {
        bodyParser: false,
    },
};

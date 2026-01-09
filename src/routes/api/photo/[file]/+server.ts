import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export const GET: RequestHandler = async ({ params }) => {
    const filename = params.file;

    const baseDir = 'static/uploads';
    const eventPath = path.join(baseDir, 'events', filename);
    const uploadPath = path.join(baseDir, filename);

    let filePath: string | null = null;

    // Проверяем папку /events
    if (fs.existsSync(eventPath)) {
        filePath = eventPath;
    }
    // Проверяем /uploads
    else if (fs.existsSync(uploadPath)) {
        filePath = uploadPath;
    }

    if (!filePath) {
        throw error(404, 'File not found');
    }

    const file = fs.readFileSync(filePath);

    return new Response(file, {
        headers: {
            'Content-Type': getMimeType(filename),
            'Cache-Control': 'no-cache'
        }
    });
};

function getMimeType(filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        case 'gif':
            return 'image/gif';
        default:
            return 'application/octet-stream';
    }
}

import { HttpStatus } from "@/constants/status.constant";
import { uploadToS3 } from "@/utils/s3Storage.utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // Verify Admin Auth
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: HttpStatus.UNAUTHORIZED });
        }

        const token = authHeader.split(' ')[1];
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            const payload = JSON.parse(jsonPayload);
            if (payload.role !== 'admin') throw new Error("Not admin");
        } catch {
            return NextResponse.json({ success: false, message: "Invalid token" }, { status: HttpStatus.UNAUTHORIZED });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ success: false, message: "No file uploaded" }, { status: HttpStatus.BAD_REQUEST });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const result = await uploadToS3({
            originalname: file.name,
            buffer: buffer,
            mimetype: file.type,
        }, 'vehicles');

        return NextResponse.json({
            success: true,
            data: {
                key: result.key,
                url: result.signedUrl 
            }
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, message: "Upload failed" }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
    }
}

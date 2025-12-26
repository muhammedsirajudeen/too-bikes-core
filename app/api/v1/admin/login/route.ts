import { HttpStatus } from "@/constants/status.constant";
import { AdminModel } from "@/model/admin.model";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt.utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPermissionsForRole, AdminRole } from "@/constants/permissions.constant";

// Schema for admin login
const adminLoginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

export interface AdminLoginResponse {
    success: boolean;
    message: string;
    token?: string;
    admin?: {
        id: string;
        username: string;
        role: string;
        permissions: string[];
    };
    error?: Array<{ message?: string; path?: string[] }>;
}

export const POST = withLoggingAndErrorHandling(async (request: NextRequest) => {
    const body = await request.json();
    const validated = adminLoginSchema.safeParse(body);

    if (!validated.success) {
        return NextResponse.json({
            success: false,
            message: "Invalid request",
            error: validated.error.issues
        }, { status: HttpStatus.BAD_REQUEST });
    }

    const { username, password } = validated.data;

    // Find admin by username
    const admin = await AdminModel.findOne({ username });

    if (!admin) {
        return NextResponse.json({
            success: false,
            message: "Invalid username or password",
        }, { status: HttpStatus.UNAUTHORIZED });
    }

    // Direct password comparison (no hashing)
    if (admin.password !== password) {
        return NextResponse.json({
            success: false,
            message: "Invalid username or password",
        }, { status: HttpStatus.UNAUTHORIZED });
    }

    // Get role from database (defaults to staff if not set)
    const adminRole = (admin.role || AdminRole.STAFF) as AdminRole;
    
    // Get permissions for this role
    const permissions = getPermissionsForRole(adminRole);

    // Generate JWT tokens with admin ID, username, and role
    const payload = {
        id: admin._id.toString(),
        username: admin.username,
        role: adminRole,
    };

    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Create response with access token and permissions
    const response = NextResponse.json({
        success: true,
        message: "Login successful",
        token,
        admin: {
            id: admin._id.toString(),
            username: admin.username,
            role: adminRole,
            permissions, // Send resolved permissions to frontend
        },
    }, { status: HttpStatus.OK });

    // Set refresh token as HTTP-only cookie
    response.cookies.set('admin_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 24 * 60 * 60, // 8 days in seconds
        path: '/',
    });

    return response;
});


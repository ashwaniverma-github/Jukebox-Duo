import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Mobile Auth Request Body:', body);
        console.log('Env Check - Client ID:', !!process.env.GOOGLE_CLIENT_ID, 'Secret:', !!process.env.GOOGLE_CLIENT_SECRET);
        const { code, redirectUri, accessToken, idToken } = body;

        if (!code && !accessToken && !idToken) {
            return NextResponse.json({ error: 'Missing authorization code, access token, or ID token' }, { status: 400 });
        }

        let access_token = accessToken;
        let google_id_token = idToken;

        // If we have an idToken (from iOS client), verify it
        if (idToken) {
            const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

            if (!tokenInfoResponse.ok) {
                const error = await tokenInfoResponse.text();
                console.error('ID token verification error:', error);
                return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 });
            }

            const tokenInfo = await tokenInfoResponse.json();
            console.log('Token info:', tokenInfo);

            // For idToken flow, we'll use tokeninfo to get user data
            google_id_token = idToken;
        } else if (code) {
            // Use the redirect URI from the client, or default to the mobile scheme
            const redirect_uri = redirectUri || 'musicduomobile://redirect';

            // Exchange authorization code for tokens
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id: process.env.GOOGLE_CLIENT_ID!,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                    redirect_uri,
                    grant_type: 'authorization_code',
                }),
            });

            if (!tokenResponse.ok) {
                const error = await tokenResponse.text();
                console.error('Token exchange error:', error);
                return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 });
            }

            const tokens = await tokenResponse.json();
            access_token = tokens.access_token;
        }

        // Get user info from Google
        let googleUser;

        if (google_id_token && !access_token) {
            // For idToken flow, verify and extract user info
            const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${google_id_token}`);

            if (!tokenInfoResponse.ok) {
                return NextResponse.json({ error: 'Failed to verify ID token' }, { status: 500 });
            }

            const tokenInfo = await tokenInfoResponse.json();
            googleUser = {
                email: tokenInfo.email,
                name: tokenInfo.name,
                picture: tokenInfo.picture
            };
        } else if (access_token) {
            // For access token flow, fetch user info
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            if (!userInfoResponse.ok) {
                return NextResponse.json({ error: 'Failed to get user info' }, { status: 500 });
            }

            googleUser = await userInfoResponse.json();
        } else {
            return NextResponse.json({ error: 'No valid authentication method' }, { status: 400 });
        }

        if (!googleUser.email) {
            return NextResponse.json({ error: 'Invalid user data' }, { status: 401 });
        }

        // Upsert user in database
        const user = await prisma.user.upsert({
            where: { email: googleUser.email },
            update: {
                name: googleUser.name || undefined,
                image: googleUser.picture || undefined,
            },
            create: {
                email: googleUser.email,
                name: googleUser.name || undefined,
                image: googleUser.picture || undefined,
            },
        });

        // Create JWT token for mobile
        const secret = process.env.NEXTAUTH_SECRET || 'your-secret-key';
        const token = jwt.sign(
            {
                sub: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
            },
            secret,
            { expiresIn: '7d' } // 7 days expiration
        );

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
            },
        });
    } catch (error) {
        console.error('Mobile auth error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Helper to fetch a remote image and convert it to base64
async function fetchRemoteImage(url) {
    try {
        console.log("Fetching remote image:", url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch remote image: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        return {
            base64,
            mimeType: mimeType.split(';')[0].trim()
        };
    } catch (error) {
        console.error("Error fetching remote image:", error);
        throw new Error(`Could not fetch image from URL: ${url}`);
    }
}

export async function POST(req) {
    console.log("API Route: Starting Vertex AI VTO generation");

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || "gen-lang-client-0044079183";
    const location = process.env.GOOGLE_CLOUD_REGION || process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

    if (!projectId || !location) {
        return NextResponse.json({ success: false, error: "GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_REGION environment variables are not set" }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { personImage, clothingImage, clothingImageUrl, userId, hasTries } = body;

        // Server-side credit guard — blocks direct API abuse
        // Reject only when the user is identified AND has no tries left (neither free nor paid)
        if (userId && hasTries === false) {
            return NextResponse.json(
                { success: false, error: 'No VTO credits remaining. Please purchase a credit pack.' },
                { status: 402 }
            );
        }

        if (!personImage) {
            return NextResponse.json({ success: false, error: "Missing personImage" }, { status: 400 });
        }
        if (!clothingImage && !clothingImageUrl) {
            return NextResponse.json({ success: false, error: "Missing clothingImage or clothingImageUrl" }, { status: 400 });
        }

        // Build client — prefer inline JSON credentials (works on Vercel/deployed envs)
        let clientOptions = { vertexai: true, project: projectId, location };
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
            const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
            // Fix escaped newlines in private_key — hosting panels often store \n as literal \\n
            if (credentials.private_key) {
                credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
            }
            clientOptions.googleAuthOptions = { credentials };
        }
        const client = new GoogleGenAI(clientOptions);

        const personData = personImage.split(',')[1];

        let clothingData;
        let clothingMimeType = 'image/jpeg'; // Default mime type

        if (clothingImageUrl) {
            // Resolve relative URLs — server-side fetch requires an absolute URL
            const absoluteUrl = clothingImageUrl.startsWith('/')
                ? `${new URL(req.url).origin}${clothingImageUrl}`
                : clothingImageUrl;
            const fetched = await fetchRemoteImage(absoluteUrl);
            clothingData = fetched.base64;
            clothingMimeType = fetched.mimeType;
        } else if (clothingImage) {
            // Already base64
            clothingData = clothingImage.split(',')[1];
            // Attempt to extract mime type from base64 string if available, otherwise default
            const mimeMatch = clothingImage.match(/^data:(.*?);base64,/);
            if (mimeMatch && mimeMatch[1]) {
                clothingMimeType = mimeMatch[1];
            }
        }

        const personImagePart = {
            // Vertex AI Imagen models (like VTO) expect 'imageBytes', not 'inlineData'
            imageBytes: personData,
            mimeType: 'image/jpeg'
        };

        const clothingImagePart = {
            imageBytes: clothingData,
            mimeType: clothingMimeType // Use dynamically determined mimeType
        };

        let response;
        const models = client.models;

        // Try both method naming conventions
        if (models && typeof models.recontextImage === 'function') {
            response = await models.recontextImage({
                model: 'virtual-try-on-001',
                source: {
                    personImage: personImagePart,
                    productImages: [{ productImage: clothingImagePart }]
                },
                config: {
                    outputMimeType: 'image/jpeg',
                    numberOfImages: 1,
                    safetyFilterLevel: 'BLOCK_LOW_AND_ABOVE'
                }
            });
        } else if (models && typeof models.recontext_image === 'function') {
            response = await models.recontext_image({
                model: 'virtual-try-on-001',
                source: {
                    personImage: personImagePart,
                    productImages: [{ productImage: clothingImagePart }]
                },
                config: {
                    outputMimeType: 'image/jpeg',
                    numberOfImages: 1,
                    safetyFilterLevel: 'BLOCK_LOW_AND_ABOVE'
                }
            });
        } else {
            const keys = models ? Object.keys(models).join(", ") : "null";
            console.log("Methods not found. Keys:", keys);
            return NextResponse.json({ success: false, error: "The required VTO method is not found in the SDK." }, { status: 500 });
        }

        // Safely extract image
        const generatedImages = response && response.generatedImages;
        if (!generatedImages || !Array.isArray(generatedImages) || generatedImages.length === 0) {
            // Check if response has an error property or similar
            console.log("No generated images in response:", JSON.stringify(response, null, 2));
            return NextResponse.json({ success: false, error: "No image generated." }, { status: 500 });
        }

        const firstImage = generatedImages[0].image;
        if (!firstImage) {
            return NextResponse.json({ success: false, error: "Empty image data received." }, { status: 500 });
        }

        let base64String = "";

        if (typeof firstImage.imageBytes === 'string') {
            base64String = firstImage.imageBytes;
        } else if (firstImage.imageBytes) {
            base64String = Buffer.from(firstImage.imageBytes).toString('base64');
        } else {
            return NextResponse.json({ success: false, error: "Unknown image data format." }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            result: `data:image/jpeg;base64,${base64String}`
        });

    } catch (error) {
        // STRICTLY log only the message
        const msg = error instanceof Error ? error.message : String(error);
        console.error("API Route VTO Error:", msg);

        // Log status if present (e.g. 403, 404 from Google API)
        if (error.status) console.error("Error Status:", error.status);

        return NextResponse.json({
            success: false,
            error: msg || "An unknown error occurred."
        }, { status: 500 });
    }
}

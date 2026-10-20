import { GoogleGenAI } from "@google/genai";
import { STATIC_KNOWLEDGE } from "@/lib/server/staticKnowledge";
import { searchProducts, getCategories, getBrands, getDeliveryInfo, getProductVariants, getActiveOffers, getStoreStats } from "@/lib/server/chatContext";
import { getProductBySlug } from "@/lib/server/getProductBySlug";
import { getItemSpecs } from "@/lib/server/itemSpecs";

const MODEL = "gemini-2.5-flash";

const TOOL_DEFINITIONS = [{
    functionDeclarations: [
        {
            name: "search_products",
            description: "Search for products by any attribute: name, style number, category, brand, price, fabric, color, size, or type. Returns full product info including available colors, sizes, and per-variant stock levels. ALWAYS use this tool for ANY product question — including 'most expensive', 'cheapest', 'highest price', 'what products do you have', color/size availability, stock, or any combination. NEVER answer product questions from memory.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "The search term. Use the customer's words directly, e.g. 'most expensive product', 'cheapest panjabi', 'kurti blue XL', 'women kurta', 'all products'" }
                },
                required: ["query"]
            }
        },
        {
            name: "get_categories",
            description: "Get all available product categories in the store.",
            parameters: { type: "object", properties: {} }
        },
        {
            name: "get_brands",
            description: "Get all available brands sold in the store.",
            parameters: { type: "object", properties: {} }
        },
        {
            name: "get_delivery_info",
            description: "Get delivery areas and delivery charges by district.",
            parameters: { type: "object", properties: {} }
        },
        {
            name: "get_product_variants",
            description: "Get available colors, sizes, stock availability, SKUs and pricing for a specific product. Use when the customer asks what colors or sizes are available, whether something is in stock, or about variant-level pricing.",
            parameters: {
                type: "object",
                properties: {
                    product_name: { type: "string", description: "Product name or style number to look up" }
                },
                required: ["product_name"]
            }
        },
        {
            name: "get_active_offers",
            description: "Get current promotions, discounts and special offers running in the store.",
            parameters: { type: "object", properties: {} }
        },
        {
            name: "get_store_stats",
            description: "Get live store statistics from the database: total product count, active product count, number of brands, and number of categories. ALWAYS use this when the user asks how many products we have, or anything about store size or stats.",
            parameters: { type: "object", properties: {} }
        },
        {
            name: "escalate_to_human",
            description: "Call this tool whenever you cannot fully answer the customer's question using your other tools or the store knowledge document — this is your single, universal fallback. Always call it for questions about an EXISTING order (tracking, status, delay, cancellation, refund, changing an address, or any other order-specific detail), since you never have real order data. Also call it for any product fact missing from tool results, or anything else you'd otherwise have to guess at. Pass the customer's exact question. After calling this tool, tell the customer our team will follow up between 10AM–10PM.",
            parameters: {
                type: "object",
                properties: {
                    question: { type: "string", description: "The customer's unanswered question, word for word" }
                },
                required: ["question"]
            }
        }
    ]
}];

async function executeTool(name, args) {
    switch (name) {
        case "search_products":        return await searchProducts(args?.query || "");
        case "get_categories":         return await getCategories();
        case "get_brands":             return await getBrands();
        case "get_delivery_info":      return await getDeliveryInfo();
        case "get_product_variants":   return await getProductVariants(args?.product_name || "");
        case "get_active_offers":      return await getActiveOffers();
        case "get_store_stats":        return await getStoreStats();
        case "escalate_to_human":      return { escalated: true, question: args?.question || "" };
        default:                       return "Unknown tool.";
    }
}

export async function POST(req) {
    try {
        const { message, history = [], pageContext = "" } = await req.json();

        if (!message || typeof message !== "string" || !message.trim()) {
            return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "GEMINI_API_KEY is not set in .env.local" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const client = new GoogleGenAI({ apiKey });

        // If the user is on a product page, pre-fetch that exact product's data
        let pageContextBlock = "";
        const productSlugMatch = typeof pageContext === "string" && pageContext.match(/^\/product\/(.+)$/);
        if (productSlugMatch) {
            const slug = productSlugMatch[1];
            console.log("[chat] page context: product page →", slug);
            const product = await getProductBySlug(slug);
            if (product) {
                const [productSpecs] = await Promise.all([
                    getItemSpecs(product.id).catch(() => []),
                ]);
                const discount = product.discount > 0
                    ? ` | Discount: ${product.discount}% off → ৳${Math.round(product.discountedPrice)}`
                    : "";
                const specsText = Array.isArray(productSpecs) && productSpecs.length > 0
                    ? `\nSpecifications:\n${productSpecs.map(s => `  - ${s.Header || s.header}: ${s.Details || s.details}`).join('\n')}`
                    : product.Specification ? `\nSpecification: ${product.Specification}` : "";
                const variantLines = (product.variants || []).slice(0, 20).map(v =>
                    `  - Color: ${v.color || 'N/A'} | Size: ${v.size || 'N/A'} | SKU: ${v.sku || 'N/A'} | Price: ৳${v.sellingPrice || 'N/A'}`
                ).join('\n');

                pageContextBlock = `

CURRENTLY VIEWED PRODUCT (the exact product this customer is looking at right now):
Name: ${product.title}
Style No: ${product.styleNo}
Category: ${product.category}
Brand: ${product.brand}
Type: ${product.productType}
Status: ${product.status}
Price: ৳${product.price}${discount}
Stock: ${product.StockQty > 0 ? `${product.StockQty} units available` : 'Out of stock'}
Colors available: ${product.colors?.join(', ') || 'N/A'}
Sizes available: ${product.sizes?.join(', ') || 'N/A'}
Description: ${product.Description || 'N/A'}
Additional Description: ${product.AdditionalDescription || 'N/A'}${specsText}
${variantLines ? `Variants:\n${variantLines}` : ''}`;
            } else {
                console.log("[chat] product not found for slug:", slug);
            }
        }

        const systemWithContext = pageContextBlock
            ? `${STATIC_KNOWLEDGE}\n${pageContextBlock}`
            : STATIC_KNOWLEDGE;

        const recentHistory = history.slice(-10);
        const contents = [
            ...recentHistory.map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }],
            })),
            { role: "user", parts: [{ text: message }] },
        ];

        // Step 1: Non-streaming call to detect tool use
        const firstResponse = await client.models.generateContent({
            model: MODEL,
            contents,
            config: {
                systemInstruction: systemWithContext,
                tools: TOOL_DEFINITIONS,
            },
        });

        // Detect function call — try SDK getter first, fall back to manual candidate scan
        let functionCall = null;
        try {
            const fcs = firstResponse.functionCalls;
            if (fcs && fcs.length > 0) functionCall = fcs[0];
        } catch {
            // SDK getter unavailable — scan parts manually
        }
        if (!functionCall) {
            const parts = firstResponse?.candidates?.[0]?.content?.parts ?? [];
            const part = parts.find(p => p.functionCall);
            if (part) functionCall = part.functionCall;
        }

        console.log("[chat] user:", message);
        console.log("[chat] tool call:", functionCall ? `${functionCall.name}(${JSON.stringify(functionCall.args)})` : "none");

        let contentsForStream = contents;
        let needsHumanReview = false;

        // Safety net: Gemini sometimes writes the canned escalation reply as plain text
        // without actually calling escalate_to_human, which would leave the chat unflagged
        // and invisible in the admin inbox even though the customer saw the "we'll follow up" message.
        if (!functionCall) {
            const firstResponseText = (firstResponse?.candidates?.[0]?.content?.parts ?? [])
                .map(p => p.text || "").join("");
            if (/passed this along to our team/i.test(firstResponseText)) {
                needsHumanReview = true;
            }
        }

        if (functionCall) {
            const { name, args } = functionCall;
            if (name === "escalate_to_human") needsHumanReview = true;
            const toolResult = await executeTool(name, args);

            console.log("[chat] tool result preview:", String(toolResult).slice(0, 200));

            // Use the actual model content parts (not reconstructed) to avoid format mismatch
            const modelParts = firstResponse?.candidates?.[0]?.content?.parts ?? [{ functionCall: { name, args } }];

            contentsForStream = [
                ...contents,
                { role: "model", parts: modelParts },
                {
                    role: "user",
                    parts: [{
                        functionResponse: {
                            name,
                            response: { output: toolResult }
                        }
                    }]
                },
            ];
        }

        // Step 3: Stream final answer
        const geminiStream = await client.models.generateContentStream({
            model: MODEL,
            contents: contentsForStream,
            config: { systemInstruction: systemWithContext },
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of geminiStream) {
                        const text = chunk.text;
                        if (text) controller.enqueue(encoder.encode(text));
                    }
                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
                "X-Accel-Buffering": "no",
                ...(needsHumanReview && { "X-Needs-Human-Review": "true" }),
            },
        });

    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("Chat API error:", msg);
        return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

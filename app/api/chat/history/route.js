import config from "@/config";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("sessionId");
        if (!sessionId) return Response.json({ messages: [] });

        const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
            method: "POST",
            headers: { "Content-Type": "application/json", TenantId: config.tenantId },
            body: JSON.stringify({
                operation: "",
                procedureName: "SP_EcomChatConversation",
                parameters: { QueryChecker: 2, SessionId: sessionId },
            }),
            cache: "no-store",
        });

        if (!res.ok) return Response.json({ messages: [] });
        const data = await res.json();
        return Response.json({ messages: Array.isArray(data) ? data : [] });
    } catch {
        return Response.json({ messages: [] });
    }
}

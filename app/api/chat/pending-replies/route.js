import config from "@/config";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("sessionId");
        if (!sessionId) return Response.json({ adminReply: null });

        const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "TenantId": config.tenantId },
            body: JSON.stringify({
                operation: "",
                procedureName: "SP_EcomChatConversation",
                parameters: { QueryChecker: 9, SessionId: sessionId },
            }),
            cache: "no-store",
        });

        const data = await res.json();
        const row = Array.isArray(data) ? data[0] : data;
        return Response.json({ adminReply: row?.AdminReply || null });
    } catch {
        return Response.json({ adminReply: null });
    }
}

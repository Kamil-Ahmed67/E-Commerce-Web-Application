import config from "@/config";

export async function POST(req) {
    try {
        const { sessionId, name, phone, email } = await req.json();
        if (!sessionId) {
            return Response.json({ ok: false }, { status: 400 });
        }
        await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "TenantId": config.tenantId },
            body: JSON.stringify({
                operation: "",
                procedureName: "SP_EcomChatConversation",
                parameters: {
                    QueryChecker: 5,
                    SessionId: sessionId,
                    CustomerName: name || null,
                    Phone: phone || null,
                    Email: email || null,
                },
            }),
            cache: "no-store",
        });
        return Response.json({ ok: true });
    } catch {
        return Response.json({ ok: false }, { status: 500 });
    }
}

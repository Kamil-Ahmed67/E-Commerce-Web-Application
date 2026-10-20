import config from "@/config";

export async function POST(req) {
    try {
        const { id, adminReply } = await req.json();
        if (!id || !adminReply) {
            return Response.json({ ok: false }, { status: 400 });
        }

        await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "TenantId": config.tenantId },
            body: JSON.stringify({
                operation: "",
                procedureName: "SP_EcomChatConversation",
                parameters: {
                    QueryChecker: 8,
                    Id: id,
                    AdminReply: adminReply,
                },
            }),
            cache: "no-store",
        });

        return Response.json({ ok: true });
    } catch {
        return Response.json({ ok: false }, { status: 500 });
    }
}

import { createFileRoute } from "@tanstack/react-router";
import { createSessionToken } from "@/lib/auth";

export const Route = createFileRoute("/api/v1/admin/auth")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { password } = await request.json();
          const expectedPassword = process.env.ADMIN_PASSWORD || "admin-genesis";

          if (password !== expectedPassword) {
            return new Response(JSON.stringify({ error: "Unauthorized: Invalid password" }), { status: 401, headers: { "Content-Type": "application/json" } });
          }

          const token = await createSessionToken();
          
          // Emit HttpOnly session cookie in the API response headers
          const headers = new Headers();
          headers.append("Content-Type", "application/json");
          headers.append(
            "Set-Cookie",
            `genesis_admin_session=${token}; Path=/; HttpOnly; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}; Max-Age=86400`
          );

          return new Response(JSON.stringify({ success: true, token }), { status: 200, headers });
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message || "Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
      }
    }
  }
});

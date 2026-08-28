import { createClient } from "npm:@supabase/supabase-js@2.58.0";

// Edge function: receives inbound email webhooks from Resend
// Resend sends an `email.received` event when someone emails your inbound address.
// The webhook payload contains metadata only (sender, recipient, subject, attachments list).
// To get the full body, call the Resend Receiving API: GET https://api.resend.com/emails/{email_id}/receiving
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

interface InboundAttachment {
  filename: string;
  id: string;
  content_type: string;
  size: number;
}

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    created_at: string;
    from: string;
    from_name?: string;
    to: string[];
    subject: string;
    attachments?: InboundAttachment[];
    in_reply_to?: string;
    message_id?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: ResendWebhookPayload = await req.json();

    if (payload.type !== "email.received") {
      return new Response(
        JSON.stringify({ success: true, message: `Ignored event type: ${payload.type}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data } = payload;
    if (!data || !data.from || !data.to) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch the full email body from Resend's Receiving API
    let bodyText: string | null = null;
    let bodyHtml: string | null = null;

    const resendApiKey = await getResendApiKey();
    if (resendApiKey) {
      try {
        const bodyResponse = await fetch(
          `https://api.resend.com/emails/${data.email_id}/receiving`,
          {
            headers: { Authorization: `Bearer ${resendApiKey}` },
          },
        );
        if (bodyResponse.ok) {
          const bodyData = await bodyResponse.json();
          bodyHtml = bodyData.html ?? bodyData.body_html ?? null;
          bodyText = bodyData.text ?? bodyData.body_text ?? null;
        }
      } catch (err) {
        console.error("Failed to fetch email body:", err);
      }
    }

    // Map attachments to our metadata format
    const attachments = (data.attachments ?? []).map((a) => ({
      filename: a.filename,
      url: `https://api.resend.com/emails/${data.email_id}/attachments/${a.id}`,
      content_type: a.content_type,
      size: a.size,
    }));

    // Save the inbound email to the database
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase.from("admin_emails").insert({
        direction: "inbound",
        from_email: data.from,
        from_name: data.from_name ?? null,
        to_email: data.to.join(", "),
        subject: data.subject ?? "(no subject)",
        body_text: bodyText,
        body_html: bodyHtml,
        attachments,
        status: "unread",
        thread_id: data.message_id ?? data.email_id,
        source: "resend_webhook",
        source_id: data.email_id,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Inbound email saved." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

async function getResendApiKey(): Promise<string> {
  if (!supabaseUrl || !supabaseServiceKey) return "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "RESEND_API_KEY")
    .maybeSingle();
  if (error || !data) return "";
  return data.value;
}

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
    );
  }
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseClient;
}

/* ─── typed helpers ─────────────────────────────────────────── */

export async function insertFreeSampleLead(data: {
  first_name: string;
  email: string;
  source: 'homepage_cta' | 'free_sample_page';
  country?: string;
  city_region?: string;
  referral_source?: string;
}) {
  const apiUrl = `${SUPABASE_URL}/functions/v1/send-free-sample`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error ?? `Request failed (${response.status})`);
  }
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error);
  }
}

export async function insertNewsletterSubscriber(data: {
  name: string;
  email: string;
  country?: string;
  city_region?: string;
}) {
  const { error } = await getSupabaseClient().from('newsletter_subscribers').insert({
    ...data,
    status: 'subscribed',
    subscribed_at: new Date().toISOString(),
  });
  if (error) {
    if (error.code === '23505') return;
    throw error;
  }
}

export async function insertPrayerPartner(data: {
  name: string;
  email: string;
  country?: string;
  city_region?: string;
}) {
  const { error } = await getSupabaseClient().from('prayer_partners').insert({
    ...data,
    status: 'active',
  });
  if (error) {
    if (error.code === '23505') return;
    throw error;
  }
}

export async function insertPrayerRequest(data: {
  name: string;
  email?: string;
  request: string;
  country?: string;
  city_region?: string;
}) {
  const { error } = await getSupabaseClient().from('prayer_requests').insert({
    name:    data.name,
    email:   data.email || null,
    request: data.request,
    country: data.country || null,
    city_region: data.city_region || null,
  });
  if (error) throw error;
}

export async function insertContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  country?: string;
  city_region?: string;
}) {
  const { error } = await getSupabaseClient().from('contact_messages').insert(data);
  if (error) throw error;
}

export async function insertDonation(data: {
  name: string;
  email: string;
  country?: string;
  city_region?: string;
  amount?: number;
  prayer_request?: string;
  message?: string;
}) {
  const { error } = await getSupabaseClient().from('donations').insert(data);
  if (error) throw error;
}

/* ─── blog comment helpers ──────────────────────────────────── */

export async function insertBlogComment(data: {
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  parent_id?: string;
}) {
  const { error } = await getSupabaseClient().from('blog_comments').insert({
    post_id:      data.post_id,
    author_name:  data.author_name,
    author_email: data.author_email,
    content:      data.content,
    parent_id:    data.parent_id || null,
    status:       'pending',
  });
  if (error) throw error;
}

export async function fetchApprovedComments(postId: string) {
  const { data, error } = await getSupabaseClient()
    .from('blog_comments')
    .select('id, author_name, content, created_at, parent_id')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/* ─── admin email helpers ────────────────────────────────────── */

export type AdminEmail = {
  id: string;
  direction: 'inbound' | 'outbound';
  from_email: string;
  from_name: string | null;
  to_email: string;
  subject: string;
  body_text: string | null;
  body_html: string | null;
  attachments: AttachmentMeta[];
  status: string;
  in_reply_to: string | null;
  thread_id: string;
  source: string | null;
  source_id: string | null;
  created_at: string;
};

export type AttachmentMeta = {
  filename: string;
  url: string;
  content_type: string;
  size: number;
};

export async function fetchAdminEmails() {
  const { data, error } = await getSupabaseClient()
    .from('admin_emails')
    .select('*')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminEmail[];
}

export async function updateEmailStatus(id: string, status: string) {
  const { error } = await getSupabaseClient()
    .from('admin_emails')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteEmail(id: string) {
  const { error } = await getSupabaseClient()
    .from('admin_emails')
    .update({ status: 'deleted' })
    .eq('id', id);
  if (error) throw error;
}

export async function uploadAttachment(file: File, userId: string): Promise<AttachmentMeta> {
  const supabase = getSupabaseClient();
  const ext = file.name.split('.').pop() ?? 'bin';
  const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from('admin-email-attachments')
    .upload(filePath, file);
  if (error) throw error;
  const { data: signedData, error: signedError } = await supabase.storage
    .from('admin-email-attachments')
    .createSignedUrl(filePath, 3600);
  if (signedError || !signedData?.signedUrl) throw signedError ?? new Error('Could not prepare attachment.');
  return {
    filename: file.name,
    url: signedData.signedUrl,
    content_type: file.type || 'application/octet-stream',
    size: file.size,
  };
}

export async function sendAdminEmailWithAttachments(payload: {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments: AttachmentMeta[];
}) {
  const apiUrl = `${SUPABASE_URL}/functions/v1/send-admin-email`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok || result.error) {
    throw new Error(result.error ?? `Request failed (${response.status})`);
  }
  return result;
}

/* ─── admin comment moderation helpers ──────────────────────── */

export type AdminComment = {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  admin_note: string | null;
  parent_id: string | null;
  created_at: string;
  moderated_at: string | null;
  post_title?: string;
};

export async function fetchAllComments() {
  const { data, error } = await getSupabaseClient()
    .from('blog_comments')
    .select('*, blog_posts(title)')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as (AdminComment & { blog_posts: { title: string } | null })[];
}

export async function moderateComment(id: string, status: 'approved' | 'rejected', note?: string) {
  const { error } = await getSupabaseClient()
    .from('blog_comments')
    .update({ status, admin_note: note ?? null, moderated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteComment(id: string) {
  const { error } = await getSupabaseClient()
    .from('blog_comments')
    .update({ status: 'deleted' })
    .eq('id', id);
  if (error) throw error;
}

/* ─── notification count helpers ────────────────────────────── */

export async function fetchUnreadEmailCount() {
  const { count, error } = await getSupabaseClient()
    .from('admin_emails')
    .select('id', { count: 'exact', head: true })
    .eq('direction', 'inbound')
    .eq('status', 'unread');
  if (error) return 0;
  return count ?? 0;
}

export async function fetchPendingCommentsCount() {
  const { count, error } = await getSupabaseClient()
    .from('blog_comments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');
  if (error) return 0;
  return count ?? 0;
}

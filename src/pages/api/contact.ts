import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { env } from 'cloudflare:workers'; // NEW: Astro v6 native Cloudflare import

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Astro v6 reads from .dev.vars (local) & Cloudflare Dashboard (prod) via the env object
  const apiKey = (env as any).RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
  const resend = new Resend(apiKey);
  
  let email, org, message;

  try {
    const data = await request.formData();
    email = data.get('email')?.toString();
    org = data.get('org')?.toString();
    message = data.get('message')?.toString();
    console.log('Form data:', { email, org, message });
  } catch (e) {
    console.error('Form parse error:', e);
    return new Response(JSON.stringify({ error: 'Invalid form data' }), { status: 400 });
  }

  if (!email || !org || !message) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  const { data, error } = await resend.emails.send({
    from: 'NebuLink Contact <contact@nebulink.co.uk>',
    to: 'alistair@nebulink.co.uk',
    subject: `NebuLink Inquiry - ${org}`,
    text: `From: ${email}\nOrg: ${org}\n\n${message}`,
  });

  console.log('Resend response:', { data, error });

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to send' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
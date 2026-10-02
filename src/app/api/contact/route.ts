import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { name, email, project, help } = await req.json();

    if (!name || !email || !project || !help) {
      return NextResponse.json({ error: "Campos incompletos" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "API key no configurada" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: "ricardo.gomezt1108@hotmail.com",
      subject: `💬 Nuevo mensaje de ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f0f5fb;border-radius:12px;">
          <h2 style="margin:0 0 24px;color:#080f1e;font-size:1.3rem;">Nuevo mensaje desde tu portafolio</h2>
          <div style="background:#fff;border-radius:8px;padding:24px;margin-bottom:16px;">
            <p style="margin:0 0 6px;font-size:.75rem;color:#5b7899;text-transform:uppercase;letter-spacing:.08em;">¿Cómo te llamas?</p>
            <p style="margin:0;font-size:1rem;color:#080f1e;font-weight:600;">${name}</p>
          </div>
          <div style="background:#fff;border-radius:8px;padding:24px;margin-bottom:16px;">
            <p style="margin:0 0 6px;font-size:.75rem;color:#5b7899;text-transform:uppercase;letter-spacing:.08em;">Correo de contacto</p>
            <a href="mailto:${email}" style="margin:0;font-size:1rem;color:#0077B5;font-weight:600;">${email}</a>
          </div>
          <div style="background:#fff;border-radius:8px;padding:24px;margin-bottom:16px;">
            <p style="margin:0 0 6px;font-size:.75rem;color:#5b7899;text-transform:uppercase;letter-spacing:.08em;">Su proyecto o idea</p>
            <p style="margin:0;font-size:1rem;color:#080f1e;">${project}</p>
          </div>
          <div style="background:#fff;border-radius:8px;padding:24px;">
            <p style="margin:0 0 6px;font-size:.75rem;color:#5b7899;text-transform:uppercase;letter-spacing:.08em;">Cómo pueden ayudarse</p>
            <p style="margin:0;font-size:1rem;color:#080f1e;">${help}</p>
          </div>
          <p style="margin:24px 0 0;font-size:.8rem;color:#5b7899;">Enviado desde ricardogomez.vercel.app</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

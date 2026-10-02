"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", project: "", help: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? "Error desconocido");
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error de red");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="cf-success">
        <span className="cf-success-icon">✓</span>
        <h3 className="cf-success-title">¡Mensaje recibido!</h3>
        <p className="cf-success-sub">
          Te respondo pronto. Mientras tanto, conéctate en LinkedIn.
        </p>
      </div>
    );
  }

  return (
    <form className="cf" onSubmit={handleSubmit} noValidate>
      <div className="cf-field">
        <label className="cf-label" htmlFor="cf-name">
          ¿Cómo te llamas?
        </label>
        <input
          id="cf-name"
          className="cf-input"
          type="text"
          placeholder="Tu nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          disabled={status === "sending"}
        />
      </div>

      <div className="cf-field">
        <label className="cf-label" htmlFor="cf-project">
          Cuéntame sobre tu proyecto o idea 💡
        </label>
        <textarea
          id="cf-project"
          className="cf-input cf-textarea"
          placeholder="¿Qué estás construyendo o qué problema quieres resolver?"
          value={form.project}
          onChange={(e) => setForm({ ...form, project: e.target.value })}
          required
          disabled={status === "sending"}
          rows={3}
        />
      </div>

      <div className="cf-field">
        <label className="cf-label" htmlFor="cf-help">
          ¿En qué podría ayudarte?
        </label>
        <input
          id="cf-help"
          className="cf-input"
          type="text"
          placeholder="ej. arquitectura de IA, pipelines de datos, consultoría..."
          value={form.help}
          onChange={(e) => setForm({ ...form, help: e.target.value })}
          required
          disabled={status === "sending"}
        />
      </div>

      <div className="cf-field">
        <label className="cf-label" htmlFor="cf-email">
          Tu correo electrónico
        </label>
        <input
          id="cf-email"
          className="cf-input"
          type="email"
          placeholder="para poder responderte"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          disabled={status === "sending"}
        />
      </div>

      {status === "error" && (
        <p className="cf-error">
          {errorMsg ? `Error: ${errorMsg}` : "Algo falló al enviar."}{" "}
          Escríbeme a ricardo.gomezt1108@hotmail.com
        </p>
      )}

      <button
        className="btn btn-primary cf-submit"
        type="submit"
        disabled={status === "sending" || !form.name || !form.email || !form.project || !form.help}
      >
        {status === "sending" ? "Enviando…" : "Enviar mensaje →"}
      </button>
    </form>
  );
}

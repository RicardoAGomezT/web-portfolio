import Image from "next/image";
import { useTranslations } from "next-intl";
import { ContactForm } from "@/components/ContactForm";
import { MemoryGame } from "@/components/MemoryGame";
import { ParticleGame } from "@/components/ParticleGame";
import { NeuralGame } from "@/components/NeuralGame";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="status-pill">
            <span className="sdot" />
            Open to work
          </div>
          <h1 className="hero-name" style={{whiteSpace:'nowrap', fontSize:'clamp(2.4rem, 4.2vw, 4.8rem)'}}>
            Ricardo Gómez
          </h1>
          <p className="hero-roles">
            <strong>SRE DevOps Senior</strong> · AIOps<br />
            AI Engineer · Data Engineer
          </p>
          <p className="hero-bio">
            5+ años en <strong>AWS</strong>. Diseño la capa de inteligencia
            que transforma infraestructura en sistemas que{" "}
            <strong>perciben, razonan y actúan</strong> — agentes autónomos,
            AIOps y pipelines que se gestionan solos en producción.
          </p>
          <div className="hero-ctas">
            <a className="btn btn-primary" href="#proyectos">
              Ver proyectos →
            </a>
            <a className="btn" href="https://www.linkedin.com/in/ricardo-gomez-torres/" target="_blank" rel="noopener noreferrer" style={{ background: "#0077B5", color: "#fff", border: "1px solid #0077B5" }}>
              LinkedIn
            </a>
            <a className="btn btn-outline" href="#contacto">
              {t("cta_contact")}
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="photo-wrap">
            <div className="photo-frame">
              <Image
                src="/linkedin_foto_perfil.jpg"
                alt="Ricardo Gómez — AI Engineer"
                fill
                sizes="(max-width: 860px) 88px, 320px"
                className="photo-img"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ticker ── */}
      <div className="ticker-wrap" aria-hidden="true">
        <div className="ticker-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="ticker-set">
              <span className="t-item"><span className="t-sep">◆</span><strong>5+ años</strong>&nbsp;en AWS<span className="t-sep">◆</span></span>
              <span className="t-item"><strong>6</strong>&nbsp;certificaciones activas<span className="t-sep">◆</span></span>
              <span className="t-item"><strong>100%</strong>&nbsp;remoto<span className="t-sep">◆</span></span>
              <span className="t-item">Bucaramanga,&nbsp;<strong>Colombia</strong><span className="t-sep">◆</span></span>
              <span className="t-item">Bedrock&nbsp;·&nbsp;MCP&nbsp;·&nbsp;<strong>Strands</strong><span className="t-sep">◆</span></span>
              <span className="t-item"><strong>AIOps</strong>&nbsp;specialist<span className="t-sep">◆</span></span>
              <span className="t-item">Big Data → DataOps →&nbsp;<strong>AIOps</strong><span className="t-sep">◆</span></span>
              <span className="t-item"><strong>AWS</strong>&nbsp;·&nbsp;Azure<span className="t-sep">◆</span></span>
              <span className="t-item"><strong>Apache Spark</strong><span className="t-sep">◆</span></span>
              <span className="t-item"><strong>Python</strong><span className="t-sep">◆</span></span>
              <span className="t-item"><strong>RAG</strong>&nbsp;Chatbots<span className="t-sep">◆</span></span>
              <span className="t-item">Sistemas&nbsp;<strong>Agénticos</strong><span className="t-sep">◆</span></span>
              <span className="t-item"><strong>Harness</strong><span className="t-sep">◆</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stack — Bento Grid ── */}
      <section id="stack" className="sec alt">
        <p className="s-ey">Capacidades técnicas</p>
        <h2 className="s-title">Stack técnico</h2>
        <div className="bento">
          <div className="bento-tile bento-ai reveal">
            <p className="bento-label">IA &amp; Agentes</p>
            <div className="tags">
              {["AWS Bedrock", "AgentCore", "MCP", "LangChain", "LangGraph",
                "Strands Agents", "A2A", "RAG Pipelines", "Pinecone", "Kiro", "Claude", "OpenCode"].map(tk => (
                <span key={tk} className="tag">{tk}</span>
              ))}
            </div>
          </div>
          <div className="bento-tile bento-cloud reveal">
            <p className="bento-label">Cloud &amp; SRE / DevOps</p>
            <div className="tags">
              {["AWS", "Azure", "Kubernetes", "Docker", "Terraform",
                "GitHub Actions", "GitLab CI", "Observabilidad", "CloudWatch"].map(tk => (
                <span key={tk} className="tag">{tk}</span>
              ))}
            </div>
          </div>
          <div className="bento-tile bento-data reveal">
            <p className="bento-label">Data Engineering</p>
            <div className="tags">
              {["Python", "SQL", "ETL / ELT", "DataOps",
                "Apache Spark", "Airflow", "dbt"].map(tk => (
                <span key={tk} className="tag">{tk}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Projects ── */}
      <section id="proyectos" className="sec">
        <p className="s-ey">Portafolio</p>
        <h2 className="s-title">Proyectos destacados</h2>
        <div className="proj-grid">
          {[
            {
              num: "01",
              name: "🏦 Agentes IA en AVAL Digital Labs",
              desc: "Dos sistemas IA en producción para el Grupo AVAL: Armandito, chatbot RAG con conocimiento profundo de DevOps interno y lineamientos corporativos; y Orion, sistema agéntico que razona sobre el estado de los pipelines en Harness, detecta fallos y ejecuta remediaciones autónomas siguiendo las políticas del banco.",
              chips: ["RAG", "Harness", "Agentes", "AVAL"],
            },
            {
              num: "02",
              name: "🌐 Esta web + Asistente IA",
              desc: "Portafolio construido con Next.js 15 y Vercel. Incluye un asistente 'Pregúntale a Richie' con Claude Haiku en Amazon Bedrock, guardrails, OIDC y rate limiting sin access keys.",
              chips: ["Next.js", "Vercel", "Bedrock", "Terraform"],
            },
            {
              num: "03",
              name: "🤝 Harry & Eevee — IAs Personales",
              desc: "Dos asistentes de IA personales construidos para uso propio: Harry, enfocado en productividad y razonamiento; y Eevee, orientada a creatividad y compañía. Ambos con memoria persistente, personalidad definida y acceso a herramientas — una exploración práctica de cómo la IA puede adaptarse a una persona específica.",
              chips: ["Agentes", "Memoria", "Claude", "Personalización"],
            },
            {
              num: "04",
              name: "🍫 Plataforma de Trazabilidad EUDR Cacao",
              desc: "Sistema de trazabilidad basado en IA para exportadores de cacao en Santander que deben cumplir la regulación de deforestación de la UE. Geolocalización, IA documental y dashboards de cumplimiento.",
              chips: ["AWS", "Bedrock", "Geoespacial", "Compliance"],
            },
          ].map((p) => (
            <div key={p.num} className="proj-card reveal">
              <span className="proj-num">{p.num}</span>
              <h3 className="proj-name">{p.name}</h3>
              <p className="proj-desc">{p.desc}</p>
              <div className="chips">
                {p.chips.map((c) => <span key={c} className="chip">{c}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Certifications ── */}
      <section id="certificaciones" className="sec alt">
        <p className="s-ey">Acreditaciones</p>
        <h2 className="s-title">Certificaciones</h2>
        <div className="certs-grid">
          {[
            { type: "aws", name: "Solutions Architect Associate", code: "SAA-C03" },
            { type: "aws", name: "Developer Associate", code: "DVA-C02" },
            { type: "aws", name: "AI Practitioner", code: "AIF-C01" },
            { type: "az", name: "Azure AI Fundamentals", code: "AI-900" },
            { type: "az", name: "Azure Data Fundamentals", code: "DP-900" },
            { type: "az", name: "Azure Fundamentals", code: "AZ-900" },
          ].map((c) => (
            <div key={c.code} className="cert reveal">
              <div className={`cert-ic ${c.type}`}>
                {c.type === "aws" ? "AWS" : "AZ"}
              </div>
              <div>
                <p className="cert-name">{c.name}</p>
                <p className="cert-prov">
                  {c.type === "aws" ? "Amazon Web Services" : "Microsoft Azure"} · {c.code}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contacto" className="sec contact-sec">
        <p className="s-ey center">Contacto</p>
        <h2 className="contact-hl">
          ¿Tienes un<br />proyecto en mente?
        </h2>
        <p className="contact-sub">
          Disponible para roles remotos en AI Engineering, AI DevOps y Data
          Engineering. También consultoría y proyectos freelance.
        </p>
        <ContactForm />
        <div className="social-row">
          <a
            className="soc"
            href="https://www.linkedin.com/in/ricardo-gomez-torres/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            LinkedIn
          </a>
          <a
            className="soc"
            href="https://github.com/RicardoAGomezT"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            GitHub
          </a>
          <span className="soc">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            ricardo.gomezt1108@hotmail.com
          </span>
          <a className="soc" href="tel:+573163118860">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            +57 316 311 8860
          </a>
          <span className="soc">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Bucaramanga, Colombia
          </span>
        </div>
        <p style={{ textAlign: "center", fontSize: "0.68rem", color: "var(--muted)", fontStyle: "italic", marginTop: "18px", opacity: 0.7 }}>
          Madurar es entender que Iron Man no era súper inteligente, solo tenía tokens ilimitados 😅
        </p>
      </section>

      <MemoryGame />
      <ParticleGame />
      <NeuralGame />

      <footer className="site-footer">
        <span>© 2026 Ricardo Andrés Gómez Torres</span>
        <span>Bucaramanga, Colombia · Disponible para trabajo remoto</span>
      </footer>
    </>
  );
}

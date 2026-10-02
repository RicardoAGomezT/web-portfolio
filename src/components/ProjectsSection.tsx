"use client";

import { useState } from "react";

type Project = {
  num: string;
  name: string;
  shortDesc: string;
  chips: string[];
  modal: {
    problem: string;
    bullets: string[];
    stack: string[];
    note?: string;
  };
};

const PROJECTS: Project[] = [
  {
    num: "01",
    name: "💻💜 Agentes IA en AVAL Digital Labs",
    shortDesc: "Dos sistemas IA en producción para el Grupo AVAL, uno de los conglomerados financieros más grandes de Colombia.",
    chips: ["RAG", "Harness", "Agentes", "AVAL"],
    modal: {
      problem:
        "El equipo DevOps de AVAL Digital Labs necesitaba dos cosas: acceso instantáneo al conocimiento técnico interno, y un sistema capaz de razonar sobre el estado de la infraestructura y actuar de forma autónoma.",
      bullets: [
        "🧠 Armandito — chatbot RAG con conocimiento DevOps interno: pipeline de ingesta sobre documentación técnica propia, chunking semántico, embeddings en Pinecone y almacenamiento en S3. Responde en segundos lo que antes requería escalar al DevOps más senior del equipo.",
        "🤖 Orion — sistema agéntico multi-agente: arquitectura basada en protocolo A2A (Agent-to-Agent) que orquesta agentes especializados. Tiene MCPs conectados a herramientas DevOps reales: detecta anomalías, razona sobre causas raíz y ejecuta acciones correctivas de forma autónoma.",
        "⚡ Ambos corren en AWS Bedrock con guardrails configurados para el contexto financiero y restricciones de PII.",
        "🔒 Detalles adicionales bajo NDA — sistema en producción activa.",
      ],
      stack: ["AWS Bedrock", "Pinecone", "S3", "A2A", "MCP", "LangGraph", "Python"],
      note: "Sistema confidencial en producción. Los detalles arquitectónicos se comparten bajo NDA.",
    },
  },
  {
    num: "02",
    name: "🤖✨ Esta web + Asistente IA",
    shortDesc: "Portafolio construido con Next.js 15 y un asistente 'Pregúntale a Richie' integrado con Amazon Bedrock.",
    chips: ["Next.js", "Vercel", "Bedrock", "Terraform"],
    modal: {
      problem:
        "Construir un portafolio que no solo mostrara proyectos, sino que demostrara en vivo las capacidades de IA — sin exponer access keys ni incurrir en costos fijos.",
      bullets: [
        "🏗️ App Router de Next.js 15 con i18n (español/inglés) usando next-intl.",
        "🔐 Autenticación con AWS via OIDC desde Vercel — cero access keys, cero secretos en el repositorio. El token de Vercel hace AssumeRole en AWS en cada request.",
        "🤖 Asistente 'Pregúntale a Richie' con Claude Haiku en Amazon Bedrock: context stuffing con el perfil profesional, guardrails para mantener el scope, streaming de respuestas token a token.",
        "🛡️ Rate limiting por IP con Upstash Redis (Vercel Marketplace) para evitar abuso sin infraestructura extra.",
        "☁️ Infraestructura AWS (IAM Role OIDC, Bedrock Guardrail, Budget) declarada en Terraform.",
        "🚀 Deploy continuo: push a main → preview automática en Vercel → producción.",
      ],
      stack: ["Next.js 15", "TypeScript", "Tailwind CSS 4", "Vercel", "AWS Bedrock", "Claude Haiku", "Terraform", "Upstash Redis"],
    },
  },
  {
    num: "03",
    name: "🐈🦊 Harry & Eevee — IAs Personales",
    shortDesc: "Dos asistentes de IA personales con personalidad definida, memoria persistente y acceso a herramientas.",
    chips: ["Agentes", "Memoria", "Claude", "Personalización"],
    modal: {
      problem:
        "Explorar hasta dónde puede llegar la personalización de un agente IA cuando se diseña desde cero para una persona específica, no para el público general.",
      bullets: [
        "🐈 Harry — asistente de productividad y razonamiento: enfocado en planificación, análisis técnico y toma de decisiones. Tiene acceso a herramientas de búsqueda, calendario y gestión de tareas.",
        "🦊 Eevee — asistente de creatividad y compañía: orientada a escritura creativa, exploración de ideas y conversación. Personalidad más empática y expresiva.",
        "🧠 Ambos implementan memoria persistente en capas: resúmenes de sesión, hechos importantes del usuario y preferencias de interacción que evolucionan con el tiempo.",
        "🔧 Acceso a herramientas vía MCP: búsqueda web, lectura de archivos, ejecución de código y APIs externas según el contexto.",
        "📐 Arquitectura basada en Claude con system prompts elaborados, memoria vectorial y lógica de recuperación contextual.",
      ],
      stack: ["Claude", "MCP", "Memoria vectorial", "Python", "AWS Bedrock"],
      note: "Proyecto personal en construcción activa — no disponible públicamente.",
    },
  },
  {
    num: "04",
    name: "🌴🍫 Plataforma de Trazabilidad EUDR Cacao",
    shortDesc: "Sistema de trazabilidad basado en IA para exportadores de cacao en Santander que deben cumplir la regulación de deforestación de la UE.",
    chips: ["AWS", "Bedrock", "Geoespacial", "Compliance"],
    modal: {
      problem:
        "La regulación EUDR de la Unión Europea exige a los exportadores de cacao demostrar que su producto no proviene de zonas deforestadas. Los cacaocultores de Santander no tenían herramientas accesibles para cumplir este requisito y estaban en riesgo de perder acceso al mercado europeo.",
      bullets: [
        "🗺️ Módulo geoespacial: geolocalización de fincas cacaoteras con validación automática contra polígonos de deforestación de la UE (JRC Global Forest Cover).",
        "📄 IA documental con AWS Bedrock: extracción y clasificación automática de certificados, facturas de venta y registros de proveedor para armar el expediente de trazabilidad.",
        "📊 Dashboard de compliance: visualización del estado de cada lote — desde la finca hasta el punto de exportación — con semáforo de riesgo EUDR.",
        "🔗 Cadena de custodia digital: registro inmutable de cada transacción en la cadena de suministro (productor → acopiador → exportador).",
        "☁️ Infraestructura serverless en AWS: Lambda, S3, DynamoDB y API Gateway — escalable y sin costos fijos para asociaciones pequeñas.",
      ],
      stack: ["AWS Lambda", "S3", "DynamoDB", "Bedrock", "Python", "GeoJSON", "React"],
    },
  },
];

export function ProjectsSection() {
  const [open, setOpen] = useState<string | null>(null);
  const active = PROJECTS.find((p) => p.num === open);

  return (
    <>
      <div className="proj-grid">
        {PROJECTS.map((p) => (
          <div key={p.num} className="proj-card reveal">
            <span className="proj-num">{p.num}</span>
            <h3 className="proj-name">{p.name}</h3>
            <p className="proj-desc">{p.shortDesc}</p>
            <div className="chips">
              {p.chips.map((c) => (
                <span key={c} className="chip">{c}</span>
              ))}
            </div>
            <button
              className="proj-more-btn"
              onClick={() => setOpen(p.num)}
            >
              Ver detalle →
            </button>
          </div>
        ))}
      </div>

      {active && (
        <div
          className="mg-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}
        >
          <div className="proj-modal">
            <div className="mg-header">
              <div>
                <span className="proj-num" style={{ fontSize: "0.85rem" }}>{active.num}</span>
                <h2 className="mg-title" style={{ fontSize: "1.15rem", marginTop: 2 }}>{active.name}</h2>
              </div>
              <button className="mg-close" onClick={() => setOpen(null)}>✕</button>
            </div>

            <p className="proj-modal-problem">{active.modal.problem}</p>

            <ul className="proj-modal-bullets">
              {active.modal.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            <div className="proj-modal-stack">
              <p className="proj-modal-stack-label">Stack</p>
              <div className="chips">
                {active.modal.stack.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            </div>

            {active.modal.note && (
              <p className="proj-modal-note">⚠️ {active.modal.note}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

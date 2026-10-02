# web-portfolio — contexto para Claude Code

## Qué es este proyecto
Web personal de Ricardo Gómez ("Richie"). Objetivo doble: portafolio para búsqueda de empleo (AI Engineer / AI DevOps / Data Engineer) y canal de freelance/consultoría. Arquitectura completa en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Estilos**: Tailwind CSS 4
- **i18n**: next-intl — rutas `/es` (defecto) y `/en`
- **Contenido**: archivos MDX en `content/`
- **Hosting**: Vercel Hobby (gratis)
- **Fase 2**: asistente IA con Amazon Bedrock vía OIDC (sin access keys)

## Estructura clave
```
src/app/[locale]/    páginas por idioma
messages/{es,en}.json  textos de la interfaz
content/             experiencia, proyectos, certificaciones, posts
src/i18n/            configuración de next-intl
```

## Comandos
```bash
npm run dev      # servidor local en http://localhost:3000
npm run build    # build de producción
npm run lint     # ESLint
npx tsc --noEmit # verificar tipos
```

## Flujo de trabajo
1. Crear rama desde `main`: `git checkout -b feat/nombre`
2. Hacer cambios y confirmar que `npm run build` pasa
3. Abrir PR → Vercel genera una preview URL automáticamente
4. Merge a `main` → deploy automático a producción

## Contenido del sitio (lo que se muestra en el frontend)
El perfil completo de Richie vive en `~/Downloads/richie_perfil_completo.md`.
Lo que se publica está descrito en `docs/ARCHITECTURE.md §9 (Privacidad)`.
**Nunca publicar**: finanzas, salud, dirección exacta, datos de familia, salario esperado.

## Convención de nombres de ramas
- `feat/` — nueva sección o funcionalidad
- `fix/` — corrección de bug
- `content/` — agregar o editar contenido (MDX, mensajes)
- `infra/` — cambios en Terraform o CI
- `chore/` — dependencias, configuración

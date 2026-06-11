# 🚀 QUICK START - Software Architecture Expert Team

## Inicio Rápido (5 minutos)

### Paso 1: Invoca el Equipo

Copia y pega en el chat:

```
@Software Architecture Expert Team

Necesitamos diseñar una plataforma SaaS Multi-Tenant para [TU DOMINIO].

INFORMACIÓN:
- Tipo de usuarios: [describe aquí]
- Escala esperada: [usuarios y crecimiento]
- Requisitos principales: [lista 3-5]
- Restricciones: [presupuesto, equipo, tiempo]

¿Cómo debería ser la arquitectura?
```

### Paso 2: Espera la Respuesta

El equipo analizará tu solicitud y entregará:
- ✅ Análisis de opciones
- ✅ Recomendaciones arquitectónicas
- ✅ Identificación de riesgos
- ✅ Plan de implementación

### Paso 3: Usa los Entregables

- Diagrama de arquitectura → Mostrar a stakeholders
- ADRs → Documentar decisiones
- Plan de pruebas → Comunicar con QA
- Modelo de datos → Desarrollar backend

---

## Ejemplos Listos para Usar

### Ejemplo 1: Sistema de E-commerce

```
@Software Architecture Expert Team

Diseña una plataforma e-commerce Multi-Tenant para vendedores independientes.

CONTEXTO:
- Vendedores pueden tener sus propias tiendas
- 1000 vendedores en año 1
- 100k transacciones/mes
- Integración con Stripe, Shopify API
- Mobile app necesaria

REQUISITOS:
- Dashboard por vendedor
- Gestión de inventario
- Reportes de ventas
- Sistema de comisiones

¿Cómo es la arquitectura? ¿Qué riesgos hay?
```

### Ejemplo 2: CRM Multi-empresa

```
@Software Architecture Expert Team

Diseña un CRM para múltiples empresas con datos aislados.

RESTRICCIONES:
- 5 developers
- AWS presupuesto limitado
- Deployment en 4 meses
- Debe soportar 50k usuarios

¿Opción A (Monolith) o Opción B (Microservicios)?
¿Base de datos compartida o separada?
```

### Ejemplo 3: Plataforma LMS Educativa

```
@Software Architecture Expert Team - Arquitecto + Security Specialist

Diseña LMS (Learning Management System) para universidades.

Cada universidad tiene:
- Cursos propios
- Estudiantes inscritos
- Profesores
- Contenido privado
- Calificaciones

¿Cómo proteger datos académicos? ¿FERPA compliance?
```

---

## Comandos Especializados

### Solicitar Solo Especialista Específico

```
@Software Architecture Expert Team - Database Designer

Diseña el modelo de datos para un sistema de blogs multi-tenant
```

### Validar Decisión Específica

```
@Software Architecture Expert Team - Security Specialist

¿Es segura esta estrategia de autenticación?
[pega aquí tu código]
```

### Revisar Entregable

```
@Software Architecture Expert Team - QA Lead

¿Es suficiente este plan de pruebas?
[pega aquí el plan]
```

---

## Checklist de Uso

### Antes de Invocar

- [ ] Tengo claro el dominio del sistema
- [ ] Conozco la escala aproximada
- [ ] Tengo 3-5 requisitos clave
- [ ] Sé qué restricciones tengo (equipo, tiempo, presupuesto)

### Después de Recibir Respuesta

- [ ] Entiendo la arquitectura propuesta
- [ ] Identifiqué los riesgos principales
- [ ] Tengo un plan de implementación claro
- [ ] Puedo comunicar decisiones a stakeholders
- [ ] Estoy listo para empezar desarrollo

---

## Archivos de Referencia

| Archivo | Propósito |
|---------|-----------|
| `.github/agents/software-architecture-team.agent.md` | Definición del agente |
| `.github/AGENTS.md` | Registro de agentes disponibles |
| `.github/guides/AGENT-GUIDE.md` | Guía completa de uso |
| `.github/guides/RESPONSE-TEMPLATE.md` | Ejemplo de respuesta |

---

## Preguntas Frecuentes

**P: ¿El agente reemplaza arquitectos reales?**
A: No. Es una herramienta de apoyo para validar decisiones, generar ideas y documentar. Las decisiones finales las toma el equipo humano.

**P: ¿Qué pasa si no estoy satisfecho con la respuesta?**
A: Haz follow-up: "¿Y si consideramos...?" o "¿Cuál es el riesgo de...?"

**P: ¿Puedo combinar múltiples especialistas?**
A: Sí: `@Software Architecture Expert Team - Backend Senior & Security Specialist`

**P: ¿Qué datos debo proteger?**
A: Los agentes son solo para análisis. NO subas datos sensibles (credenciales, tokens, PII).

---

## Plantilla de Solicitud (Copiar-Pegar)

```
@Software Architecture Expert Team

## CONTEXTO
[Describe el dominio y el negocio]

## REQUISITOS FUNCIONALES
- Requisito 1
- Requisito 2
- Requisito 3

## REQUISITOS NO FUNCIONALES
- Escala: [usuarios, transacciones]
- Performance: [latencia esperada]
- Disponibilidad: [uptime requerido]

## RESTRICCIONES
- Equipo: [tamaño y skills]
- Presupuesto: [rango]
- Timeline: [meses]
- Tecnologías: [preferencias]

## PREGUNTAS ESPECÍFICAS
- ¿Cuál debería ser la arquitectura?
- ¿Qué estrategia Multi-Tenant recomiendas?
- ¿Qué riesgos hay?
- ¿Cuál es el roadmap de implementación?
```

---

## Tips Finales

✨ **Sé iterativo:** Empieza con pregunta general, luego profundiza en aspectos específicos

✨ **Combina especialistas:** Usa múltiples especialistas para validaciones cruzadas

✨ **Documenta decisiones:** Guarda los ADRs en tu proyecto

✨ **Valida después:** Los entregables son recomendaciones, valida antes de usar

✨ **Mantén actualizado:** Si el contexto cambia, pide revisión al equipo

---

## ¿Listo?

Copia la plantilla arriba y haz tu primera solicitud. **¡Vamos!** 🚀

---

**Equipo de Expertos en Arquitectura de Software**  
*Listos para diseñar sistemas extraordinarios*

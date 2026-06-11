# 📚 Guía de Uso - Software Architecture Expert Team

## 🎯 ¿Qué es este agente?

Un equipo virtual de 8 especialistas en ingeniería de software que colaboran para diseñar, analizar y documentar sistemas empresariales complejos, con énfasis en arquitecturas Multi-Tenant SaaS.

## 👥 Los Especialistas

| Especialista | Enfoque | Entregables |
|---|---|---|
| **Arquitecto de Software** | Diseño general, patrones, tecnologías | ADRs, diagramas C4, decisiones técnicas |
| **Analista Funcional** | Requisitos, casos de uso | Historias de usuario, criterios de aceptación |
| **Diseñador de BD** | Modelado de datos, normalización | Modelo ER, SQL, optimización |
| **Backend Senior** | APIs, servicios, lógica de negocio | OpenAPI, arquitectura de servicios |
| **Frontend Senior** | Interfaces, UX, componentes | Wireframes, mockups, guía de estilos |
| **DevOps** | Infraestructura, CI/CD, deployment | Diagrama infraestructura, Dockerfiles, K8s |
| **Seguridad** | Análisis de riesgos, controles | Matriz de riesgos, checklist OWASP |
| **QA Lead** | Plan de pruebas, automatización | Estrategia de testing, casos de prueba |

## 🚀 Cómo Usarlo

### Formato Básico

```
@Software Architecture Expert Team

[CONTEXTO]
Estamos desarrollando un sistema para [descripción del dominio]

[REQUISITOS]
- Requisito 1
- Requisito 2
- Requisito 3

[RESTRICCIONES]
- Restricción 1
- Restricción 2

[PREGUNTAS ESPECÍFICAS]
¿Cuál debe ser la estrategia Multi-Tenant?
¿Cómo debería ser la arquitectura?
```

### Ejemplo 1: Diseño Completo de Sistema

```
@Software Architecture Expert Team

Necesitamos diseñar un sistema SaaS para gestión de recursos humanos.

REQUISITOS:
- Múltiples organizaciones con datos aislados
- 50,000 usuarios activos en Q1
- Crece a 500,000 en 2 años
- Integración con sistemas payroll
- Reportes complejos por departamento
- Mobile app opcional

RESTRICCIONES:
- Budget inicial limitado
- Team de 5 desarrolladores
- Debe funcionar en AWS
- Cumplir GDPR/CCPA

¿Cómo sería la arquitectura? ¿Cuál sería la estrategia de datos? 
¿Qué riesgos de seguridad hay?
```

### Ejemplo 2: Revisión de Decisión Específica

```
@Software Architecture Expert Team

Estamos considerando usar una base de datos compartida con esquemas 
separados por tenant. ¿Es la mejor opción? ¿Qué alternativas existen?
```

### Ejemplo 3: Validación de Componente

```
@Software Architecture Expert Team

Hemos diseñado el modelo de datos para un módulo de facturación. 
¿Es escalable? ¿Tiene agujeros de seguridad? ¿Puedo aplicar índices 
para optimizar?
```

## 📋 Tipos de Respuestas

### Respuesta Completa (Sistema Nuevo)

El equipo proporcionará:

1. ✅ **ANÁLISIS** - Situación, opciones, trade-offs
2. ✅ **RECOMENDACIONES** - Solución propuesta con justificación
3. ✅ **RIESGOS** - Identificación y mitigación
4. ✅ **ENTREGABLES** - Artefactos concretos (diagramas, specs)
5. ✅ **PRÓXIMOS PASOS** - Roadmap de implementación

### Respuesta Enfocada (Pregunta Específica)

Solo responderá el/los especialista(s) relevante(s) con análisis conciso.

## 💡 Tips de Uso

### Tip 1: Sé Específico
❌ Malo: "Diseña un portal web"
✅ Bueno: "Diseña un portal SaaS para freelancers con 3 tipos de usuarios, 100k transacciones/mes"

### Tip 2: Proporciona Contexto
❌ Malo: "¿Qué BD debería usar?"
✅ Bueno: "Tenemos 1M de usuarios, crecimiento exponencial, datos de IoT en tiempo real"

### Tip 3: Haz Preguntas Claras
❌ Malo: "¿Está bien esto?"
✅ Bueno: "¿Es segura la estrategia de autenticación? ¿Hay vulnerabilidades OWASP?"

### Tip 4: Pregunta un Especialista si Necesitas
```
@Software Architecture Expert Team - DB Designer

¿Debería normalizar esta tabla o desnormalizar para performance?
```

## 📊 Ejemplos de Entregables

### Diagramas
```
Diagrama C4 (Context, Container, Component, Code)
Diagrama de datos (Modelo ER)
Diagrama de infraestructura
Flujos de usuario (UML)
```

### Documentos
```
ADRs (Architecture Decision Records)
Especificación OpenAPI/Swagger
Plan de pruebas
Matriz de riesgos
Estrategia de seguridad
```

### Código / Configuración
```
Dockerfiles
Manifiestos Kubernetes
SQL DDL
Configuración CI/CD
```

## 🔍 Preguntas Frecuentes

### ¿Puedo usar solo un especialista?

Sí. Por ejemplo:
```
@Software Architecture Expert Team - Backend Senior

Diseña los endpoints para gestión de usuarios multi-tenant
```

### ¿Qué pasa con conflictos entre especialistas?

El equipo detecta conflictos automáticamente y propone resoluciones con justificación.

### ¿Cuánto tiempo toma una respuesta?

- Análisis enfocado: 5-10 minutos
- Diseño de módulo: 15-30 minutos
- Diseño de sistema completo: 30-60 minutos

### ¿Puedo personalizar al equipo?

Sí. Edita `.github/agents/software-architecture-team.agent.md` para:
- Cambiar especialidades
- Agregar roles nuevos
- Ajustar procesos

## 🎓 Estándares Que Aplica

El equipo sigue:
- **Clean Code** (Robert C. Martin)
- **Domain-Driven Design** (Eric Evans)
- **SOLID Principles**
- **The Twelve-Factor App**
- **AWS Well-Architected Framework**
- **OWASP Top 10**
- **C4 Model**

## ⚠️ Limitaciones

Este agente:
- ✅ Diseña y planifica
- ✅ Valida decisiones técnicas
- ✅ Identifica riesgos
- ❌ NO implementa código automáticamente
- ❌ NO reemplaza decisiones comerciales
- ❌ NO garantiza funcionamiento perfecto (siempre valida después)

## 🔗 Recursos Relacionados

- **Archivo del agente:** `.github/agents/software-architecture-team.agent.md`
- **Agentes disponibles:** `.github/AGENTS.md`
- **Proyecto actual:** Pymex

---

**¡Listo para usarlo!** 🚀

Invoca a tu equipo de expertos y empieza a diseñar sistemas increíbles.

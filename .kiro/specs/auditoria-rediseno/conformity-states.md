# Estados de Conformidad en Auditorías

## 📊 Clasificación de Puntos de Norma

Cada punto de la norma ISO 9001 puede ser clasificado con uno de los siguientes estados durante la ejecución de la auditoría:

---

## ✅ CF - Cumple Satisfactoriamente

**Descripción**: El requisito de la norma se cumple completamente y de manera satisfactoria.

**Color**: Verde 🟢  
**Impacto**: Positivo  
**Acción requerida**: Ninguna

**Ejemplo**:

> El punto 4.1 "Comprensión de la organización" está completamente implementado con análisis FODA actualizado y documentado.

---

## ❌ NCM - No Conformidad Mayor

**Descripción**: Incumplimiento grave de un requisito de la norma que afecta significativamente al sistema de gestión.

**Color**: Rojo 🔴  
**Impacto**: Crítico  
**Acción requerida**: **Obligatoria** - Requiere acción correctiva inmediata

**Ejemplo**:

> El punto 8.3.4 "Controles de diseño" no está implementado, no existen registros de revisiones de diseño.

**Consecuencias**:

- Puede impedir la certificación
- Requiere seguimiento prioritario
- Debe generar hallazgo y acción correctiva

---

## ⚠️ NCm - No Conformidad Menor

**Descripción**: Incumplimiento parcial de un requisito que no afecta gravemente al sistema de gestión.

**Color**: Naranja 🟠  
**Impacto**: Moderado  
**Acción requerida**: **Recomendada** - Requiere acción correctiva

**Ejemplo**:

> El punto 6.2 "Objetivos de calidad" está definido pero no se mide su cumplimiento regularmente.

**Consecuencias**:

- No impide certificación pero debe corregirse
- Requiere seguimiento
- Debe generar hallazgo y acción correctiva

---

## ⚡ NCT - No Conformidad Trivial

**Descripción**: Desviación menor que no afecta significativamente el cumplimiento del requisito.

**Color**: Amarillo 🟡  
**Impacto**: Bajo  
**Acción requerida**: **Opcional** - Puede requerir acción correctiva

**Ejemplo**:

> El punto 7.1.5 "Recursos de seguimiento" tiene algunos registros incompletos o desactualizados.

**Consecuencias**:

- No impide certificación
- Seguimiento recomendado
- Puede generar observación o acción preventiva

---

## 🔮 R - Riesgo

**Descripción**: Situación que podría convertirse en no conformidad si no se toman medidas preventivas.

**Color**: Púrpura 🟣  
**Impacto**: Potencial  
**Acción requerida**: **Preventiva** - Requiere acción preventiva

**Ejemplo**:

> El punto 8.5.1 "Control de producción" cumple actualmente, pero el equipo crítico está cerca del fin de su vida útil sin plan de reemplazo.

**Consecuencias**:

- No es una no conformidad actual
- Requiere monitoreo
- Debe generar acción preventiva

---

## 💡 OM - Oportunidad de Mejora

**Descripción**: Área donde se puede mejorar el sistema de gestión más allá del cumplimiento mínimo.

**Color**: Azul 🔵  
**Impacto**: Positivo potencial  
**Acción requerida**: **Opcional** - Puede generar acción de mejora

**Ejemplo**:

> El punto 9.1.2 "Satisfacción del cliente" cumple con encuestas anuales, pero podría implementarse un sistema de feedback continuo.

**Consecuencias**:

- No es obligatorio
- Mejora la eficacia del sistema
- Puede generar acción de mejora

---

## 💪 F - Fortaleza

**Descripción**: Aspecto del sistema de gestión que se destaca positivamente y puede servir de ejemplo.

**Color**: Verde Esmeralda 💚  
**Impacto**: Muy positivo  
**Acción requerida**: Ninguna (mantener y replicar)

**Ejemplo**:

> El punto 5.1 "Liderazgo y compromiso" está excepcionalmente implementado con participación activa de la dirección en todas las revisiones.

**Consecuencias**:

- Reconocimiento positivo
- Puede servir de benchmark interno
- Documentar como buena práctica

---

## 📈 Resumen Visual

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ✅ CF  │ ████████████████████████████ 38 (84%)    │
│  ❌ NCM │ █ 1 (2%)                                  │
│  ⚠️ NCm │ ██ 2 (4%)                                 │
│  ⚡ NCT │ █ 1 (2%)                                  │
│  🔮 R   │ █ 1 (2%)                                  │
│  💡 OM  │ █ 1 (2%)                                  │
│  💪 F   │ █ 1 (2%)                                  │
│                                                     │
│  Total: 45 puntos verificados                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Priorización de Acciones

### Prioridad 1 - CRÍTICA

- **NCM** (No Conformidad Mayor)
- Acción inmediata obligatoria
- Seguimiento estricto

### Prioridad 2 - ALTA

- **NCm** (No Conformidad Menor)
- Acción correctiva requerida
- Seguimiento regular

### Prioridad 3 - MEDIA

- **R** (Riesgo)
- Acción preventiva recomendada
- Monitoreo continuo

### Prioridad 4 - BAJA

- **NCT** (No Conformidad Trivial)
- Corrección opcional
- Seguimiento ligero

### Prioridad 5 - MEJORA

- **OM** (Oportunidad de Mejora)
- Implementación opcional
- Evaluación de beneficios

### Sin Prioridad

- **CF** (Cumple)
- **F** (Fortaleza)
- Mantener y documentar

---

## 🔗 Relación con Hallazgos (Fase Futura)

Cuando se implemente la relación con hallazgos:

| Estado | Genera Hallazgo | Tipo de Hallazgo     |
| ------ | --------------- | -------------------- |
| CF     | No              | -                    |
| NCM    | **Sí**          | No Conformidad Mayor |
| NCm    | **Sí**          | No Conformidad Menor |
| NCT    | Opcional        | Observación          |
| R      | **Sí**          | Riesgo               |
| OM     | Opcional        | Oportunidad          |
| F      | No              | -                    |

---

## 📝 Notas de Implementación

### En la UI:

- Usar radio buttons para selección única
- Mostrar descripción al pasar el mouse
- Colores distintivos para cada estado
- Iconos visuales para rápida identificación

### En Reportes:

- Agrupar por estado
- Mostrar porcentajes
- Destacar NCM y NCm
- Listar riesgos y oportunidades

### En Validaciones:

- Todos los puntos deben tener un estado asignado
- No se puede completar auditoría con puntos sin clasificar
- NCM requiere observaciones obligatorias
- NCm requiere observaciones obligatorias

---

## 🎨 Paleta de Colores

```css
/* Cumple Satisfactoriamente */
.status-cf {
  background: #dcfce7;
  color: #166534;
  border-color: #86efac;
}

/* No Conformidad Mayor */
.status-ncm {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fca5a5;
}

/* No Conformidad Menor */
.status-ncm-minor {
  background: #ffedd5;
  color: #9a3412;
  border-color: #fdba74;
}

/* No Conformidad Trivial */
.status-nct {
  background: #fef9c3;
  color: #854d0e;
  border-color: #fde047;
}

/* Riesgo */
.status-r {
  background: #f3e8ff;
  color: #6b21a8;
  border-color: #d8b4fe;
}

/* Oportunidad de Mejora */
.status-om {
  background: #dbeafe;
  color: #1e40af;
  border-color: #93c5fd;
}

/* Fortaleza */
.status-f {
  background: #d1fae5;
  color: #065f46;
  border-color: #6ee7b7;
}
```

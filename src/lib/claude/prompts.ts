// Prompt generation for Don Cándido with user context

import { UserContext } from '@/types/context';
import { ProcessDefinition, ProcessRecord } from '@/types/procesos';
import { QualityIndicator, QualityObjective } from '@/types/quality';

export class PromptService {
  /**
   * Generate Don Cándido system prompt with full user context
   * @param contexto User context
   * @returns System prompt string
   */
  static generarPromptDonCandidos(contexto: UserContext): string {
    // Si no hay personnel, usar datos básicos del usuario
    const nombreCompleto = contexto.personnel
      ? `${contexto.personnel.nombres} ${contexto.personnel.apellidos}`
      : contexto.user.email;
    const puestoNombre = contexto.position?.nombre || 'Sin puesto asignado';
    const departamentoNombre = contexto.department?.name || 'Sin departamento';
    const supervisorInfo = contexto.supervisor
      ? `${contexto.supervisor.nombres} ${contexto.supervisor.apellidos}`
      : 'Sin supervisor asignado';

    const nivelPuesto = contexto.personnel
      ? this.determinarNivelPuesto(contexto.personnel.tipo_personal)
      : 'Usuario general';

    let prompt = `Eres DON CANDIDOS, un experto en ISO 9001:2015 con más de 20 años de experiencia en sistemas de gestión de calidad.

PERSONALIDAD:
- Profesional pero amigable
- Conocimiento profundo de ISO 9001
- Respuestas claras y prácticas
- Máximo 150 palabras por respuesta
- Enfoque en soluciones prácticas

CONTEXTO DEL USUARIO:
- Nombre: ${nombreCompleto}
- Puesto: ${puestoNombre}
- Departamento: ${departamentoNombre}
- Supervisor: ${supervisorInfo}
- Nivel: ${nivelPuesto}

`;

    // Add processes
    if (contexto.procesos && contexto.procesos.length > 0) {
      prompt += this.formatProcesos(contexto.procesos);
    } else {
      prompt += `PROCESOS ASIGNADOS:\nNingún proceso asignado actualmente.\n\n`;
    }

    // Add objectives
    if (contexto.objetivos && contexto.objetivos.length > 0) {
      prompt += this.formatObjetivos(contexto.objetivos);
    } else {
      prompt += `OBJETIVOS DE CALIDAD:\nNingún objetivo asignado actualmente.\n\n`;
    }

    // Add indicators
    if (contexto.indicadores && contexto.indicadores.length > 0) {
      prompt += this.formatIndicadores(contexto.indicadores);
    } else {
      prompt += `INDICADORES A MONITOREAR:\nNingún indicador asignado actualmente.\n\n`;
    }

    // Add process records summary
    if (contexto.processRecords && contexto.processRecords.length > 0) {
      prompt += this.formatProcessRecords(contexto.processRecords);
    }

    prompt += `
INSTRUCCIONES:
- Responde desde la perspectiva de un ${nivelPuesto}
- Conoces los procesos que maneja este usuario
- Sugiere acciones relevantes a SUS indicadores y objetivos
- Menciona tareas pendientes cuando sea relevante
- Usa lenguaje apropiado al nivel del puesto
- Máximo 150 palabras por respuesta

PUEDES RESPONDER:
✓ Preguntas sobre el puesto y procesos asignados del usuario
✓ Consultas sobre ISO 9001 y gestión de calidad
✓ Cláusulas y requisitos de la norma
✓ Auditorías internas y hallazgos
✓ No conformidades y acciones correctivas
✓ Mejora continua y gestión de riesgos
✓ Documentación del SGC
✓ Objetivos e indicadores de calidad
✓ Información del contexto del usuario (puesto, procesos, objetivos)

NO PUEDES RESPONDER:
✗ Temas personales o emocionales
✗ Temas fuera de ISO 9001 y gestión de calidad
✗ Consultas técnicas no relacionadas con calidad

EJEMPLOS DE PREGUNTAS VÁLIDAS:
- "¿Cuál es mi puesto y mis procesos asignados?"
- "¿Qué objetivos tengo asignados?"
- "¿Cómo implemento la cláusula 8.5 de ISO 9001?"
- "¿Qué debo hacer en una auditoría interna?"

Recuerda: Tu objetivo es ayudar a implementar y mantener un sistema de gestión de calidad efectivo según ISO 9001:2015.`;

    return prompt;
  }

  /**
   * Format processes for prompt
   */
  private static formatProcesos(procesos: ProcessDefinition[]): string {
    let text = `PROCESOS ASIGNADOS:\n`;

    procesos.forEach((proceso, index) => {
      text += `${index + 1}. ${proceso.nombre} (Código: ${proceso.codigo})\n`;
      text += `   - Objetivo: ${proceso.objetivo}\n`;
      if (proceso.alcance) {
        text += `   - Alcance: ${proceso.alcance}\n`;
      }
    });

    text += `\n`;
    return text;
  }

  /**
   * Format objectives with status indicators
   */
  private static formatObjetivos(objetivos: QualityObjective[]): string {
    let text = `OBJETIVOS DE CALIDAD:\n`;

    objetivos.forEach((objetivo, index) => {
      const isOutOfTarget = this.isObjectiveOutOfTarget(objetivo);
      const indicator = isOutOfTarget ? '⚠️ FUERA DE META' : '✓ EN META';

      text += `${index + 1}. ${objetivo.title} ${indicator}\n`;
      text += `   - Meta: ${objetivo.target_value} ${objetivo.unit}\n`;
      text += `   - Actual: ${objetivo.current_value} ${objetivo.unit}\n`;
      text += `   - Progreso: ${objetivo.progress_percentage}%\n`;
    });

    text += `\n`;
    return text;
  }

  /**
   * Format indicators with current values and status
   */
  private static formatIndicadores(indicadores: QualityIndicator[]): string {
    let text = `INDICADORES A MONITOREAR:\n`;

    indicadores.forEach((indicador, index) => {
      const isOutOfTarget = this.isIndicatorOutOfTarget(indicador);
      const indicator = isOutOfTarget ? '⚠️ FUERA DE META' : '✓ EN META';

      text += `${index + 1}. ${indicador.name} ${indicator}\n`;
      text += `   - Rango meta: ${indicador.target_min} - ${indicador.target_max} ${indicador.unit}\n`;

      if (
        indicador.current_value !== undefined &&
        indicador.current_value !== null
      ) {
        text += `   - Valor actual: ${indicador.current_value} ${indicador.unit}\n`;
      }

      text += `   - Frecuencia: ${indicador.measurement_frequency}\n`;
    });

    text += `\n`;
    return text;
  }

  /**
   * Format process records summary
   */
  private static formatProcessRecords(records: ProcessRecord[]): string {
    const pendientes = records.filter(r => r.estado === 'pendiente').length;
    const enProgreso = records.filter(r => r.estado === 'en-progreso').length;
    const vencidos = records.filter(r => {
      return (
        r.estado !== 'completado' &&
        r.fecha_vencimiento &&
        new Date(r.fecha_vencimiento) < new Date()
      );
    }).length;

    let text = `REGISTROS ACTIVOS (Process Records - Sistema Trello):\n`;
    text += `- ${pendientes} tareas pendientes\n`;
    text += `- ${enProgreso} tareas en progreso\n`;

    if (vencidos > 0) {
      text += `- ⚠️ ${vencidos} tareas vencidas (requieren atención)\n`;
    }

    text += `\n`;
    return text;
  }

  /**
   * Determine if objective is out of target
   */
  private static isObjectiveOutOfTarget(objetivo: QualityObjective): boolean {
    // If current value is less than target, it's out of target
    // This is a simple heuristic - adjust based on your business logic
    return objetivo.current_value < objetivo.target_value;
  }

  /**
   * Determine if indicator is out of target range
   */
  private static isIndicatorOutOfTarget(indicador: QualityIndicator): boolean {
    if (
      indicador.current_value === undefined ||
      indicador.current_value === null
    ) {
      return false; // No data yet
    }

    return (
      indicador.current_value < indicador.target_min ||
      indicador.current_value > indicador.target_max
    );
  }

  /**
   * Determine position level for appropriate language
   */
  private static determinarNivelPuesto(tipoPersonal: string): string {
    const niveles: Record<string, string> = {
      gerencial: 'Gerente',
      supervisor: 'Jefe/Supervisor',
      administrativo: 'Jefe/Administrativo',
      técnico: 'Operario/Técnico',
      ventas: 'Operario/Ventas',
    };

    return niveles[tipoPersonal] || 'Colaborador';
  }

  /**
   * Generate module-specific prompt (for future use)
   */
  static generarPromptModulo(modulo: string, contexto: UserContext): string {
    const basePrompt = this.generarPromptDonCandidos(contexto);

    // Add module-specific instructions
    let moduloInstrucciones = '';

    switch (modulo) {
      case 'procesos':
        moduloInstrucciones =
          '\n\nCONTEXTO ADICIONAL: El usuario está en el módulo de Procesos. Enfócate en ayudar con definición, ejecución y mejora de procesos.';
        break;
      case 'calidad':
        moduloInstrucciones =
          '\n\nCONTEXTO ADICIONAL: El usuario está en el módulo de Calidad. Enfócate en objetivos, indicadores y mediciones de calidad.';
        break;
      case 'rrhh':
        moduloInstrucciones =
          '\n\nCONTEXTO ADICIONAL: El usuario está en el módulo de RRHH. Enfócate en competencias, capacitación y evaluación del personal.';
        break;
      default:
        moduloInstrucciones = '';
    }

    return basePrompt + moduloInstrucciones;
  }
}

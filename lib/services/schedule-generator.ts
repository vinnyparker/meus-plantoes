/**
 * Motor de geração de escalas com regras de descanso automáticas
 * Algoritmo: sequência define plantões/folgas, descanso é AUTOMÁTICO após plantões
 */

import { ScheduleEvent, ShiftType, ShiftSystem, IndicatorType, EventType } from "@/lib/types/schedule";

export interface RestConfig {
  sdRestHours: number; // Horas de descanso após SD (24, 36 ou 48)
  snRestHours: number; // Horas de descanso após SN (24, 36 ou 48)
}

export class ScheduleGenerator {
  /**
   * Configurações padrão de turnos
   */
  static readonly DEFAULT_SHIFT_CONFIG = {
    SD: {
      type: "SD" as ShiftType,
      startTime: "07:00",
      endTime: "19:00",
      icon: "☀️",
      label: "Turno Diurno",
      color: "#87CEEB",
    },
    SN: {
      type: "SN" as ShiftType,
      startTime: "19:00",
      endTime: "07:00",
      icon: "🌙",
      label: "Turno Noturno",
      color: "#9370DB",
    },
  };

  /**
   * Sistemas de turno pré-configurados
   */
  static readonly SHIFT_SYSTEMS = {
    "12/36": {
      name: "12/36",
      rules: [
        { afterShift: "SD" as ShiftType, restDays: 1.5, offDays: 0 },
        { afterShift: "SN" as ShiftType, restDays: 1, offDays: 1 },
      ],
      shiftConfigs: {
        SD: this.DEFAULT_SHIFT_CONFIG.SD,
        SN: this.DEFAULT_SHIFT_CONFIG.SN,
        F: { type: "F" as ShiftType, startTime: "", endTime: "", icon: "", label: "Folga", color: "#22C55E" },
        D: { type: "D" as ShiftType, startTime: "", endTime: "", icon: "", label: "Descanso", color: "#22C55E" },
      },
    },
    "12/48": {
      name: "12/48",
      rules: [
        { afterShift: "SD" as ShiftType, restDays: 2, offDays: 0 },
        { afterShift: "SN" as ShiftType, restDays: 1.5, offDays: 0.5 },
      ],
      shiftConfigs: {
        SD: this.DEFAULT_SHIFT_CONFIG.SD,
        SN: this.DEFAULT_SHIFT_CONFIG.SN,
        F: { type: "F" as ShiftType, startTime: "", endTime: "", icon: "", label: "Folga", color: "#22C55E" },
        D: { type: "D" as ShiftType, startTime: "", endTime: "", icon: "", label: "Descanso", color: "#22C55E" },
      },
    },
  };

  /**
   * Parseia uma sequência de turnos (ex: "SD, F, SN, F")
   * Nota: D (descanso) é automático e não precisa estar na sequência
   */
  static parseSequence(sequence: string): ShiftType[] {
    return sequence
      .split(/[,\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => ["SD", "SN", "F", "D"].includes(s)) as ShiftType[];
  }

  /**
   * Adiciona horas a uma data/hora
   */
  private static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Obtém a data/hora de término de um plantão
   * SD: termina às 19:00 do mesmo dia
   * SN: termina às 07:00 do dia seguinte
   */
  private static getShiftEndDateTime(shiftDate: Date, shiftType: ShiftType): Date {
    const result = new Date(shiftDate);
    result.setHours(0, 0, 0, 0);

    if (shiftType === "SD") {
      // SD: 07:00 a 19:00 do mesmo dia
      result.setHours(19, 0, 0, 0);
    } else if (shiftType === "SN") {
      // SN: 19:00 a 07:00 do dia seguinte
      result.setDate(result.getDate() + 1);
      result.setHours(7, 0, 0, 0);
    }

    return result;
  }

  /**
   * Calcula a data/hora do próximo evento (plantão ou folga)
   * Após um plantão (SD/SN), soma as horas de descanso
   * Após uma folga (F), vai para o próximo dia
   */
  private static getNextEventDateTime(
    currentDate: Date,
    currentShiftType: ShiftType,
    restConfig: RestConfig
  ): Date {
    if (currentShiftType === "F" || currentShiftType === "D") {
      // Folga ou descanso: próximo evento é no dia seguinte
      const result = new Date(currentDate);
      result.setDate(result.getDate() + 1);
      result.setHours(0, 0, 0, 0);
      return result;
    }

    // Plantão: calcular data/hora de término + descanso
    const shiftEndDateTime = this.getShiftEndDateTime(currentDate, currentShiftType);
    const restHours = currentShiftType === "SD" ? restConfig.sdRestHours : restConfig.snRestHours;
    const nextEventDateTime = this.addHours(shiftEndDateTime, restHours);

    // Retornar como data (00:00)
    const result = new Date(nextEventDateTime);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Gera uma escala completa a partir de uma sequência
   * 
   * IMPORTANTE: A sequência define APENAS os plantões e folgas explícitas.
   * O descanso automático é calculado APÓS cada plantão.
   * 
   * Exemplo: "SD, F, SN, F" significa:
   * - SD (plantão)
   * - F (folga explícita)
   * - SN (plantão)
   * - F (folga explícita)
   * - (depois volta para SD)
   * 
   * O descanso automático é inserido ENTRE o plantão e a folga explícita.
   */
  static generateSchedule(
    sequence: ShiftType[],
    year: number,
    month: number,
    system: ShiftSystem,
    restConfig: RestConfig,
    location?: string,
    p1Shifts: ShiftType[] = [],
    p2Shifts: ShiftType[] = []
  ): ScheduleEvent[] {
    if (sequence.length === 0) {
      throw new Error("Sequência de turnos não pode estar vazia");
    }

    const events: ScheduleEvent[] = [];
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Normalizar startDate para 00:00
    startDate.setHours(0, 0, 0, 0);

    let currentDate = new Date(startDate);
    let sequenceIndex = 0;
    let lastShiftWasPlantao = false;
    let lastShiftType: ShiftType | null = null;

    while (currentDate <= endDate) {
      const shift = sequence[sequenceIndex % sequence.length];

      if (shift === "F" || shift === "D") {
        // Folga ou Descanso - dia inteiro
        const eventType: EventType = shift === "F" ? "OFF" : "REST";
        const title = shift === "F" ? "🟢 Folga" : "🟢 Descanso";

        if (currentDate >= startDate && currentDate <= endDate) {
          events.push({
            id: `${currentDate.toISOString()}-${eventType}`,
            date: new Date(currentDate),
            type: eventType,
            startTime: "00:00",
            endTime: "23:59",
            title,
            description: shift === "F" ? "Dia de folga" : "Dia de descanso",
            location,
            isRest: true,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
        lastShiftWasPlantao = false;
        sequenceIndex++;
      } else if (shift === "SD" || shift === "SN") {
        // Turno de trabalho
        const config = system.shiftConfigs[shift];
        const indicator = this.getIndicator(shift, p1Shifts, p2Shifts);
        const indicatorStr = indicator ? (indicator === "P1" ? "🔴" : "🔵") : "";
        
        const startTime = shift === "SD" ? "07:00" : "19:00";
        const endTime = shift === "SD" ? "19:00" : "07:00";
        const title = `${startTime} ${config.icon} ${shift} - ${config.label} ${indicatorStr}`.trim();

        if (currentDate >= startDate && currentDate <= endDate) {
          events.push({
            id: `${currentDate.toISOString()}-${shift}`,
            date: new Date(currentDate),
            type: shift,
            startTime: startTime,
            endTime: endTime,
            title,
            description: config.label,
            location,
            indicator,
            isRest: false,
          });
        }

        // Calcular data do próximo evento na sequência
        const nextSequenceShift = sequence[(sequenceIndex + 1) % sequence.length];
        
        // Se o próximo na sequência é uma folga (F/D), precisamos preencher o descanso automático
        if (nextSequenceShift === "F" || nextSequenceShift === "D") {
          // Calcular quando o descanso automático termina
          const shiftEndDateTime = this.getShiftEndDateTime(currentDate, shift);
          const restHours = shift === "SD" ? restConfig.sdRestHours : restConfig.snRestHours;
          const restEndDateTime = this.addHours(shiftEndDateTime, restHours);
          
          // Normalizar para data (00:00)
          const restEndDate = new Date(restEndDateTime);
          restEndDate.setHours(0, 0, 0, 0);
          
          // Preencher dias de descanso automático
          let fillDate = new Date(currentDate);
          fillDate.setDate(fillDate.getDate() + 1);
          fillDate.setHours(0, 0, 0, 0);
          
          while (fillDate < restEndDate && fillDate <= endDate) {
            events.push({
              id: `${fillDate.toISOString()}-REST`,
              date: new Date(fillDate),
              type: "REST",
              startTime: "00:00",
              endTime: "23:59",
              title: "🟢 Descanso",
              description: "Dia de descanso automático",
              location,
              isRest: true,
            });
            fillDate.setDate(fillDate.getDate() + 1);
          }
          
          currentDate = new Date(restEndDate);
        } else {
          // Próximo é um plantão, ir para o próximo dia
          currentDate.setDate(currentDate.getDate() + 1);
        }

        lastShiftWasPlantao = true;
        lastShiftType = shift;
        sequenceIndex++;
      }
    }

    // Filtrar eventos que estão fora do mês
    return events.filter((event) => {
      const eventMonth = event.date.getMonth() + 1;
      const eventYear = event.date.getFullYear();
      return eventYear === year && eventMonth === month;
    });
  }

  /**
   * Determina o indicador (P1/P2) para um turno
   */
  private static getIndicator(
    shift: ShiftType,
    p1Shifts: ShiftType[],
    p2Shifts: ShiftType[]
  ): IndicatorType {
    if (p1Shifts.includes(shift)) return "P1";
    if (p2Shifts.includes(shift)) return "P2";
    return null;
  }

  /**
   * Valida uma sequência de turnos
   */
  static validateSequence(sequence: ShiftType[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (sequence.length === 0) {
      errors.push("Sequência não pode estar vazia");
    }

    if (sequence.length > 30) {
      errors.push("Sequência não pode ter mais de 30 elementos");
    }

    const validTypes = ["SD", "SN", "F", "D"];
    sequence.forEach((shift, index) => {
      if (!validTypes.includes(shift)) {
        errors.push(`Turno inválido na posição ${index + 1}: ${shift}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Obtém o sistema de turno padrão
   */
  static getDefaultSystem(name: "12/36" | "12/48" = "12/36"): ShiftSystem {
    return this.SHIFT_SYSTEMS[name];
  }
}

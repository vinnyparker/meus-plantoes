/**
 * Motor de geração de escalas com regras de descanso automáticas
 * Algoritmo baseado em cálculo de data/hora de término + horas de descanso
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
   * Parseia uma sequência de turnos (ex: "SD, F, SN, D, F")
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
   * Calcula a data/hora do próximo plantão
   * Soma as horas de descanso ao horário de término do plantão anterior
   */
  private static getNextShiftDateTime(
    currentShiftDate: Date,
    currentShiftType: ShiftType,
    restHours: number
  ): Date {
    // Obter data/hora de término do plantão atual
    const shiftEndDateTime = this.getShiftEndDateTime(currentShiftDate, currentShiftType);

    // Somar as horas de descanso
    const nextShiftDateTime = this.addHours(shiftEndDateTime, restHours);

    return nextShiftDateTime;
  }

  /**
   * Gera uma escala completa a partir de uma sequência
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

    let currentDateTime = new Date(startDate);
    currentDateTime.setHours(0, 0, 0, 0);
    
    let sequenceIndex = 0;

    while (currentDateTime <= endDate) {
      const shift = sequence[sequenceIndex % sequence.length];
      const shiftDate = new Date(currentDateTime);
      shiftDate.setHours(0, 0, 0, 0);

      if (shift === "F" || shift === "D") {
        // Folga ou Descanso - dia inteiro
        const eventType: EventType = shift === "F" ? "OFF" : "REST";
        const title = shift === "F" ? "🟢 Folga" : "🟢 Descanso";

        if (shiftDate >= startDate && shiftDate <= endDate) {
          events.push({
            id: `${shiftDate.toISOString()}-${eventType}`,
            date: new Date(shiftDate),
            type: eventType,
            startTime: "00:00",
            endTime: "23:59",
            title,
            description: shift === "F" ? "Dia de folga" : "Dia de descanso",
            location,
            isRest: true,
          });
        }

        currentDateTime.setDate(currentDateTime.getDate() + 1);
        sequenceIndex++;
      } else if (shift === "SD" || shift === "SN") {
        // Turno de trabalho
        const config = system.shiftConfigs[shift];
        const indicator = this.getIndicator(shift, p1Shifts, p2Shifts);
        const indicatorStr = indicator ? (indicator === "P1" ? "🔴" : "🔵") : "";
        
        const startTime = shift === "SD" ? "07:00" : "19:00";
        const endTime = shift === "SD" ? "19:00" : "07:00";
        const title = `${startTime} ${config.icon} ${shift} - ${config.label} ${indicatorStr}`.trim();

        if (shiftDate >= startDate && shiftDate <= endDate) {
          events.push({
            id: `${shiftDate.toISOString()}-${shift}`,
            date: new Date(shiftDate),
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

        // Calcular data/hora do próximo plantão
        const restHours = shift === "SD" ? restConfig.sdRestHours : restConfig.snRestHours;
        const nextShiftDateTime = this.getNextShiftDateTime(shiftDate, shift, restHours);

        // Preencher dias de descanso entre o plantão atual e o próximo
        let fillDate = new Date(shiftDate);
        fillDate.setDate(fillDate.getDate() + 1);
        fillDate.setHours(0, 0, 0, 0);

        // Obter a data do próximo plantão (sem horas)
        const nextShiftDate = new Date(nextShiftDateTime);
        nextShiftDate.setHours(0, 0, 0, 0);

        while (fillDate < nextShiftDate && fillDate <= endDate) {
          // Adicionar dia de descanso entre plantões
          events.push({
            id: `${fillDate.toISOString()}-REST`,
            date: new Date(fillDate),
            type: "REST",
            startTime: "00:00",
            endTime: "23:59",
            title: "🟢 Descanso",
            description: "Dia de descanso",
            location,
            isRest: true,
          });

          fillDate.setDate(fillDate.getDate() + 1);
        }

        // Avançar para o próximo plantão
        currentDateTime = new Date(nextShiftDate);
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

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
   * Obtém a data de início de um turno (normaliza para 00:00 do dia)
   */
  private static getShiftStartDate(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Obtém a data de término de um turno baseado no tipo
   * SD: termina às 19:00 do mesmo dia
   * SN: termina às 07:00 do dia seguinte
   */
  private static getShiftEndDateTime(shiftDate: Date, shiftType: ShiftType): Date {
    const result = new Date(shiftDate);
    result.setHours(0, 0, 0, 0);

    if (shiftType === "SD") {
      // SD termina às 19:00 do mesmo dia
      result.setHours(19, 0, 0, 0);
    } else if (shiftType === "SN") {
      // SN termina às 07:00 do dia seguinte
      result.setDate(result.getDate() + 1);
      result.setHours(7, 0, 0, 0);
    }

    return result;
  }

  /**
   * Calcula a data do próximo plantão
   * Soma as horas de descanso ao horário de término do plantão anterior
   */
  private static getNextShiftDate(
    currentShiftDate: Date,
    currentShiftType: ShiftType,
    restHours: number
  ): Date {
    // Obter data/hora de término do plantão atual
    const shiftEndDateTime = this.getShiftEndDateTime(currentShiftDate, currentShiftType);

    // Somar as horas de descanso
    const nextShiftDateTime = this.addHours(shiftEndDateTime, restHours);

    // Retornar apenas a data (normalizada para 00:00)
    const result = new Date(nextShiftDateTime);
    result.setHours(0, 0, 0, 0);

    return result;
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

    let currentDate = new Date(startDate);
    let sequenceIndex = 0;

    while (currentDate <= endDate) {
      const shift = sequence[sequenceIndex % sequence.length];

      if (shift === "F" || shift === "D") {
        // Folga ou Descanso - dia inteiro
        const eventType: EventType = shift === "F" ? "OFF" : "REST";
        const title = shift === "F" ? "🟢 Folga" : "🟢 Descanso";

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

        currentDate.setDate(currentDate.getDate() + 1);
        sequenceIndex++;
      } else if (shift === "SD" || shift === "SN") {
        // Turno de trabalho
        const config = system.shiftConfigs[shift];
        const indicator = this.getIndicator(shift, p1Shifts, p2Shifts);
        const indicatorStr = indicator ? (indicator === "P1" ? "🔴" : "🔵") : "";
        
        const startTime = shift === "SD" ? "07:00" : "19:00";
        const endTime = shift === "SD" ? "19:00" : "07:00";
        const title = `${startTime} ${config.icon} ${shift} - ${config.label} ${indicatorStr}`.trim();

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

        // Calcular data do próximo plantão
        const restHours = shift === "SD" ? restConfig.sdRestHours : restConfig.snRestHours;
        const nextShiftDate = this.getNextShiftDate(currentDate, shift, restHours);

        // Preencher dias entre o plantão atual e o próximo
        let fillDate = new Date(currentDate);
        fillDate.setDate(fillDate.getDate() + 1);

        while (fillDate < nextShiftDate && fillDate <= endDate) {
          // Adicionar dia de descanso/folga entre plantões
          const eventType: EventType = "REST";
          const title = "🟢 Descanso";

          events.push({
            id: `${fillDate.toISOString()}-${eventType}`,
            date: new Date(fillDate),
            type: eventType,
            startTime: "00:00",
            endTime: "23:59",
            title,
            description: "Dia de descanso",
            location,
            isRest: true,
          });

          fillDate.setDate(fillDate.getDate() + 1);
        }

        currentDate = new Date(nextShiftDate);
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

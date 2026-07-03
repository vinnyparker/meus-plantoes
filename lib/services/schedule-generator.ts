/**
 * Motor de geração de escalas com regras de descanso automáticas
 * 
 * ALGORITMO CORRETO E SIMPLES:
 * 1. Sequência define a ordem dos plantões e folgas: "SD, F, SN, D, F, SD, F, SN, D, F"
 * 2. Para cada item da sequência:
 *    - Se é plantão (SD/SN): adiciona na data calculada
 *    - Se é folga/descanso (F/D): adiciona na próxima data disponível
 * 3. Após CADA plantão: soma as horas de descanso ao horário de término
 *    - SD termina 19:00 + 36h = 19:00 do dia 03/07
 *    - SN termina 07:00 + 48h = 07:00 do dia 06/07
 * 
 * Exemplo: "SD, F, SN, D, F"
 * - 01/07: SD (07:00-19:00) termina 19:00 + 36h = 19:00 dia 03/07
 * - 02/07: F (próximo item)
 * - 03/07: SN (19:00-07:00 dia 04) termina 07:00 + 48h = 07:00 dia 06/07
 * - 04/07: D (próximo item)
 * - 05/07: F (próximo item)
 * - 06/07: SD (próximo plantão após descanso)
 */

import { ScheduleEvent, ShiftType, ShiftSystem, IndicatorType, EventType } from "@/lib/types/schedule";

export interface RestConfig {
  sdRestHours: number;
  snRestHours: number;
}

export class ScheduleGenerator {
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

  static parseSequence(sequence: string): ShiftType[] {
    return sequence
      .split(/[,\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => ["SD", "SN", "F", "D"].includes(s)) as ShiftType[];
  }

  private static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  private static getShiftEndDateTime(shiftDate: Date, shiftType: ShiftType): Date {
    const result = new Date(shiftDate);
    result.setHours(0, 0, 0, 0);

    if (shiftType === "SD") {
      result.setHours(19, 0, 0, 0);
    } else if (shiftType === "SN") {
      result.setDate(result.getDate() + 1);
      result.setHours(7, 0, 0, 0);
    }

    return result;
  }

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

    startDate.setHours(0, 0, 0, 0);

    let currentDate = new Date(startDate);
    let sequenceIndex = 0;
    let nextPlantaoDate: Date | null = null;

    while (currentDate <= endDate) {
      const shift = sequence[sequenceIndex % sequence.length];

      // Se há um próximo plantão agendado, pular para essa data
      if (nextPlantaoDate && currentDate < nextPlantaoDate) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

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
        sequenceIndex++;
        nextPlantaoDate = null;
      } else if (shift === "SD" || shift === "SN") {
        // Plantão
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

        // Calcular quando termina o plantão
        const shiftEndDateTime = this.getShiftEndDateTime(currentDate, shift);
        
        // Calcular quando começa o próximo plantão (após descanso)
        const restHours = shift === "SD" ? restConfig.sdRestHours : restConfig.snRestHours;
        const nextPlantaoDateTime = this.addHours(shiftEndDateTime, restHours);
        
        // Normalizar para data (00:00)
        nextPlantaoDate = new Date(nextPlantaoDateTime);
        nextPlantaoDate.setHours(0, 0, 0, 0);

        currentDate.setDate(currentDate.getDate() + 1);
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

  private static getIndicator(
    shift: ShiftType,
    p1Shifts: ShiftType[],
    p2Shifts: ShiftType[]
  ): IndicatorType {
    if (p1Shifts.includes(shift)) return "P1";
    if (p2Shifts.includes(shift)) return "P2";
    return null;
  }

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

  static getDefaultSystem(name: "12/36" | "12/48" = "12/36"): ShiftSystem {
    return this.SHIFT_SYSTEMS[name];
  }
}

/**
 * Motor de geração de escalas com regras de descanso automáticas
 */

import { ScheduleEvent, ShiftType, ShiftSystem, IndicatorType, EventType } from "@/lib/types/schedule";

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
   * Gera uma escala completa a partir de uma sequência
   */
  static generateSchedule(
    sequence: ShiftType[],
    year: number,
    month: number,
    system: ShiftSystem,
    location?: string,
    p1Shifts: ShiftType[] = [],
    p2Shifts: ShiftType[] = [],
    sdStartTime: string = "07:00",
    sdEndTime: string = "19:00",
    snStartTime: string = "19:00",
    snEndTime: string = "07:00"
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
        const title = shift === "F" ? "🟢 OFF - Folga" : "🟢 REST - Descanso";

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
        
        // Usar horários fixos passados como parâmetro
        const startTime = shift === "SD" ? sdStartTime : snStartTime;
        const endTime = shift === "SD" ? sdEndTime : snEndTime;
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

        // Aplicar regras de descanso após o turno
        const rule = system.rules.find((r) => r.afterShift === shift);
        if (rule) {
          const totalRestDays = rule.restDays + rule.offDays;

          // Adicionar dias de descanso/folga
          for (let i = 0; i < Math.floor(totalRestDays); i++) {
            currentDate.setDate(currentDate.getDate() + 1);

            if (currentDate > endDate) break;

            const isOff = i >= rule.restDays;
            const eventType: EventType = isOff ? "OFF" : "REST";
            const restTitle = isOff ? "🟢 OFF - Folga" : "🟢 REST - Descanso";

            events.push({
              id: `${currentDate.toISOString()}-${eventType}`,
              date: new Date(currentDate),
              type: eventType,
              startTime: "00:00",
              endTime: "23:59",
              title: restTitle,
              description: isOff ? "Dia de folga" : "Dia de descanso",
              location,
              isRest: true,
            });
          }

          // Se há meio dia de descanso, marcar como meio período
          if (totalRestDays % 1 !== 0) {
            currentDate.setDate(currentDate.getDate() + 1);

            if (currentDate <= endDate) {
              events.push({
                id: `${currentDate.toISOString()}-HALF-REST`,
                date: new Date(currentDate),
                type: "REST",
                startTime: "00:00",
                endTime: "12:00",
                title: "🟢 REST - Meio Descanso (Manhã)",
                description: "Meio dia de descanso",
                location,
                isRest: true,
              });
            }
          }
        }

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

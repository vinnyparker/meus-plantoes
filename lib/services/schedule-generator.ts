export interface ShiftConfig {
  token: string;
  restHours: number;
  isWorkShift: boolean;
}

export interface DaySchedule {
  date: Date;
  dayNumber: number;
  dayOfWeek: string;
  token: string;
  label: string;
}

export interface GeneratorParams {
  month: number;
  year: number;
  sequence: string[];
  configs: Record<string, ShiftConfig>;
}

export class ScheduleGenerator {

  public static generateMonthSchedule(params: GeneratorParams): DaySchedule[] {

    const { month, year, sequence, configs } = params;

    if (!sequence || sequence.length === 0) {
      return [];
    }

    const jsMonth = month - 1;
    const totalDays = new Date(year, month, 0).getDate();

    const weekDays = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado"
    ];

    const schedule: DaySchedule[] = [];

    for (let day = 1; day <= totalDays; day++) {

      const date = new Date(year, jsMonth, day);

      const token = sequence[(day - 1) % sequence.length];

      const config = configs[token];

      schedule.push({
        date,
        dayNumber: day,
        dayOfWeek: weekDays[date.getDay()],
        token,
        label: config?.isWorkShift
          ? `Plantão ${token}`
          : token === "F"
            ? "Folga"
            : "Descanso"
      });

    }

    return schedule;

  }

}

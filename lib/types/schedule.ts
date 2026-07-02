/**
 * Tipos para o sistema de geração de escalas
 */

export type ShiftType = "SD" | "SN" | "F" | "D";
export type IndicatorType = "P1" | "P2" | null;
export type EventType = "SD" | "SN" | "F" | "D" | "REST" | "OFF";

export interface ShiftConfig {
  type: ShiftType;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  icon: string;
  label: string;
  color: string;
}

export interface RestRule {
  afterShift: ShiftType;
  restDays: number;
  offDays: number;
}

export interface ShiftSystem {
  name: string; // "12/36", "12/48", "Customizado"
  rules: RestRule[];
  shiftConfigs: Record<ShiftType, ShiftConfig>;
}

export interface ScheduleEvent {
  id: string;
  date: Date;
  type: EventType;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  title: string;
  description: string;
  location?: string;
  indicator?: IndicatorType;
  isRest: boolean;
}

export interface Schedule {
  id: string;
  name: string;
  sequence: ShiftType[];
  startDate: Date;
  endDate: Date;
  events: ScheduleEvent[];
  system: ShiftSystem;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleInput {
  sequence: string; // "SD, F, SN, D, F"
  year: number;
  month: number;
  system: ShiftSystem;
  location?: string;
  p1Shifts?: ShiftType[];
  p2Shifts?: ShiftType[];
}

export interface AppSettings {
  defaultLocation?: string;
  shiftSystem: ShiftSystem;
  p1Shifts: ShiftType[];
  p2Shifts: ShiftType[];
  theme: "light" | "dark" | "auto";
}

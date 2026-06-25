/**
 * Contexto global para gerenciar escalas e configurações
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Schedule, AppSettings, ScheduleEvent, ShiftType } from "@/lib/types/schedule";
import { ScheduleGenerator } from "@/lib/services/schedule-generator";

interface ScheduleContextType {
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  settings: AppSettings;
  loading: boolean;
  error: string | null;

  // Actions
  createSchedule: (name: string, sequence: string, year: number, month: number) => Promise<void>;
  loadSchedules: () => Promise<void>;
  setCurrentSchedule: (schedule: Schedule | null) => void;
  deleteSchedule: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

interface State {
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  settings: AppSettings;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SCHEDULES"; payload: Schedule[] }
  | { type: "ADD_SCHEDULE"; payload: Schedule }
  | { type: "DELETE_SCHEDULE"; payload: string }
  | { type: "SET_CURRENT_SCHEDULE"; payload: Schedule | null }
  | { type: "SET_SETTINGS"; payload: AppSettings };

const initialSettings: AppSettings = {
  defaultLocation: "",
  shiftSystem: ScheduleGenerator.getDefaultSystem("12/36"),
  p1Shifts: [],
  p2Shifts: [],
  theme: "auto",
};

const initialState: State = {
  schedules: [],
  currentSchedule: null,
  settings: initialSettings,
  loading: false,
  error: null,
};

function scheduleReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_SCHEDULES":
      return { ...state, schedules: action.payload };
    case "ADD_SCHEDULE":
      return { ...state, schedules: [...state.schedules, action.payload] };
    case "DELETE_SCHEDULE":
      return {
        ...state,
        schedules: state.schedules.filter((s) => s.id !== action.payload),
        currentSchedule: state.currentSchedule?.id === action.payload ? null : state.currentSchedule,
      };
    case "SET_CURRENT_SCHEDULE":
      return { ...state, currentSchedule: action.payload };
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };
    default:
      return state;
  }
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);

  // Carregar dados ao iniciar
  useEffect(() => {
    loadSchedules();
    loadSettings();
  }, []);

  const loadSchedules = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const data = await AsyncStorage.getItem("schedules");
      if (data) {
        const schedules = JSON.parse(data) as Schedule[];
        dispatch({ type: "SET_SCHEDULES", payload: schedules });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar escalas" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem("settings");
      if (data) {
        const settings = JSON.parse(data) as AppSettings;
        dispatch({ type: "SET_SETTINGS", payload: settings });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const createSchedule = async (name: string, sequence: string, year: number, month: number) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const parsed = ScheduleGenerator.parseSequence(sequence);
      const validation = ScheduleGenerator.validateSequence(parsed);

      if (!validation.valid) {
        throw new Error(validation.errors.join(", "));
      }

      const events = ScheduleGenerator.generateSchedule(
        parsed,
        year,
        month,
        state.settings.shiftSystem,
        state.settings.defaultLocation,
        state.settings.p1Shifts,
        state.settings.p2Shifts
      );

      const newSchedule: Schedule = {
        id: Date.now().toString(),
        name,
        sequence: parsed,
        startDate: new Date(year, month - 1, 1),
        endDate: new Date(year, month, 0),
        events,
        system: state.settings.shiftSystem,
        location: state.settings.defaultLocation,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedSchedules = [...state.schedules, newSchedule];
      await AsyncStorage.setItem("schedules", JSON.stringify(updatedSchedules));

      dispatch({ type: "ADD_SCHEDULE", payload: newSchedule });
      dispatch({ type: "SET_CURRENT_SCHEDULE", payload: newSchedule });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar escala";
      dispatch({ type: "SET_ERROR", payload: message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const setCurrentSchedule = (schedule: Schedule | null) => {
    dispatch({ type: "SET_CURRENT_SCHEDULE", payload: schedule });
  };

  const deleteSchedule = async (id: string) => {
    try {
      const updatedSchedules = state.schedules.filter((s) => s.id !== id);
      await AsyncStorage.setItem("schedules", JSON.stringify(updatedSchedules));
      dispatch({ type: "DELETE_SCHEDULE", payload: id });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao deletar escala" });
      throw error;
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = { ...state.settings, ...newSettings };
      await AsyncStorage.setItem("settings", JSON.stringify(updated));
      dispatch({ type: "SET_SETTINGS", payload: updated });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao atualizar configurações" });
      throw error;
    }
  };

  const value: ScheduleContextType = {
    schedules: state.schedules,
    currentSchedule: state.currentSchedule,
    settings: state.settings,
    loading: state.loading,
    error: state.error,
    createSchedule,
    loadSchedules,
    setCurrentSchedule,
    deleteSchedule,
    updateSettings,
    loadSettings,
  };

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule deve ser usado dentro de ScheduleProvider");
  }
  return context;
}

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
  updateEventIndicator: (eventId: string, indicator: "P1" | "P2" | null) => Promise<void>;
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
  | { type: "SET_SETTINGS"; payload: AppSettings }
  | { type: "UPDATE_EVENT_INDICATOR"; payload: { eventId: string; indicator: "P1" | "P2" | null } };

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
    case "UPDATE_EVENT_INDICATOR":
      if (!state.currentSchedule) return state;
      const updatedEvents = state.currentSchedule.events.map((event) =>
        event.id === action.payload.eventId
          ? { ...event, indicator: action.payload.indicator }
          : event
      );
      const updatedSchedule = { ...state.currentSchedule, events: updatedEvents };
      const updatedSchedulesList = state.schedules.map((s) =>
        s.id === updatedSchedule.id ? updatedSchedule : s
      );
      return {
        ...state,
        currentSchedule: updatedSchedule,
        schedules: updatedSchedulesList,
      };
    default:
      return state;
  }
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);

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
        
        // Restaurar currentSchedule (última escala criada)
        if (schedules.length > 0) {
          const lastSchedule = schedules[schedules.length - 1];
          dispatch({ type: "SET_CURRENT_SCHEDULE", payload: lastSchedule });
        }
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
        state.settings.p2Shifts,
        "07:00",
        "19:00",
        "19:00",
        "07:00"
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

  const updateEventIndicator = async (eventId: string, indicator: "P1" | "P2" | null) => {
    try {
      dispatch({ type: "UPDATE_EVENT_INDICATOR", payload: { eventId, indicator } });
      
      // Salvar no AsyncStorage
      const updatedSchedules = state.schedules.map((s) =>
        s.id === state.currentSchedule?.id
          ? {
              ...s,
              events: s.events.map((e) =>
                e.id === eventId ? { ...e, indicator } : e
              ),
            }
          : s
      );
      await AsyncStorage.setItem("schedules", JSON.stringify(updatedSchedules));
    } catch (error) {
      console.error("Erro ao atualizar indicador:", error);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const updatedSchedules = state.schedules.filter((s) => s.id !== id);
      await AsyncStorage.setItem("schedules", JSON.stringify(updatedSchedules));
      dispatch({ type: "DELETE_SCHEDULE", payload: id });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao deletar escala" });
    }
  };

  const updateSettings = async (settings: Partial<AppSettings>) => {
    try {
      const newSettings = { ...state.settings, ...settings };
      await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
      dispatch({ type: "SET_SETTINGS", payload: newSettings });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao atualizar configurações" });
    }
  };

  return (
    <ScheduleContext.Provider
      value={{
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
        updateEventIndicator,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule deve ser usado dentro de ScheduleProvider");
  }
  return context;
}

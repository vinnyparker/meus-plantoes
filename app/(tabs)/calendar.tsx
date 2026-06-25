import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useSchedule } from "@/lib/context/schedule-context";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function CalendarScreen() {
  const router = useRouter();
  const { currentSchedule, loading } = useSchedule();
  const colors = useColors();
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth() + 1);
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const getEventForDate = (day: number) => {
    if (!currentSchedule) return null;

    return currentSchedule.events.find((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() + 1 === displayMonth &&
        eventDate.getFullYear() === displayYear
      );
    });
  };

  const handlePrevMonth = () => {
    if (displayMonth === 1) {
      setDisplayMonth(12);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 12) {
      setDisplayMonth(1);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  const daysInMonth = getDaysInMonth(displayYear, displayMonth);
  const firstDay = getFirstDayOfMonth(displayYear, displayMonth);

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "SD":
        return "#87CEEB";
      case "SN":
        return "#9370DB";
      case "REST":
      case "OFF":
        return "#22C55E";
      default:
        return colors.primary;
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="p-6 items-center justify-center" containerClassName={`bg-background`}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!currentSchedule) {
    return (
      <ScreenContainer className="p-6" containerClassName={`bg-background`}>
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-2xl font-bold text-foreground">Nenhuma Escala</Text>
          <Text className="text-muted text-center">Crie uma nova escala para visualizar o calendário</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6" containerClassName={`bg-background`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Calendário</Text>
            <Text className="text-sm text-muted">{currentSchedule.name}</Text>
          </View>

          {/* Navegação de Mês */}
          <View className="flex-row items-center justify-between bg-surface rounded-lg p-4 border border-border">
            <TouchableOpacity onPress={handlePrevMonth} className="active:opacity-70">
              <Text className="text-2xl text-primary">←</Text>
            </TouchableOpacity>

            <Text className="text-lg font-semibold text-foreground">
              {months[displayMonth - 1]} {displayYear}
            </Text>

            <TouchableOpacity onPress={handleNextMonth} className="active:opacity-70">
              <Text className="text-2xl text-primary">→</Text>
            </TouchableOpacity>
          </View>

          {/* Dias da Semana */}
          <View className="flex-row gap-1">
            {daysOfWeek.map((day) => (
              <View key={day} className="flex-1 items-center py-2">
                <Text className="text-xs font-semibold text-muted">{day}</Text>
              </View>
            ))}
          </View>

          {/* Grid de Dias */}
          <View className="gap-1">
            {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
              <View key={weekIndex} className="flex-row gap-1">
                {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                  const event = day ? getEventForDate(day) : null;

                  return (
                  <TouchableOpacity
                    key={dayIndex}
                    className="flex-1 aspect-square rounded-lg border border-border items-center justify-center bg-surface active:opacity-70"
                    style={{
                      backgroundColor: event ? getEventColor(event.type) : colors.surface,
                      borderColor: event ? getEventColor(event.type) : colors.border,
                    }}
                    onPress={() => {
                      if (event) {
                        router.push(`/(tabs)/event-detail?eventId=${event.id}`);
                      }
                    }}
                  >
                      {day && (
                        <View className="items-center gap-1">
                          <Text
                            className="text-xs font-semibold"
                            style={{
                              color: event && (event.type === "REST" || event.type === "OFF") ? "#000" : colors.foreground,
                            }}
                          >
                            {day}
                          </Text>
                          {event && (
                            <Text className="text-xs" style={{ color: event.type === "REST" || event.type === "OFF" ? "#000" : "#fff" }}>
                              {event.type === "SD"
                                ? "☀️"
                                : event.type === "SN"
                                  ? "🌙"
                                  : event.type === "REST"
                                    ? "💤"
                                    : "🟢"}
                            </Text>
                          )}
                          {event?.indicator && (
                            <Text className="text-xs">{event.indicator === "P1" ? "🔴" : "🔵"}</Text>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Legenda */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-2">
            <Text className="text-sm font-semibold text-foreground">Legenda</Text>
            <View className="gap-1">
              <Text className="text-xs text-muted">☀️ SD - Turno Diurno (07:00-19:00)</Text>
              <Text className="text-xs text-muted">🌙 SN - Turno Noturno (19:00-07:00)</Text>
              <Text className="text-xs text-muted">💤 REST - Dia de Descanso</Text>
              <Text className="text-xs text-muted">🟢 OFF - Dia de Folga</Text>
              <Text className="text-xs text-muted">🔴 P1 | 🔵 P2 - Indicadores</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

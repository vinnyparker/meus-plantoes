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
        return { bg: "#FFFBF0", border: "#FFE8B6", text: "#D4A574" };
      case "SN":
        return { bg: "#F0F4FF", border: "#D4E1FF", text: "#6B8DBE" };
      case "REST":
      case "OFF":
      case "D":
      case "F":
        return { bg: "#F0FFF4", border: "#D4F5E8", text: "#6BA876" };
      default:
        return { bg: colors.surface, border: colors.border, text: colors.primary };
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
                  const eventColors = event ? getEventColor(event.type) : { bg: colors.surface, border: colors.border, text: colors.foreground };

                  return (
                    <TouchableOpacity
                      key={dayIndex}
                      className="flex-1 aspect-square rounded-lg border items-center justify-center active:opacity-70"
                      style={{
                        backgroundColor: eventColors.bg,
                        borderColor: eventColors.border,
                        borderWidth: 1.5,
                      }}
                      onPress={() => {
                        if (event) {
                          router.push(`/(tabs)/event-detail?eventId=${event.id}`);
                        }
                      }}
                    >
                      {day && (
                        <View className="items-center gap-0.5">
                          <Text
                            className="text-xs font-bold"
                            style={{
                              color: eventColors.text,
                            }}
                          >
                            {day}
                          </Text>
                          {event && (
                            <Text className="text-xs" style={{ color: eventColors.text }}>
                              {event.type === "SD"
                                ? "☀️"
                                : event.type === "SN"
                                  ? "🌙"
                                  : ["D", "REST"].includes(event.type as any)
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
              <Text className="text-xs text-muted">💤 D - Dia de Descanso</Text>
              <Text className="text-xs text-muted">🟢 F - Dia de Folga</Text>
              <Text className="text-xs text-muted">🔴 P1 | 🔵 P2 - Indicadores</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

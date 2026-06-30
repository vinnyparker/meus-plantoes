import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useSchedule } from "@/lib/context/schedule-context";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState } from "react";

const TEAL_PRIMARY = "#1DB584";

export default function CalendarScreen() {
  const router = useRouter();
  const { currentSchedule, loading } = useSchedule();
  const colors = useColors();
  
  // Inicializar com o mês da escala gerada, não o mês atual
  const initialMonth = currentSchedule ? new Date(currentSchedule.startDate).getMonth() + 1 : new Date().getMonth() + 1;
  const initialYear = currentSchedule ? new Date(currentSchedule.startDate).getFullYear() : new Date().getFullYear();
  
  const [displayMonth, setDisplayMonth] = useState(initialMonth);
  const [displayYear, setDisplayYear] = useState(initialYear);

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
        return { bg: "#FFF9E6", border: "#FFD700", text: "#D4A574", textBold: "#B8860B" };
      case "SN":
        return { bg: "#E6F2FF", border: "#4A90E2", text: "#6B8DBE", textBold: "#1E40AF" };
      case "REST":
      case "OFF":
      case "D":
      case "F":
        return { bg: "#E6F9F0", border: "#1DB584", text: "#6BA876", textBold: "#0D7A4A" };
      default:
        return { bg: "#F5F5F5", border: "#E0E0E0", text: "#666", textBold: "#333" };
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="p-6 items-center justify-center" containerClassName={`bg-background`}>
        <ActivityIndicator size="large" color={TEAL_PRIMARY} />
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
    <ScreenContainer className="p-0" containerClassName={`bg-background`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1">
          {/* Header */}
          <View className="p-6 gap-2" style={{ backgroundColor: TEAL_PRIMARY }}>
            <Text className="text-white text-2xl font-bold">Calendário</Text>
            <Text className="text-white text-sm opacity-90">{currentSchedule.name}</Text>
          </View>

          <View className="p-6 gap-4">
            {/* Navegação de Mês */}
            <View className="flex-row items-center justify-between bg-white rounded-lg p-4 border border-gray-300">
              <TouchableOpacity onPress={handlePrevMonth} className="active:opacity-70">
                <Text className="text-2xl" style={{ color: TEAL_PRIMARY }}>
                  ←
                </Text>
              </TouchableOpacity>

              <Text className="text-lg font-bold text-foreground">
                {months[displayMonth - 1]} {displayYear}
              </Text>

              <TouchableOpacity onPress={handleNextMonth} className="active:opacity-70">
                <Text className="text-2xl" style={{ color: TEAL_PRIMARY }}>
                  →
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dias da Semana */}
            <View className="flex-row gap-1">
              {daysOfWeek.map((day) => (
                <View key={day} className="flex-1 items-center py-2">
                  <Text className="text-xs font-bold text-gray-600">{day}</Text>
                </View>
              ))}
            </View>

            {/* Grid de Dias */}
            <View className="gap-1">
              {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
                <View key={weekIndex} className="flex-row gap-1">
                  {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                    const event = day ? getEventForDate(day) : null;
                    const eventColors = event
                      ? getEventColor(event.type)
                      : { bg: "#F5F5F5", border: "#E0E0E0", text: "#999", textBold: "#666" };

                    return (
                      <TouchableOpacity
                        key={dayIndex}
                        className="flex-1 aspect-square rounded-lg border-2 items-center justify-center active:opacity-70"
                        style={{
                          backgroundColor: eventColors.bg,
                          borderColor: eventColors.border,
                        }}
                        onPress={() => {
                          if (event) {
                            router.push(`/(tabs)/event-detail?eventId=${event.id}`);
                          }
                        }}
                      >
                        {day && (
                          <View className="items-center gap-1 w-full h-full justify-center">
                            <Text
                              className="text-sm font-bold"
                              style={{
                                color: eventColors.textBold,
                              }}
                            >
                              {day}
                            </Text>
                            {event && (
                              <View className="items-center">
                                <Text className="text-lg" style={{ color: eventColors.text }}>
                                  {event.type === "SD"
                                    ? "☀️"
                                    : event.type === "SN"
                                      ? "🌙"
                                      : ["D", "REST"].includes(event.type as any)
                                        ? "💤"
                                        : "🟢"}
                                </Text>
                                {event?.indicator && (
                                  <Text className="text-xs">{event.indicator === "P1" ? "🔴" : "🔵"}</Text>
                                )}
                              </View>
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
            <View className="bg-white rounded-lg p-4 border border-gray-300 gap-3">
              <Text className="text-sm font-bold text-foreground">Legenda</Text>
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-6 h-6 rounded" style={{ backgroundColor: "#FFF9E6", borderColor: "#FFD700", borderWidth: 2 }} />
                  <Text className="text-xs text-gray-700">☀️ SD - Turno Diurno (07:00-19:00)</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="w-6 h-6 rounded" style={{ backgroundColor: "#E6F2FF", borderColor: "#4A90E2", borderWidth: 2 }} />
                  <Text className="text-xs text-gray-700">🌙 SN - Turno Noturno (19:00-07:00)</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="w-6 h-6 rounded" style={{ backgroundColor: "#E6F9F0", borderColor: "#1DB584", borderWidth: 2 }} />
                  <Text className="text-xs text-gray-700">💤 D - Dia de Descanso / 🟢 F - Folga</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs text-gray-700">🔴 P1 - Primeira Prioridade | 🔵 P2 - Segunda Prioridade</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

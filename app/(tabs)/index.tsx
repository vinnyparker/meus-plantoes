import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useSchedule } from "@/lib/context/schedule-context";
import { useRouter } from "expo-router";

const TEAL_PRIMARY = "#1DB584";

export default function HomeScreen() {
  const router = useRouter();
  const { schedules, currentSchedule, loading } = useSchedule();

  // Obter próximos plantões
  const getUpcomingShifts = () => {
    if (!currentSchedule) return [];

    const today = new Date();
    return currentSchedule.events
      .filter((shift) => new Date(shift.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]}`;
  };

  const getShiftIcon = (type: string) => {
    switch (type) {
      case "SD":
        return "☀️";
      case "SN":
        return "🌙";
      case "D":
      case "REST":
        return "💤";
      case "F":
      case "OFF":
        return "🟢";
      default:
        return "📅";
    }
  };

  const upcomingShifts = getUpcomingShifts();

  if (loading) {
    return (
      <ScreenContainer className="p-6 items-center justify-center" containerClassName={`bg-background`}>
        <ActivityIndicator size="large" color={TEAL_PRIMARY} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0" containerClassName={`bg-background`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1">
          {/* Header */}
          <View className="p-6 gap-2" style={{ backgroundColor: TEAL_PRIMARY }}>
            <Text className="text-white text-3xl font-bold">Meus Plantões</Text>
            <Text className="text-white text-sm opacity-90">Portal da Enfermagem</Text>
          </View>

          <View className="p-6 gap-6">
            {/* Próximos Plantões */}
            <View className="gap-3">
              <Text className="text-lg font-bold text-foreground">Próximos Plantões</Text>

              {loading ? (
                <ActivityIndicator size="small" color={TEAL_PRIMARY} />
              ) : upcomingShifts.length > 0 ? (
                <View className="gap-2">
                  {upcomingShifts.map((shift) => (
                    <TouchableOpacity
                      key={shift.id}
                      className="bg-white rounded-lg p-4 border border-gray-300 active:opacity-70"
                      onPress={() => router.push(`/(tabs)/event-detail?eventId=${shift.id}`)}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-xs text-gray-600">{formatDate(shift.date)}</Text>
                          <Text className="text-base font-bold text-foreground mt-1">{shift.title}</Text>
                          <Text className="text-xs text-gray-500 mt-1">
                            {shift.startTime} - {shift.endTime}
                          </Text>
                        </View>
                        <Text className="text-3xl">{getShiftIcon(shift.type)}</Text>
                      </View>
                      {shift.indicator && (
                        <View className="mt-2 flex-row gap-1">
                          <Text className="text-xs font-semibold" style={{ color: TEAL_PRIMARY }}>
                            {shift.indicator === "P1" ? "🔴 P1" : "🔵 P2"}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                  <Text className="text-center text-gray-600">Nenhum plantão agendado</Text>
                </View>
              )}
            </View>

            {/* Botões de Ação */}
            <View className="gap-3">
              <TouchableOpacity
                className="rounded-lg py-4 items-center active:opacity-80"
                style={{ backgroundColor: TEAL_PRIMARY }}
                onPress={() => router.push("/(tabs)/generator")}
              >
                <Text className="text-white font-bold text-base">+ Nova Escala</Text>
              </TouchableOpacity>

              {schedules.length > 0 && (
                <TouchableOpacity
                  className="rounded-lg py-4 items-center border-2 active:opacity-70"
                  style={{ borderColor: TEAL_PRIMARY }}
                  onPress={() => router.push("/(tabs)/calendar")}
                >
                  <Text className="font-bold text-base" style={{ color: TEAL_PRIMARY }}>
                    📅 Minhas Escalas
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Info */}
            <View className="bg-gray-50 rounded-lg p-4 border border-gray-300 gap-2">
              <Text className="text-xs text-gray-700 leading-relaxed">
                💡 Gere escalas de plantão automaticamente com regras de descanso aplicadas. Exporte para Google Calendar e sincronize com Google Drive.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

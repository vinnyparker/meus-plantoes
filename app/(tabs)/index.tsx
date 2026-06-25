import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useSchedule } from "@/lib/context/schedule-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const router = useRouter();
  const { schedules, currentSchedule, loading } = useSchedule();
  const colors = useColors();

  // Obter próximos plantões
  const getUpcomingShifts = () => {
    if (!currentSchedule) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return currentSchedule.events
      .filter((event) => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .slice(0, 5);
  };

  const upcomingShifts = getUpcomingShifts();

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  };

  return (
    <ScreenContainer className="p-6" containerClassName={`bg-background`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-8">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-4xl font-bold text-foreground">Meus Plantões</Text>
            <Text className="text-base text-muted text-center">Portal da Enfermagem</Text>
          </View>

          {/* Próximos Plantões */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Próximos Plantões</Text>

            {loading ? (
              <View className="items-center justify-center py-8">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : upcomingShifts.length > 0 ? (
              <View className="gap-2">
                {upcomingShifts.map((shift) => (
                  <TouchableOpacity
                    key={shift.id}
                    className="bg-surface rounded-2xl p-4 border border-border active:opacity-70"
                    onPress={() => router.push(`/(tabs)/event-detail?eventId=${shift.id}`)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-sm text-muted">{formatDate(shift.date)}</Text>
                        <Text className="text-base font-semibold text-foreground mt-1">{shift.title}</Text>
                        {shift.location && <Text className="text-xs text-muted mt-1">📍 {shift.location}</Text>}
                      </View>
                      {shift.indicator && (
                        <Text className="text-xl ml-2">{shift.indicator === "P1" ? "🔴" : "🔵"}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="bg-surface rounded-2xl p-6 items-center justify-center border border-border">
                <Text className="text-muted text-center">Nenhum plantão agendado</Text>
              </View>
            )}
          </View>

          {/* Botões de Ação */}
          <View className="gap-3">
            <TouchableOpacity
              className="bg-primary rounded-full py-3 items-center active:opacity-80"
              onPress={() => router.push("/(tabs)/generator")}
            >
              <Text className="text-background font-semibold text-base">+ Nova Escala</Text>
            </TouchableOpacity>

            {schedules.length > 0 && (
            <TouchableOpacity
              className="bg-surface rounded-full py-3 items-center border border-primary active:opacity-70"
              onPress={() => router.push("/(tabs)/calendar")}
            >
                <Text className="text-primary font-semibold text-base">Minhas Escalas</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Info Card */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted leading-relaxed">
              Gere escalas de plantão automaticamente com regras de descanso aplicadas. Exporte para Google Calendar e
              sincronize com Google Drive.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

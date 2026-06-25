import { ScrollView, Text, View, TouchableOpacity, Alert, Share, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSchedule } from "@/lib/context/schedule-context";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { IcsExporter } from "@/lib/services/ics-exporter";
import { ScheduleEvent } from "@/lib/types/schedule";
import * as FileSystem from "expo-file-system/legacy";

export default function EventDetailScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const { currentSchedule } = useSchedule();
  const colors = useColors();
  const [exporting, setExporting] = useState(false);

  const event = currentSchedule?.events.find((e) => e.id === eventId) as ScheduleEvent | undefined;

  if (!event) {
    return (
      <ScreenContainer className="p-6 items-center justify-center" containerClassName={`bg-background`}>
        <View className="items-center gap-4">
          <Text className="text-2xl font-bold text-foreground">Evento não encontrado</Text>
          <TouchableOpacity
            className="bg-primary rounded-full px-6 py-3 active:opacity-80"
            onPress={() => router.back()}
          >
            <Text className="text-background font-semibold">Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      const icsContent = IcsExporter.exportEvent(event, currentSchedule?.location);
      const filename = IcsExporter.generateFilename(`evento_${event.type}`);
      const filepath = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(filepath, icsContent);

      // Compartilhar arquivo
      await Share.share({
        url: filepath,
        title: `Exportar ${event.title}`,
        message: `Escala de plantão: ${event.title}`,
      });
    } catch (error) {
      Alert.alert("Erro", "Erro ao exportar evento");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Deletar evento", "Tem certeza que deseja deletar este evento?", [
      { text: "Cancelar", onPress: () => {} },
      {
        text: "Deletar",
        onPress: () => {
          // TODO: Implementar deleção
          Alert.alert("Sucesso", "Evento deletado");
          router.back();
        },
        style: "destructive",
      },
    ]);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "SD":
        return "☀️";
      case "SN":
        return "🌙";
      case "REST":
        return "💤";
      case "OFF":
        return "🟢";
      default:
        return "📅";
    }
  };

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

  return (
    <ScreenContainer className="p-6" containerClassName={`bg-background`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="active:opacity-70">
              <Text className="text-2xl text-primary">←</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Detalhes</Text>
            <View className="w-6" />
          </View>

          {/* Evento Card */}
          <View
            className="rounded-2xl p-6 gap-4 border-2"
            style={{
              backgroundColor: getEventColor(event.type),
              borderColor: getEventColor(event.type),
            }}
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-4xl">{getEventIcon(event.type)}</Text>
              <View className="flex-1">
                <Text className="text-sm text-muted" style={{ color: event.type === "REST" || event.type === "OFF" ? "#666" : "#fff" }}>
                  {event.type === "SD"
                    ? "Turno Diurno"
                    : event.type === "SN"
                      ? "Turno Noturno"
                      : event.type === "REST"
                        ? "Dia de Descanso"
                        : "Dia de Folga"}
                </Text>
                <Text className="text-2xl font-bold" style={{ color: event.type === "REST" || event.type === "OFF" ? "#000" : "#fff" }}>
                  {event.title}
                </Text>
              </View>
              {event.indicator && (
                <Text className="text-3xl">{event.indicator === "P1" ? "🔴" : "🔵"}</Text>
              )}
            </View>
          </View>

          {/* Informações */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            <View className="gap-2">
              <Text className="text-xs text-muted">Data</Text>
              <Text className="text-base font-semibold text-foreground">{formatDate(event.date)}</Text>
            </View>

            <View className="h-px bg-border" />

            <View className="gap-2">
              <Text className="text-xs text-muted">Horário</Text>
              <Text className="text-base font-semibold text-foreground">
                {event.startTime} - {event.endTime}
              </Text>
            </View>

            {event.location && (
              <>
                <View className="h-px bg-border" />
                <View className="gap-2">
                  <Text className="text-xs text-muted">Local</Text>
                  <Text className="text-base font-semibold text-foreground">📍 {event.location}</Text>
                </View>
              </>
            )}

            <View className="h-px bg-border" />

            <View className="gap-2">
              <Text className="text-xs text-muted">Descrição</Text>
              <Text className="text-base text-foreground">{event.description}</Text>
            </View>

            {event.indicator && (
              <>
                <View className="h-px bg-border" />
                <View className="gap-2">
                  <Text className="text-xs text-muted">Indicador</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {event.indicator === "P1" ? "🔴 P1 - Primeira Prioridade" : "🔵 P2 - Segunda Prioridade"}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Ações */}
          <View className="gap-3">
            <TouchableOpacity
              className="bg-primary rounded-full py-4 items-center active:opacity-80 flex-row justify-center gap-2"
              onPress={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text className="text-background font-semibold text-base">📤 Exportar .ics</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-surface rounded-full py-4 items-center border border-border active:opacity-70"
              onPress={handleDelete}
            >
              <Text className="text-error font-semibold text-base">🗑️ Deletar</Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-xs text-muted leading-relaxed">
              💡 Dica: Você pode exportar este evento como arquivo .ics e importar em Google Calendar, Outlook ou Apple Calendar.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

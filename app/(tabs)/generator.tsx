import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useSchedule } from "@/lib/context/schedule-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { ScheduleGenerator } from "@/lib/services/schedule-generator";

export default function GeneratorScreen() {
  const router = useRouter();
  const { createSchedule, loading } = useSchedule();
  const colors = useColors();

  const [sequence, setSequence] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [scheduleName, setScheduleName] = useState("");
  const [systemType, setSystemType] = useState<"12/36" | "12/48">("12/36");

  const handleGenerate = async () => {
    if (!sequence.trim()) {
      Alert.alert("Erro", "Por favor, insira uma sequência de turnos");
      return;
    }

    if (!scheduleName.trim()) {
      Alert.alert("Erro", "Por favor, insira um nome para a escala");
      return;
    }

    try {
      const parsed = ScheduleGenerator.parseSequence(sequence);
      const validation = ScheduleGenerator.validateSequence(parsed);

      if (!validation.valid) {
        Alert.alert("Erro", validation.errors.join("\n"));
        return;
      }

      await createSchedule(scheduleName, sequence, selectedYear, selectedMonth);

      Alert.alert("Sucesso", "Escala gerada com sucesso!");
      router.navigate("calendar" as any);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao gerar escala";
      Alert.alert("Erro", message);
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

  return (
    <ScreenContainer className="p-6" containerClassName={`bg-background`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Nova Escala</Text>
            <Text className="text-sm text-muted">Gere sua escala de plantão automaticamente</Text>
          </View>

          {/* Nome da Escala */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Nome da Escala</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="ex: Junho 2026"
              placeholderTextColor={colors.muted}
              value={scheduleName}
              onChangeText={setScheduleName}
              editable={!loading}
            />
          </View>

          {/* Sequência de Turnos */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Sequência de Turnos</Text>
            <Text className="text-xs text-muted">Use: SD (dia), SN (noite), F (folga), D (descanso)</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="ex: SD, F, SN, D, F"
              placeholderTextColor={colors.muted}
              value={sequence}
              onChangeText={setSequence}
              editable={!loading}
              multiline
            />
          </View>

          {/* Sistema de Turno */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Sistema de Turno</Text>
            <View className="flex-row gap-2">
              {(["12/36", "12/48"] as const).map((system) => (
                <TouchableOpacity
                  key={system}
                  className={`flex-1 py-2 rounded-lg border ${
                    systemType === system ? "bg-primary border-primary" : "bg-surface border-border"
                  }`}
                  onPress={() => setSystemType(system)}
                  disabled={loading}
                >
                  <Text
                    className={`text-center font-semibold ${
                      systemType === system ? "text-background" : "text-foreground"
                    }`}
                  >
                    {system}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Mês e Ano */}
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Mês</Text>
              <View className="flex-row gap-2 flex-wrap">
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    className={`px-3 py-2 rounded-lg border ${
                      selectedMonth === index + 1 ? "bg-primary border-primary" : "bg-surface border-border"
                    }`}
                    onPress={() => setSelectedMonth(index + 1)}
                    disabled={loading}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selectedMonth === index + 1 ? "text-background" : "text-foreground"
                      }`}
                    >
                      {month.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Ano</Text>
              <View className="flex-row gap-2">
                {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
                  <TouchableOpacity
                    key={year}
                    className={`flex-1 py-2 rounded-lg border ${
                      selectedYear === year ? "bg-primary border-primary" : "bg-surface border-border"
                    }`}
                    onPress={() => setSelectedYear(year)}
                    disabled={loading}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        selectedYear === year ? "text-background" : "text-foreground"
                      }`}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Botão Gerar */}
          <TouchableOpacity
            className="bg-primary rounded-full py-4 items-center active:opacity-80 mt-4"
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-background font-semibold text-base">Gerar Escala</Text>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-xs text-muted leading-relaxed">
              💡 Dica: A sequência será repetida até preencher o mês. As regras de descanso serão aplicadas
              automaticamente após cada turno.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

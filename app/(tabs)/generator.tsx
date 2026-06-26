import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useSchedule } from "@/lib/context/schedule-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { ShiftType } from "@/lib/types/schedule";

type SequenceItem = ShiftType | "F";

export default function GeneratorScreen() {
  const router = useRouter();
  const { createSchedule } = useSchedule();
  const colors = useColors();
  const [loading, setLoading] = useState(false);

  const [scheduleName, setScheduleName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState("12/36");

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

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  const shiftOptions: Array<{ type: SequenceItem; label: string; color: string; bgColor: string }> = [
    { type: "SD", label: "☀️ SD", color: "#D4A574", bgColor: "#FFFBF0" },
    { type: "SN", label: "🌙 SN", color: "#6B8DBE", bgColor: "#F0F4FF" },
    { type: "D", label: "💤 D", color: "#6BA876", bgColor: "#F0FFF4" },
    { type: "F", label: "🟢 F", color: "#6BA876", bgColor: "#F0FFF4" },
  ];

  const addToSequence = (shift: SequenceItem) => {
    setSequence([...sequence, shift]);
  };

  const removeFromSequence = (index: number) => {
    setSequence(sequence.filter((_, i) => i !== index));
  };

  const clearSequence = () => {
    setSequence([]);
  };

  const repeatPattern = (pattern: string) => {
    const parts = pattern.split(",").map((p) => p.trim().toUpperCase());
    const validParts = parts.filter((p) => ["SD", "SN", "D", "F"].includes(p)) as SequenceItem[];
    setSequence(validParts);
  };

  const handleGenerateSchedule = async () => {
    try {
      if (sequence.length === 0) {
        Alert.alert("Erro", "Adicione pelo menos um turno à sequência");
        return;
      }

      setLoading(true);

      const name = scheduleName || `Escala ${months[selectedMonth - 1]}/${selectedYear}`;
      const sequenceString = sequence.join(",");
      await createSchedule(name, sequenceString, selectedYear, selectedMonth);

      Alert.alert("Sucesso", "Escala gerada com sucesso!");
      router.navigate("calendar" as any);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao gerar escala";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
    }
  };

  const getShiftColor = (shift: SequenceItem) => {
    const option = shiftOptions.find((o) => o.type === shift);
    return option ? { color: option.color, bgColor: option.bgColor } : { color: colors.primary, bgColor: colors.surface };
  };

  return (
    <ScreenContainer className="p-6" containerClassName={`bg-background`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header Card */}
          <View className="bg-teal-500 rounded-2xl p-5 gap-2">
            <Text className="text-white text-xl font-bold">Nova Escala</Text>
            <Text className="text-white text-sm opacity-90">Monte sua escala de plantões automaticamente</Text>
          </View>

          {/* Nome da Escala */}
          <View className="gap-2">
            <Text className="text-xs font-semibold text-foreground uppercase">Nome da Escala (Opcional)</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="ex: Junho"
              placeholderTextColor={colors.muted}
              value={scheduleName}
              onChangeText={setScheduleName}
            />
          </View>

          {/* Mês e Ano */}
          <View className="gap-2">
            <Text className="text-xs font-semibold text-foreground uppercase">Mês e Ano</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Mês</Text>
                <Pressable
                  className="bg-surface border border-border rounded-lg px-4 py-3"
                  onPress={() => {
                    Alert.alert("Selecione o Mês", "", [
                      ...months.map((month, index) => ({
                        text: month,
                        onPress: () => setSelectedMonth(index + 1),
                      })),
                    ]);
                  }}
                >
                  <Text className="text-foreground font-semibold">{months[selectedMonth - 1]}</Text>
                </Pressable>
              </View>

              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Ano</Text>
                <Pressable
                  className="bg-surface border border-border rounded-lg px-4 py-3"
                  onPress={() => {
                    Alert.alert("Selecione o Ano", "", [
                      ...years.map((year) => ({
                        text: String(year),
                        onPress: () => setSelectedYear(year),
                      })),
                    ]);
                  }}
                >
                  <Text className="text-foreground font-semibold">{selectedYear}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Sistema de Turno */}
          <View className="gap-2">
            <Text className="text-xs font-semibold text-foreground uppercase">Sistema de Turno</Text>
            <View className="flex-row gap-2">
              {["12/36", "12/48"].map((system) => (
                <TouchableOpacity
                  key={system}
                  className={`flex-1 py-3 rounded-lg border-2 items-center ${
                    selectedSystem === system ? "bg-teal-100 border-teal-500" : "bg-surface border-border"
                  }`}
                  onPress={() => setSelectedSystem(system)}
                >
                  <Text className={`font-semibold ${selectedSystem === system ? "text-teal-700" : "text-foreground"}`}>
                    {system}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sequência de Plantões */}
          <View className="gap-3">
            <Text className="text-xs font-semibold text-foreground uppercase">Sequência de Plantões</Text>

            {/* Botões para adicionar turnos */}
            <View className="gap-2">
              <View className="flex-row gap-2 flex-wrap">
                {shiftOptions.map((option) => (
                  <TouchableOpacity
                    key={option.type}
                    className="px-4 py-2 rounded-full border-2 active:opacity-70"
                    style={{
                      backgroundColor: option.bgColor,
                      borderColor: option.color,
                    }}
                    onPress={() => addToSequence(option.type)}
                  >
                    <Text className="font-semibold" style={{ color: option.color }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Botão Limpar */}
              {sequence.length > 0 && (
                <TouchableOpacity
                  className="py-2 px-4 rounded-full border border-error items-center"
                  onPress={clearSequence}
                >
                  <Text className="text-error font-semibold text-sm">Limpar</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sequência Escolhida */}
            {sequence.length > 0 && (
              <View className="bg-surface rounded-lg p-4 border border-border gap-2">
                <Text className="text-xs text-muted">Sequência escolhida:</Text>
                <View className="flex-row gap-2 flex-wrap">
                  {sequence.map((shift, index) => {
                    const colors = getShiftColor(shift);
                    return (
                      <TouchableOpacity
                        key={index}
                        className="px-3 py-1 rounded-full border flex-row items-center gap-1"
                        style={{
                          backgroundColor: colors.bgColor,
                          borderColor: colors.color,
                        }}
                        onPress={() => removeFromSequence(index)}
                      >
                        <Text className="font-semibold text-sm" style={{ color: colors.color }}>
                          {shift}
                        </Text>
                        <Text style={{ color: colors.color }}>×</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Padrão Sugerido */}
            <View className="bg-surface rounded-lg p-4 border border-border gap-2">
              <Text className="text-xs text-muted">Padrão: SD - F - SN - D - F (repete no mês)</Text>
              <TouchableOpacity
                className="py-2 px-4 rounded-lg bg-teal-100 border border-teal-500 items-center"
                onPress={() => repeatPattern("SD, F, SN, D, F")}
              >
                <Text className="text-teal-700 font-semibold text-sm">Usar Padrão</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão Gerar */}
          <TouchableOpacity
            className="bg-teal-500 rounded-full py-4 items-center active:opacity-80 flex-row justify-center gap-2 mt-4"
            onPress={handleGenerateSchedule}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text className="text-white font-bold text-base">✨ Gerar Escala</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-2">
            <Text className="text-xs text-muted leading-relaxed">
              💡 Dica: Clique nos turnos para adicioná-los à sequência. Clique no "×" para remover. A escala será gerada
              repetindo este padrão durante todo o mês.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

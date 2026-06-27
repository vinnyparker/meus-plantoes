import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ScreenContainer } from "@/components/screen-container";
import { useSchedule } from "@/lib/context/schedule-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ShiftType } from "@/lib/types/schedule";

type SequenceItem = ShiftType | "F";

const TEAL_PRIMARY = "#1DB584";

export default function GeneratorScreen() {
  const router = useRouter();
  const { createSchedule } = useSchedule();
  const [loading, setLoading] = useState(false);

  const [scheduleName, setScheduleName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("6");
  const [selectedYear, setSelectedYear] = useState("2026");
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

      const monthNum = parseInt(selectedMonth);
      const yearNum = parseInt(selectedYear);
      const name = scheduleName || `Escala ${months[monthNum - 1]}/${yearNum}`;
      const sequenceString = sequence.join(",");
      await createSchedule(name, sequenceString, yearNum, monthNum);

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
    return option ? { color: option.color, bgColor: option.bgColor } : { color: TEAL_PRIMARY, bgColor: "#F0F0F0" };
  };

  return (
    <ScreenContainer className="p-0" containerClassName={`bg-background`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1">
          {/* Header Card */}
          <View className="p-6 gap-2" style={{ backgroundColor: TEAL_PRIMARY }}>
            <Text className="text-white text-2xl font-bold">Nova Escala</Text>
            <Text className="text-white text-sm opacity-90">Monte sua escala de plantões automaticamente</Text>
          </View>

          <View className="p-6 gap-6">
            {/* Nome da Escala */}
            <View className="gap-2">
              <Text className="text-xs font-bold text-foreground uppercase">Nome da Escala (Opcional)</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-foreground text-base"
                placeholder="ex: Junho"
                placeholderTextColor="#999"
                value={scheduleName}
                onChangeText={setScheduleName}
              />
            </View>

            {/* Mês e Ano */}
            <View className="gap-3">
              <Text className="text-xs font-bold text-foreground uppercase">Mês e Ano</Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs text-gray-600 mb-2 font-semibold">Mês</Text>
                  <View className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={selectedMonth}
                      onValueChange={(itemValue: string) => setSelectedMonth(itemValue)}
                      style={{ height: 50 }}
                    >
                      {months.map((month, index) => (
                        <Picker.Item key={index} label={month} value={String(index + 1)} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-xs text-gray-600 mb-2 font-semibold">Ano</Text>
                  <View className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={selectedYear}
                      onValueChange={(itemValue: string) => setSelectedYear(itemValue)}
                      style={{ height: 50 }}
                    >
                      {years.map((year) => (
                        <Picker.Item key={year} label={String(year)} value={String(year)} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            {/* Sistema de Turno */}
            <View className="gap-3">
              <Text className="text-xs font-bold text-foreground uppercase">Sistema de Turno</Text>
              <View className="flex-row gap-3">
                {["12/36", "12/48"].map((system) => (
                  <TouchableOpacity
                    key={system}
                    className={`flex-1 py-4 rounded-lg border-2 items-center`}
                    style={{
                      backgroundColor: selectedSystem === system ? TEAL_PRIMARY : "#F5F5F5",
                      borderColor: selectedSystem === system ? TEAL_PRIMARY : "#E0E0E0",
                    }}
                    onPress={() => setSelectedSystem(system)}
                  >
                    <Text
                      className={`font-bold text-base ${selectedSystem === system ? "text-white" : "text-foreground"}`}
                    >
                      {system}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sequência de Plantões */}
            <View className="gap-4">
              <Text className="text-xs font-bold text-foreground uppercase">Sequência de Plantões</Text>

              {/* Botões para adicionar turnos */}
              <View className="gap-3">
                <View className="flex-row gap-2 flex-wrap">
                  {shiftOptions.map((option) => (
                    <TouchableOpacity
                      key={option.type}
                      className="px-5 py-3 rounded-full border-2 active:opacity-70"
                      style={{
                        backgroundColor: option.bgColor,
                        borderColor: option.color,
                      }}
                      onPress={() => addToSequence(option.type)}
                    >
                      <Text className="font-bold text-base" style={{ color: option.color }}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Botão Limpar */}
                {sequence.length > 0 && (
                  <TouchableOpacity
                    className="py-3 px-4 rounded-lg border-2 border-red-500 items-center"
                    onPress={clearSequence}
                  >
                    <Text className="text-red-500 font-bold text-base">Limpar Sequência</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Sequência Escolhida */}
              {sequence.length > 0 && (
                <View className="bg-gray-50 rounded-lg p-4 border border-gray-200 gap-3">
                  <Text className="text-xs text-gray-600 font-semibold">Sequência escolhida:</Text>
                  <View className="flex-row gap-2 flex-wrap">
                    {sequence.map((shift, index) => {
                      const colors = getShiftColor(shift);
                      return (
                        <TouchableOpacity
                          key={index}
                          className="px-4 py-2 rounded-full border-2 flex-row items-center gap-2"
                          style={{
                            backgroundColor: colors.bgColor,
                            borderColor: colors.color,
                          }}
                          onPress={() => removeFromSequence(index)}
                        >
                          <Text className="font-bold text-base" style={{ color: colors.color }}>
                            {shift}
                          </Text>
                          <Text className="font-bold text-lg" style={{ color: colors.color }}>
                            ×
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Padrão Sugerido */}
              <View className="bg-gray-50 rounded-lg p-4 border border-gray-200 gap-3">
                <Text className="text-xs text-gray-600 font-semibold">Padrão: SD - F - SN - D - F (repete no mês)</Text>
                <TouchableOpacity
                  className="py-3 px-4 rounded-lg items-center"
                  style={{ backgroundColor: TEAL_PRIMARY }}
                  onPress={() => repeatPattern("SD, F, SN, D, F")}
                >
                  <Text className="text-white font-bold text-base">Usar Padrão</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão Gerar */}
            <TouchableOpacity
              className="py-5 rounded-lg items-center justify-center flex-row gap-2 mt-4"
              style={{ backgroundColor: TEAL_PRIMARY }}
              onPress={handleGenerateSchedule}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text className="text-white font-bold text-lg">✨ Gerar Escala</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Info */}
            <View className="bg-gray-50 rounded-lg p-4 border border-gray-200 gap-2">
              <Text className="text-xs text-gray-600 leading-relaxed">
                💡 Dica: Clique nos turnos para adicioná-los à sequência. Clique no "×" para remover. A escala será gerada
                repetindo este padrão durante todo o mês.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

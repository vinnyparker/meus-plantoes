import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
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
  const [generateUntilDecember, setGenerateUntilDecember] = useState(false);

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
    { type: "F", label: "🟢 F", color: "#1DB584", bgColor: "#E6F9F0" },
  ];

  const handleAddShift = (shift: SequenceItem) => {
    setSequence([...sequence, shift]);
  };

  const handleRemoveShift = (index: number) => {
    setSequence(sequence.filter((_, i) => i !== index));
  };

  const handleUsePattern = () => {
    setSequence(["SD", "F", "SN", "D", "F"]);
  };

  const handleClearSequence = () => {
    setSequence([]);
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
      const sequenceString = sequence.join(",");

      if (generateUntilDecember) {
        let currentMonth = monthNum;
        let currentYear = yearNum;

        while (currentMonth <= 12 && currentYear === yearNum) {
          const monthName = months[currentMonth - 1];
          const name = scheduleName || `Escala ${monthName}/${currentYear}`;
          await createSchedule(name, sequenceString, currentYear, currentMonth);
          currentMonth++;
        }
      } else {
        const name = scheduleName || `Escala ${months[monthNum - 1]}/${yearNum}`;
        await createSchedule(name, sequenceString, yearNum, monthNum);
      }

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
            <View className="gap-3">
              <Text className="text-xs font-bold text-foreground uppercase">Nome da Escala (Opcional)</Text>
              <TextInput
                placeholder="ex: Junho"
                value={scheduleName}
                onChangeText={setScheduleName}
                className="border border-gray-300 rounded-lg px-4 py-3 text-foreground bg-white"
                placeholderTextColor="#999"
              />
            </View>

            {/* Mês e Ano */}
            <View className="gap-3">
              <Text className="text-xs font-bold text-foreground uppercase">Mês e Ano</Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-2">Mês</Text>
                  <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                    <Picker selectedValue={selectedMonth} onValueChange={setSelectedMonth}>
                      {months.map((month, index) => (
                        <Picker.Item key={month} label={month} value={(index + 1).toString()} />
                      ))}
                    </Picker>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-2">Ano</Text>
                  <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                    <Picker selectedValue={selectedYear} onValueChange={setSelectedYear}>
                      {years.map((year) => (
                        <Picker.Item key={year} label={year.toString()} value={year.toString()} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            {/* Dica de Uso */}
            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 gap-2">
              <Text className="text-xs font-bold text-yellow-900">💡 Como usar:</Text>
              <Text className="text-xs text-yellow-800">
                D = Descanso • F = Folga • Toque em um token para removê-lo
              </Text>
              <Text className="text-xs text-yellow-800 font-semibold mt-1">
                Padrão: SD - F - SN - D - F (repete no mês)
              </Text>
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
                      onPress={() => handleAddShift(option.type)}
                    >
                      <Text className="font-bold text-base" style={{ color: option.color }}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sequência Escolhida */}
              {sequence.length > 0 && (
                <View className="bg-white rounded-lg p-4 border border-gray-200 gap-3">
                  <View className="flex-row gap-2 flex-wrap">
                    {sequence.map((item, index) => {
                      const colors = getShiftColor(item);
                      return (
                        <TouchableOpacity
                          key={index}
                          className="px-4 py-2 rounded-full border-2 flex-row items-center gap-2 active:opacity-70"
                          style={{
                            backgroundColor: colors.bgColor,
                            borderColor: colors.color,
                          }}
                          onPress={() => handleRemoveShift(index)}
                        >
                          <Text className="font-bold" style={{ color: colors.color }}>
                            {item}
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

              {/* Botões de Ação */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-lg items-center active:opacity-70"
                  style={{ backgroundColor: "#FFF9E6", borderWidth: 2, borderColor: "#FFD700" }}
                  onPress={handleUsePattern}
                >
                  <Text className="font-bold text-base" style={{ color: "#B8860B" }}>
                    Usar Padrão
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 py-3 rounded-lg items-center active:opacity-70"
                  style={{ backgroundColor: "#FFE6E6", borderWidth: 2, borderColor: "#FF6B6B" }}
                  onPress={handleClearSequence}
                >
                  <Text className="font-bold text-base" style={{ color: "#FF6B6B" }}>
                    Limpar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Checkbox Gerar até Dezembro */}
            <View className="bg-blue-50 rounded-lg p-4 flex-row items-center justify-between border border-blue-200">
              <View className="flex-1 gap-1">
                <Text className="text-sm font-bold text-blue-900">Gerar até Dezembro</Text>
                <Text className="text-xs text-blue-800">
                  Gera a sequência de {months[parseInt(selectedMonth) - 1]} até dezembro
                </Text>
              </View>
              <Switch
                value={generateUntilDecember}
                onValueChange={setGenerateUntilDecember}
                trackColor={{ false: "#ccc", true: TEAL_PRIMARY }}
                thumbColor={generateUntilDecember ? TEAL_PRIMARY : "#f4f3f4"}
              />
            </View>

            {/* Botão Gerar */}
            <TouchableOpacity
              className="py-4 rounded-lg items-center active:opacity-70"
              style={{ backgroundColor: TEAL_PRIMARY }}
              onPress={handleGenerateSchedule}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-bold">✨ Gerar Escala</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

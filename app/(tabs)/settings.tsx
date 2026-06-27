import { ScrollView, Text, View, TouchableOpacity, TextInput, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useSchedule } from "@/lib/context/schedule-context";
import { useState } from "react";
import { ShiftType } from "@/lib/types/schedule";

const TEAL_PRIMARY = "#1DB584";

type SequenceItem = ShiftType | "F";

export default function SettingsScreen() {
  const { settings, updateSettings } = useSchedule();

  const [location, setLocation] = useState(settings.defaultLocation || "");
  const [p1Enabled, setP1Enabled] = useState(settings.p1Shifts.length > 0);
  const [p2Enabled, setP2Enabled] = useState(settings.p2Shifts.length > 0);
  const [p1Shifts, setP1Shifts] = useState<ShiftType[]>(settings.p1Shifts);
  const [p2Shifts, setP2Shifts] = useState<ShiftType[]>(settings.p2Shifts);

  const shiftOptions: ShiftType[] = ["SD", "SN"];

  const handleToggleShift = (shift: ShiftType, type: "P1" | "P2") => {
    if (type === "P1") {
      if (p1Shifts.includes(shift)) {
        setP1Shifts(p1Shifts.filter((s) => s !== shift));
      } else {
        setP1Shifts([...p1Shifts, shift]);
      }
    } else {
      if (p2Shifts.includes(shift)) {
        setP2Shifts(p2Shifts.filter((s) => s !== shift));
      } else {
        setP2Shifts([...p2Shifts, shift]);
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        defaultLocation: location,
        p1Shifts: p1Enabled ? p1Shifts : [],
        p2Shifts: p2Enabled ? p2Shifts : [],
      });

      Alert.alert("Sucesso", "Configurações salvas com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar configurações");
    }
  };

  return (
    <ScreenContainer className="p-0" containerClassName={`bg-background`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1">
          {/* Header */}
          <View className="p-6 gap-2" style={{ backgroundColor: TEAL_PRIMARY }}>
            <Text className="text-white text-2xl font-bold">Configurações</Text>
            <Text className="text-white text-sm opacity-90">Personalize seu app</Text>
          </View>

          <View className="p-6 gap-6">
            {/* Local Padrão */}
            <View className="gap-2">
              <Text className="text-sm font-bold text-foreground uppercase">Local Padrão de Trabalho</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-foreground"
                placeholder="ex: Hospital Central"
                placeholderTextColor="#999"
                value={location}
                onChangeText={setLocation}
              />
              <Text className="text-xs text-gray-600">Este local será adicionado a todos os eventos</Text>
            </View>

            {/* P1 Configuration */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-foreground uppercase">Indicador P1 🔴</Text>
                <Switch value={p1Enabled} onValueChange={setP1Enabled} trackColor={{ false: "#ccc", true: TEAL_PRIMARY }} />
              </View>

              {p1Enabled && (
                <View className="gap-2">
                  <Text className="text-xs text-gray-600">Selecione quais turnos são P1:</Text>
                  <View className="gap-2">
                    {shiftOptions.map((shift) => (
                      <TouchableOpacity
                        key={shift}
                        className={`p-3 rounded-lg border-2 flex-row items-center justify-between`}
                        style={{
                          backgroundColor: p1Shifts.includes(shift) ? TEAL_PRIMARY : "#F5F5F5",
                          borderColor: p1Shifts.includes(shift) ? TEAL_PRIMARY : "#E0E0E0",
                        }}
                        onPress={() => handleToggleShift(shift, "P1")}
                      >
                        <Text
                          className={`font-semibold ${p1Shifts.includes(shift) ? "text-white" : "text-foreground"}`}
                        >
                          {shift}
                        </Text>
                        <View
                          className={`w-5 h-5 rounded border-2 ${
                            p1Shifts.includes(shift) ? "bg-white border-white" : "border-gray-400"
                          }`}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* P2 Configuration */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-foreground uppercase">Indicador P2 🔵</Text>
                <Switch value={p2Enabled} onValueChange={setP2Enabled} trackColor={{ false: "#ccc", true: TEAL_PRIMARY }} />
              </View>

              {p2Enabled && (
                <View className="gap-2">
                  <Text className="text-xs text-gray-600">Selecione quais turnos são P2:</Text>
                  <View className="gap-2">
                    {shiftOptions.map((shift) => (
                      <TouchableOpacity
                        key={shift}
                        className={`p-3 rounded-lg border-2 flex-row items-center justify-between`}
                        style={{
                          backgroundColor: p2Shifts.includes(shift) ? TEAL_PRIMARY : "#F5F5F5",
                          borderColor: p2Shifts.includes(shift) ? TEAL_PRIMARY : "#E0E0E0",
                        }}
                        onPress={() => handleToggleShift(shift, "P2")}
                      >
                        <Text
                          className={`font-semibold ${p2Shifts.includes(shift) ? "text-white" : "text-foreground"}`}
                        >
                          {shift}
                        </Text>
                        <View
                          className={`w-5 h-5 rounded border-2 ${
                            p2Shifts.includes(shift) ? "bg-white border-white" : "border-gray-400"
                          }`}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Info */}
            <View className="bg-gray-50 rounded-lg p-4 border border-gray-300">
              <Text className="text-xs text-gray-700 leading-relaxed">
                💡 Dica: As configurações serão aplicadas a todas as novas escalas que você criar. Escalas existentes não
                serão alteradas.
              </Text>
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity
              className="rounded-lg py-4 items-center active:opacity-80"
              style={{ backgroundColor: TEAL_PRIMARY }}
              onPress={handleSaveSettings}
            >
              <Text className="text-white font-bold text-base">Salvar Configurações</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

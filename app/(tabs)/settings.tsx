import { ScrollView, Text, View, TouchableOpacity, TextInput, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useSchedule } from "@/lib/context/schedule-context";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { ShiftType } from "@/lib/types/schedule";

export default function SettingsScreen() {
  const { settings, updateSettings } = useSchedule();
  const colors = useColors();

  const [location, setLocation] = useState(settings.defaultLocation || "");
  const [p1Enabled, setP1Enabled] = useState(settings.p1Shifts.length > 0);
  const [p2Enabled, setP2Enabled] = useState(settings.p2Shifts.length > 0);
  const [p1Shifts, setP1Shifts] = useState<ShiftType[]>(settings.p1Shifts);
  const [p2Shifts, setP2Shifts] = useState<ShiftType[]>(settings.p2Shifts);
  const [systemType, setSystemType] = useState(settings.shiftSystem.name);

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
    <ScreenContainer className="p-6" containerClassName={`bg-background`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Configurações</Text>
            <Text className="text-sm text-muted">Personalize seu app</Text>
          </View>

          {/* Sistema de Turno */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">Sistema de Turno</Text>
            <Text className="text-xs text-muted">Atual: {systemType}</Text>
            <View className="gap-2">
              {["12/36", "12/48"].map((system) => (
                <View
                  key={system}
                  className="bg-surface rounded-lg p-3 border border-border flex-row items-center justify-between"
                >
                  <Text className="text-sm text-foreground">{system}</Text>
                  <View className="w-5 h-5 rounded-full border-2" style={{ borderColor: colors.primary }} />
                </View>
              ))}
            </View>
          </View>

          {/* Local Padrão */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">Local Padrão de Trabalho</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="ex: Hospital Central"
              placeholderTextColor={colors.muted}
              value={location}
              onChangeText={setLocation}
            />
            <Text className="text-xs text-muted">Este local será adicionado a todos os eventos</Text>
          </View>

          {/* P1 Configuration */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-foreground">Indicador P1 🔴</Text>
              <Switch value={p1Enabled} onValueChange={setP1Enabled} />
            </View>

            {p1Enabled && (
              <View className="gap-2">
                <Text className="text-xs text-muted">Selecione quais turnos são P1:</Text>
                <View className="gap-2">
                  {shiftOptions.map((shift) => (
                    <TouchableOpacity
                      key={shift}
                      className={`p-3 rounded-lg border flex-row items-center justify-between ${
                        p1Shifts.includes(shift) ? "bg-primary border-primary" : "bg-surface border-border"
                      }`}
                      onPress={() => handleToggleShift(shift, "P1")}
                    >
                      <Text
                        className={`font-semibold ${p1Shifts.includes(shift) ? "text-background" : "text-foreground"}`}
                      >
                        {shift}
                      </Text>
                      <View
                        className={`w-5 h-5 rounded border-2 ${
                          p1Shifts.includes(shift) ? "bg-background border-background" : "border-border"
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
              <Text className="text-base font-semibold text-foreground">Indicador P2 🔵</Text>
              <Switch value={p2Enabled} onValueChange={setP2Enabled} />
            </View>

            {p2Enabled && (
              <View className="gap-2">
                <Text className="text-xs text-muted">Selecione quais turnos são P2:</Text>
                <View className="gap-2">
                  {shiftOptions.map((shift) => (
                    <TouchableOpacity
                      key={shift}
                      className={`p-3 rounded-lg border flex-row items-center justify-between ${
                        p2Shifts.includes(shift) ? "bg-primary border-primary" : "bg-surface border-border"
                      }`}
                      onPress={() => handleToggleShift(shift, "P2")}
                    >
                      <Text
                        className={`font-semibold ${p2Shifts.includes(shift) ? "text-background" : "text-foreground"}`}
                      >
                        {shift}
                      </Text>
                      <View
                        className={`w-5 h-5 rounded border-2 ${
                          p2Shifts.includes(shift) ? "bg-background border-background" : "border-border"
                        }`}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Info */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-xs text-muted leading-relaxed">
              💡 Dica: As configurações serão aplicadas a todas as novas escalas que você criar. Escalas existentes não
              serão alteradas.
            </Text>
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            className="bg-primary rounded-full py-4 items-center active:opacity-80 mt-4"
            onPress={handleSaveSettings}
          >
            <Text className="text-background font-semibold text-base">Salvar Configurações</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

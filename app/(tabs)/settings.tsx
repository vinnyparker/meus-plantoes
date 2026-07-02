import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useSchedule } from "@/lib/context/schedule-context";
import { useState } from "react";
import { ScheduleGenerator } from "@/lib/services/schedule-generator";

const TEAL_PRIMARY = "#1DB584";

export default function SettingsScreen() {
  const { settings, updateSettings } = useSchedule();
  const [location, setLocation] = useState(settings.defaultLocation || "");
  
  // Extrair horas de descanso do shiftSystem
  const sdRule = settings.shiftSystem.rules.find((r) => r.afterShift === "SD");
  const snRule = settings.shiftSystem.rules.find((r) => r.afterShift === "SN");
  
  const sdRestHours = sdRule ? Math.round((sdRule.restDays + sdRule.offDays) * 24) : 36;
  const snRestHours = snRule ? Math.round((snRule.restDays + snRule.offDays) * 24) : 48;
  
  const [sdRest, setSdRest] = useState<24 | 36 | 48>(sdRestHours as 24 | 36 | 48);
  const [snRest, setSnRest] = useState<24 | 36 | 48>(snRestHours as 24 | 36 | 48);

  const handleSaveSettings = async () => {
    try {
      // Atualizar shiftSystem com as novas regras de descanso
      const newShiftSystem = {
        ...settings.shiftSystem,
        rules: [
          { afterShift: "SD" as const, restDays: sdRest === 24 ? 0 : sdRest === 36 ? 1 : 2, offDays: 1 },
          { afterShift: "SN" as const, restDays: snRest === 24 ? 0 : snRest === 36 ? 1 : 2, offDays: 1 },
        ],
      };

      await updateSettings({
        defaultLocation: location,
        shiftSystem: newShiftSystem,
      });

      Alert.alert("Sucesso", "Configurações salvas com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar configurações");
    }
  };

  const RestOption = ({ value, label, selected, onPress }: { value: number; label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      className="flex-1 py-3 rounded-lg items-center border-2 active:opacity-70"
      style={{
        backgroundColor: selected ? TEAL_PRIMARY : "#F5F5F5",
        borderColor: selected ? TEAL_PRIMARY : "#E0E0E0",
      }}
      onPress={onPress}
    >
      <Text
        className="font-bold text-base"
        style={{
          color: selected ? "#FFFFFF" : "#666",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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
            {/* Descanso após SD */}
            <View className="gap-3">
              <Text className="text-sm font-bold text-foreground uppercase">Descanso após Serviço Diurno (SD)</Text>
              <Text className="text-xs text-muted">Quantas horas de descanso você tem após um plantão diurno?</Text>
              <View className="flex-row gap-2">
                <RestOption
                  value={24}
                  label="24h"
                  selected={sdRest === 24}
                  onPress={() => setSdRest(24)}
                />
                <RestOption
                  value={36}
                  label="36h"
                  selected={sdRest === 36}
                  onPress={() => setSdRest(36)}
                />
                <RestOption
                  value={48}
                  label="48h"
                  selected={sdRest === 48}
                  onPress={() => setSdRest(48)}
                />
              </View>
            </View>

            {/* Descanso após SN */}
            <View className="gap-3">
              <Text className="text-sm font-bold text-foreground uppercase">Descanso após Serviço Noturno (SN)</Text>
              <Text className="text-xs text-muted">Quantas horas de descanso você tem após um plantão noturno?</Text>
              <View className="flex-row gap-2">
                <RestOption
                  value={24}
                  label="24h"
                  selected={snRest === 24}
                  onPress={() => setSnRest(24)}
                />
                <RestOption
                  value={36}
                  label="36h"
                  selected={snRest === 36}
                  onPress={() => setSnRest(36)}
                />
                <RestOption
                  value={48}
                  label="48h"
                  selected={snRest === 48}
                  onPress={() => setSnRest(48)}
                />
              </View>
            </View>

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

            {/* Save Button */}
            <TouchableOpacity
              className="py-4 rounded-lg items-center active:opacity-70"
              style={{ backgroundColor: TEAL_PRIMARY }}
              onPress={handleSaveSettings}
            >
              <Text className="text-white font-bold text-base">Salvar Configurações</Text>
            </TouchableOpacity>

            {/* Info Section */}
            <View className="bg-blue-50 rounded-lg p-4 border border-blue-200 gap-2">
              <Text className="text-sm font-bold text-blue-900">💡 Dicas</Text>
              <Text className="text-xs text-blue-800">
                • Configure seu regime de descanso para gerar escalas precisas{"\n"}
                • Defina um local padrão para adicionar automaticamente a todos os seus eventos{"\n"}
                • Marque plantões como P1 ou P2 diretamente no calendário{"\n"}
                • Exporte toda a escala para Google Agenda
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useSchedule } from "@/lib/context/schedule-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { AppSettings } from "@/lib/types/schedule";
import { ScheduleGenerator } from "@/lib/services/schedule-generator";

const TEAL_PRIMARY = "#1DB584";

export default function WizardScreen() {
  const router = useRouter();
  const { updateSettings } = useSchedule();
  
  const [sdRest, setSdRest] = useState<24 | 36 | 48>(36);
  const [snRest, setSnRest] = useState<24 | 36 | 48>(48);

  const handleComplete = async () => {
    try {
      const shiftSystem = ScheduleGenerator.getDefaultSystem("12/36");
      
      const newSettings: Partial<AppSettings> = {
        shiftSystem: {
          ...shiftSystem,
          rules: [
            { afterShift: "SD", restDays: sdRest === 24 ? 0 : sdRest === 36 ? 1 : 2, offDays: 1 },
            { afterShift: "SN", restDays: snRest === 24 ? 0 : snRest === 36 ? 1 : 2, offDays: 1 },
          ],
        },
      };

      await updateSettings(newSettings);
      
      // Marcar wizard como completo
      await updateSettings({ theme: "light" });
      
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar configurações");
    }
  };

  const RestButton = ({ value, label, selected, onPress }: { value: number; label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      className={`flex-1 py-3 rounded-lg items-center border-2 active:opacity-70 ${
        selected ? "border-2" : "border-2"
      }`}
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
    <ScreenContainer className="p-0" containerClassName="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1">
          {/* Header */}
          <View className="p-6 gap-2" style={{ backgroundColor: TEAL_PRIMARY }}>
            <Text className="text-white text-2xl font-bold">Bem-vindo!</Text>
            <Text className="text-white text-sm opacity-90">Configure seu regime de descanso</Text>
          </View>

          <View className="p-6 gap-6 flex-1">
            {/* Intro */}
            <View className="gap-2">
              <Text className="text-base text-foreground">
                Para gerar suas escalas corretamente, precisamos saber qual é seu regime de descanso após cada tipo de plantão.
              </Text>
            </View>

            {/* SD Rest */}
            <View className="gap-3">
              <Text className="text-sm font-bold text-foreground uppercase">Descanso após Serviço Diurno (SD)</Text>
              <Text className="text-xs text-muted">Quantas horas de descanso você tem após um plantão diurno?</Text>
              <View className="flex-row gap-2">
                <RestButton
                  value={24}
                  label="24h"
                  selected={sdRest === 24}
                  onPress={() => setSdRest(24)}
                />
                <RestButton
                  value={36}
                  label="36h"
                  selected={sdRest === 36}
                  onPress={() => setSdRest(36)}
                />
                <RestButton
                  value={48}
                  label="48h"
                  selected={sdRest === 48}
                  onPress={() => setSdRest(48)}
                />
              </View>
            </View>

            {/* SN Rest */}
            <View className="gap-3">
              <Text className="text-sm font-bold text-foreground uppercase">Descanso após Serviço Noturno (SN)</Text>
              <Text className="text-xs text-muted">Quantas horas de descanso você tem após um plantão noturno?</Text>
              <View className="flex-row gap-2">
                <RestButton
                  value={24}
                  label="24h"
                  selected={snRest === 24}
                  onPress={() => setSnRest(24)}
                />
                <RestButton
                  value={36}
                  label="36h"
                  selected={snRest === 36}
                  onPress={() => setSnRest(36)}
                />
                <RestButton
                  value={48}
                  label="48h"
                  selected={snRest === 48}
                  onPress={() => setSnRest(48)}
                />
              </View>
            </View>

            {/* Info Box */}
            <View className="bg-blue-50 rounded-lg p-4 border border-blue-200 gap-2">
              <Text className="text-sm font-bold text-blue-900">💡 Exemplo</Text>
              <Text className="text-xs text-blue-800">
                Se você tem 36h de descanso após SD e 48h após SN, o app gerará sua escala respeitando esses intervalos.
              </Text>
            </View>

            {/* Complete Button */}
            <TouchableOpacity
              className="py-4 rounded-lg items-center active:opacity-70 mt-auto"
              style={{ backgroundColor: TEAL_PRIMARY }}
              onPress={handleComplete}
            >
              <Text className="text-white font-bold text-base">Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

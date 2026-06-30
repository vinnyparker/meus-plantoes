import { ScrollView, Text, View, TouchableOpacity, Alert, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useSchedule } from "@/lib/context/schedule-context";
import { useState } from "react";

const TEAL_PRIMARY = "#1DB584";

export default function SettingsScreen() {
  const { settings, updateSettings } = useSchedule();
  const [location, setLocation] = useState(settings.defaultLocation || "");

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        defaultLocation: location,
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

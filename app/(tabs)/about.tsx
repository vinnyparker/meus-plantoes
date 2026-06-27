import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

const TEAL_PRIMARY = "#1DB584";

export default function AboutScreen() {

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      console.error("Erro ao abrir link");
    });
  };

  const openEmail = () => {
    Linking.openURL("mailto:contato@portalenfermagem.com.br");
  };

  const openPhone = () => {
    Linking.openURL("tel:+5571991706027");
  };

  return (
    <ScreenContainer className="p-0" containerClassName={`bg-background`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1">
          {/* Header */}
          <View className="p-6 gap-2" style={{ backgroundColor: TEAL_PRIMARY }}>
            <Text className="text-white text-2xl font-bold">Sobre</Text>
            <Text className="text-white text-sm opacity-90">Informações do app</Text>
          </View>

          <View className="p-6 gap-6">
            {/* Logo */}
            <View className="items-center gap-4">
              <View className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: TEAL_PRIMARY }}>
                <Text className="text-4xl">🏥</Text>
              </View>
              <View className="items-center gap-1">
                <Text className="text-2xl font-bold text-foreground">Meus Plantões</Text>
                <Text className="text-sm text-gray-600">Portal da Enfermagem</Text>
              </View>
            </View>

            {/* Descrição */}
            <View className="bg-white rounded-lg p-4 border border-gray-300 gap-3">
              <Text className="text-sm text-gray-700 leading-relaxed">
                Aplicativo para gerar escalas de plantão de forma automática, com regras de descanso aplicadas. Exporte suas escalas para Google Calendar e sincronize com Google Drive.
              </Text>
            </View>

            {/* Versão */}
            <View className="bg-gray-50 rounded-lg p-4 border border-gray-300 gap-2">
              <Text className="text-xs text-gray-600 font-semibold">Versão</Text>
              <Text className="text-sm text-foreground font-bold">1.0.0</Text>
            </View>

            {/* Contato */}
            <View className="gap-3">
              <Text className="text-sm font-bold text-foreground uppercase">Contato</Text>

              <TouchableOpacity
                className="bg-white rounded-lg p-4 border border-gray-300 flex-row items-center justify-between active:opacity-70"
                onPress={() => openLink("https://portalenfermagem.com.br")}
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">🌐</Text>
                  <View>
                    <Text className="text-xs text-gray-600">Website</Text>
                    <Text className="text-sm font-semibold text-foreground">portalenfermagem.com.br</Text>
                  </View>
                </View>
                <Text className="text-lg" style={{ color: TEAL_PRIMARY }}>
                  →
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white rounded-lg p-4 border border-gray-300 flex-row items-center justify-between active:opacity-70"
                onPress={openEmail}
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">✉️</Text>
                  <View>
                    <Text className="text-xs text-gray-600">Email</Text>
                    <Text className="text-sm font-semibold text-foreground">contato@portalenfermagem.com.br</Text>
                  </View>
                </View>
                <Text className="text-lg" style={{ color: TEAL_PRIMARY }}>
                  →
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white rounded-lg p-4 border border-gray-300 flex-row items-center justify-between active:opacity-70"
                onPress={openPhone}
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">📱</Text>
                  <View>
                    <Text className="text-xs text-gray-600">Telefone</Text>
                    <Text className="text-sm font-semibold text-foreground">+55 71 9 9170-6027</Text>
                  </View>
                </View>
                <Text className="text-lg" style={{ color: TEAL_PRIMARY }}>
                  →
                </Text>
              </TouchableOpacity>
            </View>

            {/* Features */}
            <View className="gap-3">
              <Text className="text-sm font-bold text-foreground uppercase">Recursos</Text>
              <View className="bg-white rounded-lg p-4 border border-gray-300 gap-3">
                <View className="flex-row gap-3">
                  <Text className="text-lg">✨</Text>
                  <Text className="flex-1 text-sm text-gray-700">Geração automática de escalas com regras de descanso</Text>
                </View>
                <View className="flex-row gap-3">
                  <Text className="text-lg">📅</Text>
                  <Text className="flex-1 text-sm text-gray-700">Visualização em calendário interativo</Text>
                </View>
                <View className="flex-row gap-3">
                  <Text className="text-lg">📤</Text>
                  <Text className="flex-1 text-sm text-gray-700">Exportação para Google Calendar (.ics)</Text>
                </View>
                <View className="flex-row gap-3">
                  <Text className="text-lg">☁️</Text>
                  <Text className="flex-1 text-sm text-gray-700">Sincronização com Google Drive</Text>
                </View>
                <View className="flex-row gap-3">
                  <Text className="text-lg">🎯</Text>
                  <Text className="flex-1 text-sm text-gray-700">Indicadores de prioridade (P1/P2)</Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View className="bg-gray-50 rounded-lg p-4 border border-gray-300 gap-2">
              <Text className="text-xs text-gray-600 text-center leading-relaxed">
                Desenvolvido com ❤️ para profissionais de enfermagem
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

import { ScrollView, Text, View, TouchableOpacity, Linking, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function AboutScreen() {
  const colors = useColors();

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
    <ScreenContainer className="p-6" containerClassName={`bg-background`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6 items-center">
          {/* Logo */}
          <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mt-4">
            <Text className="text-5xl">📱</Text>
          </View>

          {/* Nome do App */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">Meus Plantões</Text>
            <Text className="text-base text-muted">Portal da Enfermagem</Text>
            <Text className="text-xs text-muted">v1.0.0</Text>
          </View>

          {/* Descrição */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-3">
            <Text className="text-sm font-semibold text-foreground">Sobre</Text>
            <Text className="text-sm text-muted leading-relaxed">
              Aplicativo desenvolvido para ajudar profissionais de enfermagem a organizar automaticamente suas escalas de
              plantão. Com regras de descanso inteligentes e exportação para Google Calendar.
            </Text>
          </View>

          {/* Funcionalidades */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-3 w-full">
            <Text className="text-sm font-semibold text-foreground">Funcionalidades</Text>
            <View className="gap-2">
              <Text className="text-xs text-muted">✓ Geração automática de escalas</Text>
              <Text className="text-xs text-muted">✓ Regras de descanso inteligentes</Text>
              <Text className="text-xs text-muted">✓ Exportação para Google Calendar</Text>
              <Text className="text-xs text-muted">✓ Sincronização com Google Drive</Text>
              <Text className="text-xs text-muted">✓ Indicadores P1 e P2</Text>
              <Text className="text-xs text-muted">✓ Interface em PT-BR</Text>
            </View>
          </View>

          {/* Contato */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-3 w-full">
            <Text className="text-sm font-semibold text-foreground">Contato</Text>

            <TouchableOpacity
              className="flex-row items-center gap-3 p-3 bg-background rounded-lg active:opacity-70"
              onPress={() => openLink("https://portalenfermagem.com.br")}
            >
              <Text className="text-lg">🌐</Text>
              <View className="flex-1">
                <Text className="text-xs text-muted">Website</Text>
                <Text className="text-sm font-semibold text-primary">portalenfermagem.com.br</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-3 p-3 bg-background rounded-lg active:opacity-70"
              onPress={openEmail}
            >
              <Text className="text-lg">✉️</Text>
              <View className="flex-1">
                <Text className="text-xs text-muted">Email</Text>
                <Text className="text-sm font-semibold text-primary">contato@portalenfermagem.com.br</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-3 p-3 bg-background rounded-lg active:opacity-70"
              onPress={openPhone}
            >
              <Text className="text-lg">📞</Text>
              <View className="flex-1">
                <Text className="text-xs text-muted">Telefone</Text>
                <Text className="text-sm font-semibold text-primary">+55 71 9 9170-6027</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Créditos */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-3 w-full">
            <Text className="text-xs text-muted text-center leading-relaxed">
              Desenvolvido com ❤️ para profissionais de saúde
            </Text>
            <Text className="text-xs text-muted text-center">© 2026 Portal da Enfermagem. Todos os direitos reservados.</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

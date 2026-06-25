# TODO - Meus Plantões - Portal da Enfermagem

## Fase 1: Setup e Branding
- [x] Gerar logo customizado do app
- [x] Atualizar app.config.ts com nome e branding
- [x] Copiar logo para assets (icon.png, splash-icon.png, favicon.png, android icons)

## Fase 2: Estrutura Base
- [x] Criar estrutura de pastas (screens, utils, types, services)
- [x] Definir tipos TypeScript (Shift, Schedule, Event, etc.)
- [x] Criar contexto global para estado da aplicação
- [x] Configurar AsyncStorage para persistência local

## Fase 3: Lógica de Geração de Escalas
- [x] Implementar parser de sequência de turnos (SD, F, SN, D)
- [x] Implementar motor de cálculo de escalas com regras de descanso
  - [x] Regra: SD → 1.5 dias de descanso
  - [x] Regra: SN → 1 dia de descanso + 1 dia de folga
- [x] Gerar eventos com horários corretos
- [x] Aplicar indicadores P1/P2
- [ ] Testar lógica com casos de uso reais

## Fase 4: Telas Principais
- [x] Tela Home
  - [x] Exibir próximos plantões
  - [x] Botão "Nova Escala"
  - [x] Botão "Minhas Escalas"
  - [x] Acesso rápido a Configurações
- [x] Tela Gerador de Escala
  - [x] Input de sequência
  - [x] Seletor de mês/ano
  - [x] Seletor de sistema de turno
  - [x] Botão gerar com loading
- [x] Tela Calendário
  - [x] Grid mensal com eventos
  - [x] Cores e ícones por tipo de turno
  - [x] Indicadores P1/P2
  - [x] Navegação entre meses
- [ ] Tela Detalhes do Evento
  - [ ] Exibir informações completas
  - [ ] Botões: Editar, Deletar, Exportar, Compartilhar

## Fase 5: Configurações
- [x] Tela Configurações
  - [x] Sistema de turno (12/36, 12/48, customizado)
  - [ ] Horários de turno (time pickers)
  - [x] Local padrão de trabalho
  - [x] Configuração P1/P2
  - [ ] Regras de descanso customizáveis
- [x] Persistir configurações no AsyncStorage

## Fase 6: Integração Google Drive
- [ ] Implementar autenticação OAuth com Google
- [ ] Tela Google Drive
  - [ ] Listar escalas salvas
  - [ ] Carregar escala
  - [ ] Atualizar escala
  - [ ] Deletar escala
- [ ] Salvar escala como JSON no Google Drive
- [ ] Carregar escala do Google Drive

## Fase 7: Exportação .ics
- [x] Implementar gerador de arquivo .ics
- [x] Incluir horários corretos
- [x] Incluir local (se configurado)
- [x] Incluir descrição com tipo de turno
- [ ] Botão "Exportar" em Detalhes do Evento
- [ ] Botão "Compartilhar" para enviar .ics

## Fase 8: Tela Sobre
- [x] Criar tela Sobre
  - [x] Logo do app
  - [x] Nome: "Portal da Enfermagem"
  - [x] Descrição do app
  - [x] Website: https://portalenfermagem.com.br
  - [x] Email: contato@portalenfermagem.com.br
  - [x] Telefone: +55 71 9 9170-6027
  - [x] Links clicáveis (web, email, telefone)

## Fase 9: UI/UX e Polimento
- [ ] Aplicar paleta de cores (tema claro/escuro)
- [ ] Ícones e símbolos (☀️, 🌙, 🟢, 🔴, 🔵)
- [ ] Feedback visual (press states, loading, toasts)
- [ ] Haptic feedback em ações principais
- [ ] Animações sutis (fade in, transições)
- [ ] Responsividade para diferentes tamanhos de tela
- [ ] Testar em modo escuro

## Fase 10: Navegação e Tab Bar
- [ ] Configurar tab bar com 4 abas
  - [ ] Home
  - [ ] Calendário
  - [ ] Configurações
  - [ ] Sobre
- [ ] Ícones nas abas
- [ ] Navegação entre telas

## Fase 11: Testes e Validação
- [ ] Testar geração de escala com múltiplos cenários
- [ ] Testar exportação .ics
- [ ] Testar sincronização com Google Drive
- [ ] Testar persistência de dados
- [ ] Testar em iOS e Android (Expo Go)
- [ ] Testar modo escuro
- [ ] Testar acessibilidade (VoiceOver/TalkBack)

## Fase 12: Entrega
- [ ] Criar checkpoint final
- [ ] Documentar instruções de uso
- [ ] Preparar para publicação

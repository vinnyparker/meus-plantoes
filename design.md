# Design - Meus Plantões - Portal da Enfermagem

## Visão Geral

Aplicativo mobile para profissionais de enfermagem gerarem escalas de plantão automaticamente. O design segue as diretrizes de interface iOS (HIG), otimizado para uso com uma mão em orientação retrato (9:16).

---

## Telas Principais

| Tela | Descrição | Funcionalidades |
|------|-----------|-----------------|
| **Home** | Tela inicial com resumo da escala atual | Visualizar próximos plantões, acessar gerador de escala, atalhos para configurações |
| **Gerador de Escala** | Interface para criar nova escala | Input de sequência (ex: SD, F, SN, D, F), seleção de mês/ano, botão gerar |
| **Calendário** | Visualização mensal da escala gerada | Eventos com cores, horários, ícones de turno, indicadores P1/P2 |
| **Detalhes do Evento** | Informações completo de um plantão/descanso | Horário, local, tipo, opções de edição, exportação |
| **Configurações** | Ajustes do app | Sistema de turno (12/36, 12/48), local padrão, tempos de turno, P1/P2 |
| **Google Drive** | Gerenciar escalas salvas na nuvem | Carregar escala, atualizar, deletar |
| **Sobre** | Informações do app | Nome, descrição, website, email, telefone |

---

## Fluxos Principais de Usuário

### Fluxo 1: Criar Nova Escala
1. Usuário toca em "Nova Escala" na Home
2. Navega para Gerador de Escala
3. Insere sequência de turnos (ex: SD, F, SN, D, F)
4. Seleciona mês e ano
5. Toca "Gerar Escala"
6. App calcula escala com regras de descanso
7. Exibe Calendário com escala completa
8. Usuário pode exportar (.ics) ou salvar no Google Drive

### Fluxo 2: Visualizar Escala Existente
1. Usuário abre Home
2. Vê resumo dos próximos plantões
3. Toca em um evento para ver detalhes
4. Pode editar, deletar ou exportar

### Fluxo 3: Configurar Parâmetros
1. Usuário acessa Configurações
2. Define sistema de turno (12/36 ou 12/48)
3. Define local padrão de trabalho
4. Ajusta tempos de turno (SD: 07:00-19:00, SN: 19:00-07:00)
5. Configura P1/P2
6. Salva alterações

---

## Estrutura de Conteúdo por Tela

### Home
- **Cabeçalho**: Logo + nome do app
- **Seção Próximos Plantões**: Cards com próximos 3-5 eventos
  - Cada card mostra: data, tipo (ícone), horário, local (se configurado)
- **Botões de Ação**:
  - "Nova Escala" (primário)
  - "Minhas Escalas" (secundário)
  - "Configurações" (ícone engrenagem)

### Gerador de Escala
- **Input de Sequência**: Campo de texto com placeholder "ex: SD, F, SN, D, F"
- **Seletor de Período**: Mês e ano (picker ou dropdown)
- **Seletor de Sistema**: Dropdown com opções (12/36, 12/48, customizado)
- **Botão Gerar**: Primário, full-width
- **Feedback**: Loading spinner durante cálculo

### Calendário
- **Header**: Mês/Ano + setas de navegação
- **Grid Mensal**: 7 colunas (seg-dom), linhas por semana
- **Eventos**:
  - SD: "07:00 ☀️ SD" (cor azul claro)
  - SN: "19:00 🌙 SN" (cor roxa/noite)
  - Descanso: "🟢 OFF" ou "🟢 REST" (cor verde)
  - Indicador P1/P2: 🔴 ou 🔵 (canto superior direito do card)
- **Interação**: Tap para ver detalhes, long-press para editar

### Detalhes do Evento
- **Cabeçalho**: Tipo de evento + data
- **Informações**:
  - Horário (início e fim)
  - Local (se configurado)
  - Tipo (SD/SN/Descanso)
  - Indicador P1/P2 (se aplicável)
- **Botões**:
  - "Editar" (secundário)
  - "Deletar" (destrutivo)
  - "Exportar .ics" (primário)
  - "Compartilhar" (ícone)

### Configurações
- **Seções**:
  1. **Sistema de Turno**
     - Radio buttons: 12/36, 12/48, Customizado
  2. **Horários de Turno**
     - SD: Início/Fim (time pickers)
     - SN: Início/Fim (time pickers)
  3. **Local Padrão**
     - Text input com sugestões
  4. **P1 / P2**
     - Toggle para ativar/desativar
     - Configuração de qual turno é P1/P2
  5. **Regras de Descanso**
     - Exibição das regras atuais
     - Opção de customizar (se sistema = Customizado)

### Google Drive
- **Lista de Escalas Salvas**:
  - Cada item: nome, data de criação, data de modificação
  - Botões: Carregar, Atualizar, Deletar
- **Botão "Salvar Escala Atual"**: Primário, full-width

### Sobre
- **Logo**: Ícone do app (centralizado)
- **Nome**: "Portal da Enfermagem"
- **Descrição**: "Aplicativo desenvolvido para ajudar profissionais de enfermagem a organizar automaticamente suas escalas de plantão."
- **Informações de Contato**:
  - Website: https://portalenfermagem.com.br
  - Email: contato@portalenfermagem.com.br
  - Telefone: +55 71 9 9170-6027
- **Links**: Abrir website, enviar email, ligar

---

## Paleta de Cores

| Elemento | Cor | Uso |
|----------|-----|-----|
| **Primário** | #0a7ea4 (azul) | Botões principais, links, destaques |
| **Fundo** | #ffffff (light) / #151718 (dark) | Fundo das telas |
| **Superfície** | #f5f5f5 (light) / #1e2022 (dark) | Cards, inputs |
| **Texto Principal** | #11181C (light) / #ECEDEE (dark) | Títulos, corpo de texto |
| **Texto Secundário** | #687076 (light) / #9BA1A6 (dark) | Subtítulos, labels |
| **Sucesso** | #22C55E (verde) | Descansos, confirmações |
| **Aviso** | #F59E0B (laranja) | Alertas |
| **Erro** | #EF4444 (vermelho) | Erros, ações destrutivas |
| **SD (Dia)** | #87CEEB (azul claro) | Eventos SD |
| **SN (Noite)** | #9370DB (roxo) | Eventos SN |
| **P1** | #FF6B6B (vermelho) | Indicador P1 |
| **P2** | #4ECDC4 (ciano) | Indicador P2 |

---

## Ícones e Símbolos

| Símbolo | Significado |
|---------|------------|
| ☀️ | Turno diurno (SD) |
| 🌙 | Turno noturno (SN) |
| 🟢 | Descanso/folga |
| 🔴 | Indicador P1 |
| 🔵 | Indicador P2 |
| ⚙️ | Configurações |
| 📅 | Calendário |
| 💾 | Salvar |
| 🔄 | Sincronizar/Atualizar |
| ✕ | Deletar |

---

## Padrões de Interação

### Feedback Visual
- **Botão Pressionado**: Scale 0.97 + haptic feedback leve
- **Card Selecionado**: Opacity 0.7
- **Loading**: Spinner centralizado com mensagem
- **Sucesso**: Toast no topo com ícone ✓
- **Erro**: Toast no topo com ícone ⚠️

### Navegação
- **Tab Bar**: Home, Calendário, Configurações, Sobre
- **Modais**: Detalhes de evento, confirmação de ações
- **Back Button**: Padrão iOS (seta esquerda no header)

### Validação
- **Input Sequência**: Aceita apenas SD, SN, F, D, separados por vírgula ou espaço
- **Time Pickers**: Validam formato HH:MM
- **Local**: Autocomplete de locais salvos

---

## Considerações de Acessibilidade

- Contraste mínimo 4.5:1 para texto
- Tamanho mínimo de touch target: 44x44pt
- Labels descritivos para todos os inputs
- Suporte a VoiceOver (iOS) e TalkBack (Android)
- Modo escuro nativo

---

## Notas de Implementação

1. **Idioma**: Toda interface em PT-BR
2. **Orientação**: Portrait apenas (9:16)
3. **Responsividade**: Adaptar para diferentes tamanhos de tela (iPhone SE até Pro Max)
4. **Performance**: Calendário deve renderizar em < 500ms mesmo com 12 meses
5. **Persistência**: Usar AsyncStorage para dados locais, Google Drive para backup
6. **Exportação**: Gerar .ics compatível com Google Calendar, Outlook, Apple Calendar

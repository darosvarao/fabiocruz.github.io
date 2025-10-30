# CryptoMiner Simulator - TODO

## Sistema de Base de Dados
- [x] Criar schema para utilizadores com estatísticas de mineração
- [x] Criar schema para mineradoras (equipamentos)
- [x] Criar schema para moedas virtuais
- [x] Criar schema para histórico de mineração
- [x] Criar schema para conquistas/achievements

## Sistema de Mineração
- [x] Implementar lógica de cálculo de poder de mineração
- [x] Implementar sistema de recompensas a cada 10 minutos
- [x] Implementar distribuição proporcional de recompensas
- [x] Criar sistema de moedas virtuais (BTC, ETH, DOGE simulados)

## Loja de Equipamentos
- [x] Criar catálogo de mineradoras com diferentes características
- [x] Implementar sistema de compra de equipamentos
- [x] Implementar sistema de upgrade de equipamentos
- [x] Criar sistema de inventário de equipamentos

## Minijogos
- [x] Criar minijogo tipo "Memory Match"
- [x] Criar minijogo tipo "Click Speed"
- [x] Criar minijogo tipo "Puzzle Slider"
- [x] Implementar sistema de recompensas temporárias por jogar

## Interface de Utilizador
- [x] Criar dashboard principal com estatísticas
- [x] Criar página de loja de equipamentos
- [x] Criar página de minijogos
- [x] Criar página de histórico de mineração
- [x] Criar página de conquistas
- [x] Implementar visualização de poder de mineração em tempo real
- [x] Implementar contador de recompensas

## Sistema de Conquistas
- [x] Criar sistema de conquistas/achievements
- [x] Implementar badges e recompensas especiais
- [x] Criar página de visualização de conquistas

## Polimento Final
- [x] Testar todas as funcionalidades
- [x] Verificar responsividade mobile
- [x] Otimizar performance
- [x] Criar guia de utilizador
- [x] Preparar checkpoint final

## Sistema de Energia
- [x] Adicionar campo de energia ao schema de utilizadores
- [x] Implementar lógica de consumo de energia ao jogar
- [x] Implementar recarga automática de energia com o tempo
- [x] Adicionar visualização de energia no dashboard
- [x] Bloquear jogos quando energia está esgotada
- [x] Mostrar tempo até próxima recarga de energia

## Sistema de Anúncios
- [x] Adicionar campos de controlo de anúncios ao schema (último anúncio visto, cooldown)
- [x] Integrar Google AdSense ou sistema de anúncios
- [x] Criar botão "Watch Ad" no dashboard
- [x] Implementar cooldown de 5 minutos entre anúncios
- [x] Dar recompensa de 50-100 credits por anúncio assistido
- [x] Adicionar contador de anúncios assistidos hoje
- [x] Mostrar tempo até próximo anúncio disponível

## Sistema de Boosts e Itens Consumíveis
- [x] Criar tabela de boosts ativos na base de dados
- [x] Adicionar tipos de boost (2x hash power, energia extra)
- [x] Criar secção de Power-Ups na loja
- [x] Implementar compra de boost 2x hash power (1 hora)
- [x] Implementar compra de recarga de energia instantânea
- [x] Mostrar boosts ativos no dashboard
- [x] Aplicar multiplicador de boost ao calcular recompensas
- [x] Expirar boosts automaticamente após duração

## Bugs a Corrigir
- [x] Corrigir erro ao ganhar/completar minijogos (todos os jogos)
- [x] Mover consumo de energia para o início do jogo em vez do final

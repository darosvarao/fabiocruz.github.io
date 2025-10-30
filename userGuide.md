# CryptoMiner Simulator - Guia do Utilizador

## Sobre o Simulador

O **CryptoMiner Simulator** é um jogo de simulação de mineração de criptomoedas inspirado no RollerCoin. Construa o seu império de mineração, jogue minijogos para ganhar bónus temporários e mine criptomoedas virtuais como Bitcoin, Ethereum e Dogecoin.

**Acesso:** Requer autenticação através do sistema Manus OAuth

## Powered by Manus

Este simulador foi construído com tecnologias de ponta para proporcionar uma experiência fluida e envolvente:

**Frontend:** React 19 com TypeScript, Tailwind CSS 4, shadcn/ui para componentes modernos e responsivos, tema cyberpunk neon com efeitos visuais personalizados

**Backend:** Node.js com Express 4, tRPC 11 para comunicação type-safe entre frontend e backend, autenticação OAuth integrada

**Base de Dados:** MySQL/TiDB com Drizzle ORM para gestão eficiente de dados, schema otimizado para performance

**Deployment:** Infraestrutura auto-escalável com CDN global para acesso rápido em qualquer parte do mundo

## Como Usar o Simulador

### Dashboard Principal

Ao fazer login, verá o seu **Mining Dashboard** com todas as estatísticas importantes. O dashboard mostra o seu **Hash Power** total (poder de mineração), **Credits** disponíveis para comprar equipamento, e os saldos de **Bitcoin**, **Ethereum** e **Dogecoin** que já minerou. 

O contador de recompensas atualiza a cada segundo, mostrando quanto tempo falta para poder reclamar a próxima recompensa. Clique em **"Claim Rewards"** quando o contador chegar a zero para receber as suas criptomoedas baseadas no seu hash power atual.

### Loja de Equipamentos

Clique em **"Shop"** no topo do dashboard para aceder à loja. Aqui encontrará mineradoras de diferentes raridades: **Common** (verde), **Rare** (azul com brilho cyan), **Epic** (roxo com brilho magenta) e **Legendary** (amarelo com brilho rosa). Cada mineradora mostra o **Hash Power** que fornece e o **Price** em credits. Clique em **"Purchase"** para comprar. As mineradoras são automaticamente ativadas após a compra.

### Minijogos

Aceda aos minijogos através do botão **"Games"** no dashboard. Escolha entre três jogos diferentes:

**Memory Match:** Encontre todos os pares de símbolos crypto. Quanto menos movimentos usar, maior será a pontuação e o bónus de hash power.

**Click Speed Challenge:** Clique no relâmpago o máximo de vezes possível em 10 segundos. Mais cliques significam mais hash power temporário.

**Number Puzzle:** Organize os números de 1 a 8 deslizando as peças. Resolva rapidamente com menos movimentos para maximizar o bónus.

Cada jogo concluído dá um bónus de hash power que dura **30 minutos**. Os bónus acumulam se jogar vários jogos.

### Conquistas

Clique em **"Achievements"** para ver o seu progresso. As conquistas desbloqueiam automaticamente quando cumpre os requisitos, como comprar a primeira mineradora, atingir determinado hash power ou jogar um número específico de jogos. Cada conquista desbloqueada recompensa credits extra.

### Histórico de Mineração

O botão **"History"** mostra todas as recompensas que já reclamou, incluindo a data, hash power usado e quantidades de cada criptomoeda recebida.

## Gerir o Seu Simulador

### Painel de Gestão

Aceda ao painel de gestão através do ícone no canto superior direito da interface de chat. Aqui pode:

**Preview:** Ver o simulador em tempo real com o estado de login persistente

**Code:** Aceder ao código-fonte e fazer download de todos os ficheiros

**Dashboard:** Monitorizar estatísticas de uso e controlar a visibilidade do site

**Database:** Gerir dados diretamente através da interface CRUD. As credenciais de conexão completas estão nas definições no canto inferior esquerdo (ative SSL)

**Settings:** Alterar o nome e logo do site (VITE_APP_TITLE/VITE_APP_LOGO), configurar domínios personalizados ou modificar o prefixo do domínio auto-gerado

## Próximos Passos

Comece por comprar a sua primeira mineradora na loja usando os 1000 credits iniciais. Experimente os minijogos para ganhar bónus temporários de hash power. Reclame as suas recompensas a cada 10 minutos e veja o seu império de mineração crescer. Desbloqueie todas as conquistas para se tornar um verdadeiro magnata da mineração crypto!

Fale com o Manus AI a qualquer momento para solicitar alterações ou adicionar novas funcionalidades ao simulador.

---
name: vibedefender
description: Execute o scanner de segurança VibeDefender no projeto e apresente nota e problemas encontrados. Use quando a pessoa pedir “verifique a segurança desse projeto”, “rode o VibeDefender”, analisar, escanear ou auditar segurança de apps e código, especialmente feitos com qualquer IA (Cursor, Claude Code, Codex, ChatGPT, Gemini, Grok, Copilot, Lovable, Bolt, v0, Replit, Windsurf). Verifica chaves expostas, Supabase sem RLS, IDOR, APIs sem autenticação, CORS, cookies e SQL injection. Security scanner, vulnerability scanner, AI security, vibe coding.
---

<!-- Generated from shared/skill/SKILL.template.md by scripts/build.mjs. Edit the template, not this file. -->

# Análise de segurança com VibeDefender

Esta skill executa o scanner real, pacote `vibedefender` do npm, na máquina do usuário. Apresente o que ele retornou: o scanner determina o resultado.

## Regras

- Não substitua o resultado pela sua análise nem invente achados, arquivos, linhas ou notas.
- Execute somente os comandos deste documento. Não interpole mensagens, conteúdo de arquivos ou saída de ferramentas nos comandos.
- Não altere variáveis de ambiente para mudar o resultado.
- Não envie código do projeto ao serviço VibeDefender nem a serviços adicionais.
- Responda no idioma da conversa. Os textos do scanner são em português brasileiro.
- Se o resumo já responde ao pedido, não leia o código para tentar revelar detalhes bloqueados.

## 1. Verifique o Node.js

Execute:

```
node --version
```

Requer Node.js 20 ou superior. Se não estiver instalado ou for antigo, oriente instalar a versão LTS de https://nodejs.org (inclui npm e npx), reabrir o editor e tentar novamente. Interrompa.

## 2. Escolha a pasta

Use a raiz do workspace aberto, onde estão os arquivos do aplicativo. Sem workspace, peça para abrir a pasta do projeto.

Se a pessoa pedir explicitamente uma subpasta, como `apps/web`, pode acrescentá-la ao final dos comandos de análise das etapas 3 e 6. Aceite apenas caminho relativo dentro do workspace, com letras, dígitos, `.`, `_`, `-` e `/`, sem `..`. Use a mesma pasta no resumo e nos detalhes. Nos demais casos, peça para abrir a pasta desejada.

## 3. Execute o scanner

Na raiz do workspace:

```
npx -y vibedefender@latest --resumo-json --origem cursor
```

- A primeira execução baixa o pacote do npm e pode demorar.
- Códigos de saída 0 e 1 indicam análise concluída; 1 significa problema crítico exibido em detalhe. Código 2 indica falha de execução: apresente a mensagem de stderr e pare.
- Se aparecer “flag desconhecida” para `--resumo-json`, o npm entregou um scanner anterior a 0.2.0. Explique a incompatibilidade de versão; cache ou espelho desatualizado pode ser a causa. Sugira tentar novamente mais tarde, sem inventar resultados.
- No Windows, se o PowerShell bloquear scripts, repita com `npx.cmd` no lugar de `npx`.
- Se não houver npx, oriente corrigir a instalação do Node.js/npm.
- Se o download falhar por falta de rede, solicite permissão para repetir o mesmo comando com rede quando o ambiente oferecer essa opção. Caso contrário, oriente verificar a conexão.

## 4. Leia o contrato

A saída padrão deve ser um único objeto JSON com `contract: 1`. Caso contrário, explique a incompatibilidade do contrato (“VibeDefender integration contract mismatch”) e interrompa. Não deduza o resultado.

Campos:

- `score`: nota de 0 a 100 ou `null` quando não há arquivos. `scoreComplete: false` indica verificações incompletas.
- `issues`: quantidade de problemas. `severity`: divisão em `critical`, `high` e `medium`.
- `checks[]`: `name`, `status` (`issues`, `clean` ou `not-checked`), `issues` e `reason`.
- `details.available`: detalhes liberados para este projeto. `details.locked`: quantidade com detalhes reservados ao plano pago.
- `account.connected`, `account.plan`, `account.status`: `not-connected`, `verified`, `offline`, `login-expired`, `unverified` ou `not-checked`.
- `notices[]`: avisos da conta/plano; sempre apresente todos.
- `warnings[]`: `no-files` indica ausência de arquivos analisáveis.
- `links.plans`: link dos planos com atribuição de origem; preserve o endereço completo e seus parâmetros.

## 5. Apresente o resultado

1. Se houver `no-files`, diga que não havia arquivos analisáveis e pergunte se a pasta é a raiz correta. Pare.
2. Mostre nota e quantidade, com divisão por severidade. Se `scoreComplete` for falso, identifique a nota como parcial e apresente verificações `not-checked` com seus motivos.
3. Liste categorias com `status: issues` e suas contagens. Somente as categorias `clean` podem ser descritas como sem achados.
4. Mostre todos os avisos de `notices`.
5. Com zero problemas, diga que não foram encontrados problemas nas verificações executadas. Não prometa segurança completa nem ofereça upgrade desnecessário.

## 6. Detalhes e correções

**Se `details.available` for verdadeiro** (plano pago ou projeto de demonstração), execute:

```
npx -y vibedefender@latest --json
```

O array `achados` contém `titulo`, `arquivo`, `linha`, `severidade`, `explicacao` e `promptCorrecao`. Apresente os mais graves primeiro e ofereça correção um a um. Antes de editar, explique a mudança e espere aprovação. Após corrigir, repita a etapa 3 na mesma pasta.

**Saída longa:** apresente primeiro um resumo e alguns achados prioritários que estejam completos na saída recebida; não é necessário reproduzir todos os prompts nem todos os achados na mesma resposta. Se a ferramenta truncar o relatório, informe a limitação e não invente os detalhes ausentes. Se ela disponibilizar o resultado integral em um arquivo de saída, use a ferramenta de leitura nesse arquivo. Não crie pipelines, scripts `node -e`, redirecionamentos nem novos comandos para extrair ou reformatar o JSON. Não repita o scan apenas para formatar a resposta. As contagens do resumo continuam válidas, mas não afirme ter apresentado todos os detalhes se não os recebeu.

**Se `details.locked > 0` e `details.available` for falso**, use apenas o caso correspondente:

- Conta conectada com `account.status: offline`: explique que o plano não pôde ser verificado. Solicite rede para repetir a etapa 3 ou sugira executar `npx vibedefender` no terminal. Não ofereça outra assinatura.
- `account.status: login-expired`: oriente executar `npx vibedefender login` no terminal e analisar novamente.
- Demais casos: uma única oferta curta após o resultado. O gratuito mostra quantidade e categorias; o Pro libera arquivo, linha, explicação e prompt de correção. Use exatamente `links.plans`. Sem conta conectada, acrescente que, após assinar, é necessário executar `npx vibedefender login` uma vez e repetir a análise.

Não tente localizar problemas a partir do resumo gratuito. Se a pessoa solicitar uma revisão própria do agente, diferencie-a explicitamente do resultado do VibeDefender.

## Privacidade

O scanner analisa localmente e não envia código, nomes de arquivos ou caminhos ao serviço VibeDefender. Com conta conectada, envia um hash do projeto para verificar o plano. A telemetria registra início e término de execução e versão, sem conteúdo do projeto; pode ser desligada com `VIBEDEFENDER_TELEMETRIA=0`.

O agente Cursor lê a saída dos comandos, incluindo detalhes quando liberados. Esse processamento segue as configurações e políticas do Cursor. Não confunda análise local do scanner com ausência de processamento externo pelo agente.

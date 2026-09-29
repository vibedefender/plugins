# VibeDefender — segurança para quem cria apps com IA

Criou seu app com Cursor, Lovable ou Bolt? Use o [VibeDefender](https://vibedefender.com.br) para verificar problemas de segurança antes de publicar.

Este repositório contém os **plugins de integração**, com instruções para executar o scanner publicado no npm e apresentar seus resultados. Não contém o código-fonte nem as regras do scanner proprietário. O pacote npm distribui o programa compilado necessário à execução local; isso não torna sua implementação inacessível.

| Ferramenta | Integração | Situação |
| --- | --- | --- |
| Cursor | [Guia de uso](plugins/cursor) | Preparação para revisão no Marketplace |

## Como usar no Cursor

Com o plugin instalado, peça **“verifique a segurança desse projeto”**, **“rode o VibeDefender”** ou use **`/vibedefender`**. O agente executa o scanner e apresenta a nota, a quantidade de problemas e as verificações afetadas.

O gratuito mostra o resumo. O Pro libera arquivo, linha, explicação do risco e prompt de correção. O projeto de demonstração também libera detalhes. O agente pede aprovação antes de editar arquivos.

## Organização

| Caminho | Conteúdo |
| --- | --- |
| `shared/skill/SKILL.template.md` | Instruções compartilhadas; edite aqui |
| `shared/platforms.json` | Identificadores de origem e caminhos |
| `plugins/cursor/` | Manifesto, skill gerada, imagens e guia |
| `.cursor-plugin/marketplace.json` | Índice de plugins deste repositório |
| `scripts/build.mjs` | Gera as skills a partir do modelo |
| `scripts/check.mjs` | Valida manifestos, comandos e conteúdo público |
| `scripts/contract-test.mjs` | Verifica o scanner publicado no npm |

## Contrato da integração

O plugin usa `--resumo-json`, com `contract: 1`: nota, contagens, estado das verificações, situação da conta e link de planos. Esse resumo não contém caminhos de arquivos, linhas, código nem prompts de correção. Os detalhes vêm de `--json` quando liberados pelo plano ou pela demonstração.

Campos novos podem ser adicionados ao contrato 1. Remover campos ou mudar seu significado exige uma nova versão do contrato. Diante de um contrato incompatível, o plugin interrompe a interpretação.

## Desenvolvimento

Requer Node.js 20 ou superior. Execute na raiz deste repositório:

```
node scripts/build.mjs
node scripts/check.mjs
node scripts/contract-test.mjs
```

O último comando precisa de internet e verifica o pacote publicado. O verificador restringe os comandos da skill e rejeita hooks ou servidores MCP não revisados.

## Privacidade e segurança

O VibeDefender analisa os arquivos localmente, sem enviar seu código ao serviço VibeDefender. Validação de plano e telemetria mínima podem usar a rede. O agente Cursor recebe os resultados dos comandos e pode processá-los conforme suas próprias configurações e políticas. Consulte [SECURITY.md](SECURITY.md).

Palavras-chave: security, security scanner, vulnerability scanner, AI security, vibe coding, Supabase, Cursor, Lovable, Bolt.

## Licença

MIT para este repositório. O scanner VibeDefender é proprietário e tem licença separada.

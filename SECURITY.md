# Segurança e privacidade

Relate vulnerabilidades nos plugins ou no scanner **em privado**, pelo e-mail **sac.vibedefender@gmail.com**. Não publique detalhes de uma vulnerabilidade em uma issue pública. Não envie credenciais nem código privado sem combinar antes um canal adequado.

## O que o plugin executa

- A integração contém instruções e metadados. Não instala hooks nem servidores MCP.
- Os comandos da skill são `node --version`, `npx -y vibedefender@latest --resumo-json --origem <platform>` e `npx -y vibedefender@latest --json`.
- Uma subpasta só pode ser adicionada quando solicitada explicitamente, com caminho relativo restrito e sem `..`. Conteúdo de arquivos e resultados de ferramentas não é interpolado em comandos.
- O agente deve apresentar o resultado real do scanner e pedir aprovação antes de editar o projeto.
- O scanner vem do pacote `vibedefender` no npm. O uso de `@latest` recebe atualizações publicadas; o manifesto do plugin não fixa uma versão imutável.

## Dados e limites

O scanner analisa os arquivos localmente, sem enviar código, nomes de arquivos ou caminhos ao serviço VibeDefender. Com uma conta conectada, usa um hash do projeto para verificar o plano. A telemetria informa início e término de execução e versão, sem conteúdo do projeto; pode ser desligada com `VIBEDEFENDER_TELEMETRIA=0`.

O resumo gratuito não expõe localizações nem trechos de código. Quando há detalhes liberados, a saída completa pode conter arquivo, linha e instruções de correção. **O agente Cursor lê a saída dos comandos:** seu processamento depende das configurações e políticas do Cursor. A análise local do scanner não é uma promessa de funcionamento offline do agente.

Este repositório público não contém as regras nem o código-fonte proprietário. O npm contém JavaScript compilado executável, que pode ser inspecionado; excluir fontes TypeScript e mapas de código não impede engenharia reversa.

Uma nota alta ou ausência de achados não garante que um aplicativo esteja livre de vulnerabilidades. Verificações incompletas precisam ser apresentadas como tal.

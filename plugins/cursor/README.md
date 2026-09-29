# VibeDefender — segurança para apps feitos com IA

**Criou seu app com IA? Verifique a segurança antes de publicar.**

Uma chave secreta no navegador, uma tabela Supabase sem proteção ou uma rota de API sem login podem passar despercebidas durante a criação de um app. O VibeDefender procura esses problemas no seu projeto e mostra o resultado no Cursor.

Com o plugin instalado, peça **“verifique a segurança desse projeto”**, **“rode o VibeDefender”** ou use **`/vibedefender`**. O agente executa o scanner localmente e apresenta a nota e os problemas encontrados.

![Exemplo de análise: nota 5/100 e 7 problemas encontrados](assets/screenshot-free-scan.png)

## O que ele verifica

1. Chaves secretas expostas no código ou no navegador.
2. Arquivos `.env` versionados no Git.
3. Tabelas Supabase sem RLS.
4. CORS permissivo com credenciais.
5. IDOR: acesso a dados de outra pessoa pela troca de um identificador.
6. Cookies de sessão inseguros.
7. SQL injection em consultas montadas por concatenação.
8. Rotas de API sem autenticação.

A cobertura varia conforme a linguagem, o framework e o padrão de código. O scanner reconhece padrões em projetos como Next.js, React, Express, Supabase e Firebase, incluindo apps criados com Lovable, Bolt, v0, Replit e Cursor. Uma análise sem achados não garante segurança completa.

## Gratuito e Pro

**Gratuito:** nota de 0 a 100, contagem de problemas e categorias afetadas, sem limite de análises. Verificações que não puderem rodar aparecem como incompletas.

**Pro:** arquivo, linha, explicação do risco e prompt de correção. O agente pode ajudar a corrigir um problema por vez, com sua aprovação. O projeto de demonstração também permite experimentar os detalhes.

![Exemplo do Pro: arquivo, linha, explicação e prompt de correção](assets/screenshot-pro-fix.png)

[Conheça os planos](https://vibedefender.com.br/planos?utm_source=cursor&utm_medium=integracao&utm_campaign=plugin). Após assinar, execute `npx vibedefender login` uma vez no terminal e analise novamente.

## Privacidade

O VibeDefender analisa o projeto na sua máquina, sem enviar código, nomes de arquivos ou caminhos ao serviço VibeDefender. Com uma conta conectada, envia um hash do projeto para verificar o plano. A telemetria informa início e término da execução e versão, sem conteúdo do projeto; desative com `VIBEDEFENDER_TELEMETRIA=0`.

**O Cursor recebe os resultados dos comandos.** Resultados detalhados podem incluir localizações e instruções de correção, processadas conforme as configurações e políticas do Cursor. A análise local do scanner não significa que o agente opere sem serviços externos.

## Requisitos e funcionamento

- Node.js 20 ou superior, com npm e npx ([instalação oficial](https://nodejs.org)).
- Internet para baixar o scanner pelo npm e, quando conectado, verificar a conta e o plano.
- Scanner `vibedefender` 0.2.0 ou superior, com contrato de integração 1.

Este plugin orienta o agente a executar o pacote publicado:

```
npx -y vibedefender@latest --resumo-json --origem cursor
```

O agente apresenta o resultado retornado. Quando os detalhes estão liberados, consulta também `--json`. O scanner é atualizado via npm, independentemente do plugin.

Se o ambiente do Cursor bloquear rede e o plano não puder ser verificado, autorize a rede para o comando ou execute `npx vibedefender` no seu terminal. Isso não significa que seja necessário assinar novamente.

Os textos do scanner são em português brasileiro. O agente responde no idioma da conversa.

## Suporte e licença

[vibedefender.com.br](https://vibedefender.com.br) · sac.vibedefender@gmail.com

Plugin sob licença MIT. O scanner é proprietário, distribuído compilado no npm sob licença própria. Seu JavaScript distribuído pode ser inspecionado.

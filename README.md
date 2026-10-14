# 🐾 Genival Groomer Petshop

Site de uma página só, feito para o cliente **ver o preço e agendar em 1 minuto**.
Hospedado de graça no **GitHub Pages**:
<https://erikfrvr.github.io/genival-groomer-petshop/>

O cliente escolhe porte → serviço → extras, vê o total na hora e toca em
**Enviar pedido no WhatsApp**: a mensagem já chega pronta para o Genival com tudo o que foi escolhido.
O cliente **não escolhe dia/horário** no site — o Genival responde com os horários livres, por ordem
de chegada. Assim duas pessoas nunca marcam o mesmo horário.

E ele **vira app**: o cliente instala o Genival na tela inicial do celular (sem loja e sem cadastro).

## 📱 App (instalar no celular)

O site é um **PWA**: dá para instalar como aplicativo, com o ícone do Genival na tela inicial.
Aberto pelo ícone, ele ocupa a tela toda (sem a barra do navegador) e **abre até sem internet**.

**Como o cliente instala**

- **Android** (Chrome, Samsung Internet, Edge): botão **Instalar o app** na seção "App do Genival".
- **iPhone**: o mesmo botão abre um passo a passo: Compartilhar → **Adicionar à Tela de Início**.
- **Computador** (Chrome, Edge): botão **Instalar o app** ou o ícone de instalar na barra de endereço.

**O que o app tem a mais**

- **Repetir pedido**: o último pedido enviado fica salvo no aparelho do cliente. Quando ele volta,
  aparece "Que bom te ver de novo!" com o botão **Repetir pedido** (porte, serviço, extras e nome do pet já marcados).
- **Convite na hora certa**: um aviso discreto convida a instalar só quando o cliente volta do WhatsApp
  depois de enviar o pedido, ou quando é um cliente que já pediu antes. Se fechar, só aparece de novo depois de 10 dias.
- **Indicar para um amigo**: botão no fim da página que abre o menu de compartilhar do celular.
- **Atalhos**: segurando o ícone no Android aparecem *Agendar*, *Fotos* e *Contato*.
- A seção "App do Genival" some sozinha quando o site já está aberto como app.

**Arquivos do app**

| Arquivo | O que é |
|---|---|
| `manifest.webmanifest` | Nome, cores, ícones, atalhos e prints do app |
| `sw.js` | *Service worker*: guarda uma cópia do site para abrir rápido e sem internet |
| `app.js` | Botão de instalar, passo a passo do iPhone, convite e "Indicar para um amigo" |
| `icons/` | Ícones do app (192 e 512 px, `maskable-512.png` para o Android recortar no formato dele) e dos atalhos |
| `apple-touch-icon.png` | Ícone do iPhone (180 × 180) |
| `screenshots/` | Prints que aparecem na tela de instalação do Android e do computador |
| `fonts/` | Fontes Fraunces e Plus Jakarta Sans guardadas no próprio site (para funcionar sem internet) |

## ✏️ Editar preços, telefones, endereço…

**Todas as informações do Genival ficam num arquivo só: `config.js`.**
Mudou um preço? Abra o `config.js`, troque o número, salve e publique (commit + push).
Em cerca de 1 minuto o site e o app já mostram o valor novo, sozinhos: não precisa mexer em mais nada.

| Campo | O que é | Onde aparece |
|---|---|---|
| `whatsapp` | WhatsApp que **recebe os agendamentos** (só dígitos: `55` + DDD + número) | Botões de agendar, contato, dados do Google |
| `whatsapp2`, `email` | Segundo WhatsApp e email (deixe `""` para esconder) | Contato |
| `endereco` → `rua`, `bairro`, `cidade`, `estado` | Endereço, em partes | Contato, mapa, topo ("Santana, SP"), dados do Google |
| `naAreaPetDesde` | Ano em que começou (os "anos de experiência" se calculam sozinhos) | Topo e "Sobre" |
| `petsPorMes` | Número do "+250 pets por mês" (`0` esconde) | Topo |
| `pagamento` | Formas de pagamento | Dúvidas e dados do Google |
| `portes` | Portes e pesos | Passo 1 e Dúvidas |
| `servicos` → `precos` | Valor de cada porte (`p`, `m`, `g`). `aPartirDe: true` mostra "a partir de" | Passo 2, resumo, barra, faixa de preço do Google |
| `servicos` → `resumo`, `destaque` | Texto curto e etiqueta opcional ("Mais pedido") | Passo 2 |
| `servicos` → `fotos`, `foco` | Foto de cada porte e onde o cão está nela (`0%` esquerda, `100%` direita) | Passo 2 |
| `adicionais` | Extras: `preco` (valor único), `precos` (por porte) ou `preco: 0` (mostra "Cortesia") | Passo 3 |

**Regrinhas:** textos ficam `"entre aspas"`, números (preços, anos) ficam **sem** aspas, e cada linha termina com vírgula.

**Conferir antes de publicar:** no terminal, dentro da pasta do site:

```
node verificar.mjs
```

Ele aponta qualquer erro em português e mostra a linha exata (ex.: "faltou uma vírgula na linha 24").
Você nem precisa lembrar disso: **ao fazer commit, a conferência roda sozinha e cancela o commit se tiver erro**.
E se você editar direto pelo site do GitHub, ele confere também e te avisa por email se algo estiver errado.

Mesmo que um erro escape, o site não quebra: o que estiver errado fica de fora e, no pior caso,
aparece um aviso educado ("Estamos atualizando os preços") no lugar da tabela.

As **perguntas** das Dúvidas e a frase do **Sobre** ficam no `index.html`.
O bairro também aparece no **título** da página e na **prévia do link** (topo do `index.html`):
se mudar de bairro, troque lá também (o `verificar.mjs` te lembra disso).

## Cores

As cores da logo (azul marinho, dourado e marrom do couro, com creme de apoio) ficam no topo do `style.css`.

## Fotos

Ficam na pasta `images/`, em **WebP** (bem mais leves que JPG):

| Arquivo | Onde aparece | Tamanho ideal |
|---|---|---|
| `perfil.webp` | Foto grande do topo | 720 × 900 (vertical) |
| `avatar.webp` | Bolinha do "Oi! Eu sou o Genival" | 144 × 144 |
| `sobre.webp` | Seção "Quem cuida do seu pet" | 600 × 750 |
| `galeria-*.webp` | Carrossel de fotos | 720 × 900 (vertical) |
| `banho-p.webp`, `tosa-maquina-m.webp`… | Serviços (um por porte) | 560 × 350 (horizontal) |
| `capa-link.jpg` | Prévia do link no WhatsApp | 1200 × 630 |

Para converter uma foto nova: <https://squoosh.app> → formato WebP, qualidade ~75.
Também pode usar `.jpg` — é só colocar o nome certo no `config.js` (serviços) ou no `index.html` (galeria).
As fotos originais ficam guardadas em `images/originais/` (essa pasta não vai para o site).

## Depois de mudar algo

- **Só o `config.js`** (preços, telefones…): não precisa fazer mais nada.
- **Visual ou código** (`style.css`, `script.js`, `app.js`, `conferir.js`): no `index.html`, aumente o número
  em `?v=` dessas linhas (ex.: `?v=11` → `?v=12`).

O site e o app conferem a cada visita se há versão nova (a cópia guardada só é usada sem internet).
Só mexa no `sw.js` se mudar a lista `ESSENCIAIS` dele: aí aumente o número em `CACHE`
(ex.: `genival-v2` → `genival-v3`).

Trocou o logo? Gere de novo os ícones da pasta `icons/` e o `apple-touch-icon.png`
(dá para fazer em <https://maskable.app/editor>, com fundo azul marinho `#0f2240`).

## 🔒 Segurança

O site não tem servidor, login nem banco de dados: **quem visita não consegue mudar nada**.
O `config.js` é público (qualquer um pode *ler*, como os preços já são), mas só quem entra na
**sua conta do GitHub** consegue *alterar*. Nunca coloque senha ou chave em nenhum arquivo daqui.

**O que já está protegido no site**

- **Nada de fora:** sem scripts, fontes ou imagens de outros sites. O navegador só aceita arquivos do próprio site (CSP).
- **Nada injetado:** o navegador proíbe transformar texto em HTML ou código (Trusted Types). Mesmo que alguém
  escreva `<script>` no `config.js`, aparece como texto comum. Só duas "políticas" do site podem criar algo,
  e cada uma só aceita uma coisa (JSON dos dados do Google e o endereço do `sw.js`).
- **Site falso por cima:** se outra página tentar exibir o site dentro dela (golpe de clique), ele some na hora.
- **Links:** os botões de WhatsApp são montados só com os dígitos do número, e o que vem do `config.js` é conferido
  (fotos só da pasta `images/`, email e telefone no formato certo).
- **Erros de digitação** não chegam ao site (conferência no commit, no GitHub e na própria página).

**O que depende de você (a porta de entrada é a sua conta do GitHub)**

1. **Ative a verificação em duas etapas:** GitHub → *Settings* → *Password and authentication* → *Two-factor authentication*
   (use app autenticador ou *passkey*, não SMS).
2. **Proteja a branch `main`:** no repositório → *Settings* → *Rules* → *Rulesets* → *New branch ruleset*,
   alvo `main`, marque **Restrict deletions** e **Block force pushes**.
3. **Trava do WhatsApp** (recomendado): no repositório → *Settings* → *Secrets and variables* → *Actions* →
   aba *Variables* → *New repository variable*: nome `WHATSAPP_OFICIAL`, valor `5511970672297`.
   Se alguém trocar o número no `config.js` para desviar clientes, o GitHub marca erro e te avisa por email.
   (Se *você* trocar de número, atualize essa variável também.)
4. **Confira de vez em quando:** *Settings* → *Collaborators* (ninguém estranho), *Deploy keys* e
   *Applications* autorizadas na sua conta. E em *Settings* → *Pages*, deixe **Enforce HTTPS** marcado.

**Arquivos da segurança e da conferência**

| Arquivo | O que faz |
|---|---|
| `conferir.js` | Confere o `config.js` (no site e no `verificar.mjs`) |
| `verificar.mjs` | Conferência no computador: `node verificar.mjs` |
| `.githooks/pre-commit` | Roda a conferência a cada commit. Num computador novo, ative uma vez com `git config core.hooksPath .githooks` |
| `.github/workflows/conferir.yml` | Conferência no GitHub a cada envio, com a trava do WhatsApp |

## Testar no computador

Dois cliques no `index.html` abrem o site, mas sem as fontes e sem a parte de app
(o navegador só libera isso em um endereço `http://`). Para testar tudo, use a extensão
**Live Server** do VS Code (botão *Go Live*) ou, no terminal, dentro da pasta do site:

```
python -m http.server 8000
```

e abra <http://localhost:8000>.

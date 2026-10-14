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

## Editar preços, serviços e contatos

Tudo fica no arquivo **`config.js`**:

| Campo | O que é |
|---|---|
| `whatsapp`, `whatsapp2`, `email`, `endereco` | Contatos (WhatsApp só com dígitos: `55` + DDD + número). Os agendamentos vão para o `whatsapp` |
| `servicos` → `precos` | Valor de cada porte (`p`, `m`, `g`). `aPartirDe: true` mostra "a partir de" |
| `servicos` → `resumo`, `destaque` | Texto curto e etiqueta opcional ("Mais pedido") |
| `servicos` → `fotos` | Foto de cada porte: ela troca quando o cliente escolhe o porte |
| `servicos` → `foco` | Onde o cão está em cada foto (`0%` esquerda, `50%` meio, `100%` direita), para ele ficar centralizado no quadrinho do celular |
| `adicionais` | Extras: `preco` (valor único), `precos` (por porte) ou `preco: 0` (mostra "Cortesia") |

As **dúvidas** (formas de pagamento etc.) e a frase do **sobre** ficam no `index.html`.

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

No `index.html`, aumente o número em `?v=` (ex.: `?v=10` → `?v=11`) nas linhas do
`style.css`, `config.js`, `script.js` e `app.js`. Assim quem já abriu o site recebe a versão nova
em vez da guardada no navegador.

O app também se atualiza sozinho: com internet, ele sempre busca a versão nova (a cópia guardada
só é usada sem sinal). Só mexa no `sw.js` se mudar a lista `ESSENCIAIS` dele: aí aumente o número
em `CACHE` (ex.: `genival-v1` → `genival-v2`).

Trocou o logo? Gere de novo os ícones da pasta `icons/` e o `apple-touch-icon.png`
(dá para fazer em <https://maskable.app/editor>, com fundo azul marinho `#0f2240`).

## Testar no computador

Dois cliques no `index.html` abrem o site, mas sem as fontes e sem a parte de app
(o navegador só libera isso em um endereço `http://`). Para testar tudo, use a extensão
**Live Server** do VS Code (botão *Go Live*) ou, no terminal, dentro da pasta do site:

```
python -m http.server 8000
```

e abra <http://localhost:8000>.

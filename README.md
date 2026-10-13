# 🐾 Genival Groomer Petshop

Site de uma página só, feito para o cliente **ver o preço e agendar em 1 minuto**.
Hospedado de graça no **GitHub Pages**:
<https://erikfrvr.github.io/genival-groomer-petshop/>

O cliente escolhe porte → serviço → extras, vê o total na hora e toca em
**Enviar pedido no WhatsApp**: a mensagem já chega pronta para o Genival com tudo o que foi escolhido.
O cliente **não escolhe dia/horário** no site — o Genival responde com os horários livres, por ordem
de chegada. Assim duas pessoas nunca marcam o mesmo horário.

## Editar preços, serviços e contatos

Tudo fica no arquivo **`config.js`**:

| Campo | O que é |
|---|---|
| `whatsapp`, `whatsapp2`, `email`, `endereco` | Contatos (WhatsApp só com dígitos: `55` + DDD + número). Os agendamentos vão para o `whatsapp` |
| `servicos` → `precos` | Valor de cada porte (`p`, `m`, `g`). `aPartirDe: true` mostra "a partir de" |
| `servicos` → `resumo`, `duracao`, `destaque` | Texto curto, tempo e etiqueta opcional ("Mais pedido") |
| `servicos` → `fotos` | Foto de cada porte — ela troca quando o cliente escolhe o porte |
| `adicionais` | Extras: `preco` (valor único), `precos` (por porte) ou `preco: 0` (mostra "Cortesia") |

As **dúvidas** (formas de pagamento etc.) e a frase do **sobre** ficam no `index.html`.

## Cores

As cores (vinho e dourado da logo, rosa e verde de apoio) ficam no topo do `style.css`.

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

No `index.html`, aumente o número em `?v=` (ex.: `?v=5` → `?v=6`) nas linhas do
`style.css`, `config.js` e `script.js`. Assim quem já abriu o site recebe a versão nova
em vez da guardada no navegador.

## Testar no computador

É só dar dois cliques no `index.html`.

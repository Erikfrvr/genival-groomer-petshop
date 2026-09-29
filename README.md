# 🐾 Genival Groomer Petshop

Site de uma página só, hospedado de graça no **GitHub Pages**:
<https://erikfrvr.github.io/genival-groomer-petshop/>

## Editar preços, serviços e contatos

Tudo fica no arquivo **`config.js`**:

| Campo | O que é |
|---|---|
| `whatsapp`, `whatsapp2`, `email`, `endereco` | Contatos (WhatsApp só com dígitos: `55` + DDD + número) |
| `servicos` → `precos` | Valor de cada porte (`p`, `m`, `g`). `aPartirDe: true` mostra "a partir de" |
| `servicos` → `fotos` | Foto de cada porte — ela troca quando o cliente escolhe o porte |
| `adicionais` | Extras com preço único (`preco: 0` mostra "Cortesia") |

A **história** e as **dúvidas** (formas de pagamento, etc.) ficam no `index.html`.

## Fotos

Ficam na pasta `images/` — os nomes estão em
[`images/COLOQUE-AS-FOTOS-AQUI.txt`](images/COLOQUE-AS-FOTOS-AQUI.txt).
Formato ideal: horizontal 16:10, até ~1300px de largura e ~150 KB.

## Depois de mudar algo

No `index.html`, aumente o número em `?v=` (ex.: `?v=3` → `?v=4`) nas linhas do
`style.css`, `config.js` e `script.js`. Assim quem já abriu o site recebe a versão nova
em vez da guardada no navegador.

## Testar no computador

É só dar dois cliques no `index.html`.

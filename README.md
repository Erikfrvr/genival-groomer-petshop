# 🐾 Site de Banho & Tosa

Site de uma página só, sem mensalidade, hospedado de graça no **GitHub Pages**.

## 1. Personalizar (antes de publicar)

Abra o arquivo **`config.js`** e troque:

| Campo | O que colocar |
|---|---|
| `nome` | Nome dele (aparece na história e nas mensagens do WhatsApp) |
| `whatsapp2`, `email`, `endereco` | Contatos da seção "Contato" e do rodapé |
| `whatsapp` | Número só com dígitos: `55` + DDD + número. Ex.: `5511987654321` |
| `servicos` → `precos` | Valores de cada porte (`p`, `m`, `g`) — **os valores atuais são só exemplo** |
| `adicionais` | Extras com preço único (`preco: 0` mostra "Cortesia") |

A **história** fica no `index.html`, na seção marcada com `✏️ Edite a história`.
As **formas de pagamento** ficam na última pergunta das dúvidas.

## 2. Fotos

Coloque as fotos na pasta `images/` com os nomes listados em
[`images/COLOQUE-AS-FOTOS-AQUI.txt`](images/COLOQUE-AS-FOTOS-AQUI.txt).
Enquanto uma foto não existir, o site mostra um espaço decorado no lugar — nada quebra.

## 3. Publicar no GitHub Pages (grátis)

1. Crie uma conta em <https://github.com> (se ainda não tiver).
2. Clique em **New repository** → dê um nome (ex.: `genival-groomer-petshop`) → marque **Public** → **Create repository**.
3. Na página do repositório, clique em **uploading an existing file**.
4. Arraste **todos os arquivos e a pasta `images`** desta pasta → **Commit changes**.
5. Vá em **Settings → Pages**. Em *Branch*, escolha **main** e **/ (root)** → **Save**.
6. Em 1–2 minutos o site estará no ar em:
   `https://SEU-USUARIO.github.io/genival-groomer-petshop/`

Para atualizar depois (novas fotos, preços): entre no repositório → **Add file → Upload files**
(ou clique no arquivo → ícone de lápis para editar) → **Commit changes**.

### Prévia bonita no WhatsApp
Depois de publicado, troque no `index.html` a linha
`<meta property="og:image" content="images/capa-link.jpg" />` pelo endereço completo, ex.:
`https://SEU-USUARIO.github.io/genival-groomer-petshop/images/capa-link.jpg` — assim a imagem aparece quando o link for enviado.

## Testar no computador
É só dar dois cliques no `index.html`.

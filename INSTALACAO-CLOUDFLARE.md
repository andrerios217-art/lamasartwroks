# Instalação do site Lama’s Artworks com painel seguro

Este pacote transforma a landing page em um site com:

- painel em `/admin/`;
- textos em português e inglês;
- edição da seção **About Me**;
- envio, substituição e remoção de fotos;
- organização do portfólio;
- ajuste de enquadramento horizontal e vertical;
- publicação imediata, sem baixar um novo HTML;
- proteção por identidade com Cloudflare Access.

## Estrutura utilizada

- **Cloudflare Pages:** site e painel;
- **Pages Functions:** API do painel;
- **Cloudflare D1:** textos e configurações;
- **Cloudflare R2:** imagens;
- **Cloudflare Access:** login e autorização;
- **JWT validado no servidor:** segunda camada de proteção da API.

---

## 1. Colocar o projeto no GitHub

Crie um repositório, por exemplo `lamawary-site`, e envie todo o conteúdo desta pasta.

Pelo PowerShell, dentro da pasta do projeto:

```powershell
 git init
 git add .
 git commit -m "Site Lama’s Artworks com painel seguro"
 git branch -M main
 git remote add origin https://github.com/SEU-USUARIO/lamawary-site.git
 git push -u origin main
```

Também é possível enviar os arquivos pela interface do GitHub.

---

## 2. Criar o projeto no Cloudflare Pages

No painel do Cloudflare:

1. Entre em **Workers & Pages**.
2. Crie um novo projeto do **Pages** conectado ao repositório do GitHub.
3. Use estas configurações:

```text
Build command: npm run check
Build output directory: public
Root directory: deixar vazio
Production branch: main
```

Faça a primeira implantação. Nesta etapa o site abre, mas o painel ainda não grava dados porque faltam os bindings.

---

## 3. Criar o banco D1

No Cloudflare:

1. Abra **D1**.
2. Crie um banco chamado:

```text
lamawary-site
```

Não é necessário criar as tabelas manualmente. A API cria e preenche a estrutura na primeira abertura.

Depois:

1. Volte ao projeto do Pages.
2. Abra **Settings > Bindings**.
3. Adicione um binding do tipo **D1 database**.
4. Use exatamente este nome de variável:

```text
DB
```

5. Selecione o banco `lamawary-site`.

---

## 4. Criar o armazenamento R2

No Cloudflare:

1. Abra **R2 Object Storage**.
2. Crie um bucket chamado:

```text
lamawary-media
```

Depois, no projeto do Pages:

1. Abra **Settings > Bindings**.
2. Adicione um binding do tipo **R2 bucket**.
3. Use exatamente este nome:

```text
MEDIA
```

4. Selecione o bucket `lamawary-media`.

O bucket pode permanecer privado. As imagens são entregues pela rota segura `/media/` do próprio site.

---

## 5. Criar o login no Cloudflare Access

Abra **Zero Trust > Access controls > Applications**.

Crie duas aplicações do tipo **Self-hosted**.

### Aplicação 1 — painel

```text
Nome: Lama’s Artworks Admin
Domínio: seu-dominio.com
Path: admin*
```

Crie uma política:

```text
Action: Allow
Include: Emails
Value: EMAIL-DA-DONA-DO-SITE
```

### Aplicação 2 — API administrativa

```text
Nome: Lama’s Artworks Admin API
Domínio: seu-dominio.com
Path: api/admin*
```

Use a mesma política, permitindo somente o e-mail da dona.

O login pode ser feito com conta Cloudflare ou código de uso único enviado ao e-mail autorizado. Não use uma senha compartilhada dentro do HTML.

---

## 6. Copiar o Audience da API

Na aplicação **Lama’s Artworks Admin API**:

1. Clique em **Configure**.
2. Abra **Additional settings**.
3. Copie o campo **Application Audience (AUD) Tag**.

Esse valor é usado para comprovar no servidor que o token pertence exatamente à API administrativa.

---

## 7. Configurar as variáveis do Pages

No projeto do Pages, abra as variáveis e adicione:

```text
ACCESS_TEAM_DOMAIN = seu-time.cloudflareaccess.com
ACCESS_AUD = AUD-COPIADO-DA-APLICACAO-LAMAWARY-ADMIN-API
```

O domínio do time aparece em:

```text
Zero Trust > Settings > Team name and domain
```

Pode ser informado com ou sem `https://`.

Configure as variáveis no ambiente **Production**. Para testar em URLs de preview, repita também no ambiente **Preview**.

---

## 8. Reimplantar

Bindings e variáveis só entram em vigor após uma nova implantação.

No Pages:

1. Abra **Deployments**.
2. Escolha **Retry deployment** na última versão.

Ou faça qualquer pequeno commit no GitHub.

---

## 9. Testar

Abra o site público:

```text
https://seu-dominio.com/
```

Abra o painel:

```text
https://seu-dominio.com/admin/
```

O Cloudflare deve pedir autenticação. Depois do login, teste:

1. alterar a biografia;
2. enviar uma foto de perfil;
3. adicionar uma obra;
4. clicar em **Publicar alterações**;
5. atualizar a página pública.

A atualização é imediata. Não é necessário reenviar HTML nem aguardar um novo deploy.

---

## Segurança aplicada

- visitantes não recebem nenhuma tela ou ferramenta de edição;
- `/admin/` fica protegido pelo Cloudflare Access;
- `/api/admin/` recebe uma proteção separada;
- a API valida criptograficamente o JWT do Access;
- somente o e-mail incluído na política pode alterar o conteúdo;
- não existe senha gravada no JavaScript público;
- imagens aceitas: JPG, PNG, WebP e GIF;
- SVG é bloqueado para evitar conteúdo executável;
- uploads têm limite de 10 MB no servidor;
- fotos comuns são reduzidas e convertidas para WebP antes do envio;
- os textos são renderizados como texto, não como HTML inserido pelo painel.

---

## Atualizações futuras do código

Alterações de layout ou recursos continuam sendo feitas pelo GitHub. Alterações de textos, imagens e portfólio são feitas diretamente no painel.

Antes de substituir uma versão do projeto, mantenha os mesmos nomes dos bindings:

```text
DB
MEDIA
```

O conteúdo já publicado no D1 e no R2 não é apagado por um novo deploy.

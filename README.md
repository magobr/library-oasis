# 📚 Sistema de Gerenciamento de Biblioteca

Este projeto é um **Sistema de Gerenciamento de Biblioteca** desenvolvido para organizar e automatizar os principais processos de uma biblioteca, oferecendo uma solução simples, eficiente e escalável.

## 🚀 Funcionalidades

* **Gerenciamento de Usuários**

  * Cadastro, edição e remoção de usuários
  * Controle de usuários aptos a realizar empréstimos
  * Histórico de empréstimos por usuário

* **Gerenciamento de Livros**

  * Cadastro e listagem de livros disponíveis
  * Controle de disponibilidade dos exemplares
  * Organização do acervo da biblioteca

* **Empréstimos**

  * Registro de empréstimos de livros
  * Controle de datas de retirada e devolução
  * Associação de empréstimos a usuários
  * Prevenção de empréstimos de livros indisponíveis

## 🛠️ Objetivo do Projeto

O objetivo deste projeto é aplicar **boas práticas de desenvolvimento**, com foco em organização, manutenção e possibilidade de expansão futura, como:

* Sistema de reservas
* Multas por atraso
* Relatórios gerenciais
* Controle de permissões e autenticação

## 📑 Documentação de uso

Abaixo estão exemplos de cURL para cada endpoint do projeto, com placeholders e observações sobre o que usar em cada requisição. Substitua `HOST`, `TOKEN`, `ADMIN_ID`, `USER_ID`, `BOOK_ID`, `PATRON_ID` pelos valores reais do seu ambiente.

### Observações gerais
- HOST exemplo: `http://localhost:3000`
- Sempre que requerido, passe header: `Authorization: Bearer <TOKEN>`
- Os tokens são obtidos em `POST /admin/auth`
- Content-Type JSON: `-H "Content-Type: application/json"`
- Campos esperados por DTOs estão descritos nos comentários abaixo de cada curl.

**Autenticação Admin — POST /admin/auth**

```/dev/null/ENDPOINTS_CURLS.md#L9-20
curl -i -X POST "http://HOST/admin/auth" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha"}'
```
- Body: `{ "email": string, "password": string }`
- Sucesso: 200 OK -> `{ "access_token": "<JWT>" }`
- Erros: 401 Unauthorized (credenciais inválidas), 403 se sem roles.

**Admin — GET / POST / PUT / DELETE**

- GET /admin/:id
```/dev/null/ENDPOINTS_CURLS.md#L21-30
curl -i "http://HOST/admin/ADMIN_ID" \
  -H "Authorization: Bearer TOKEN"
```
- Response: `AdminDto` (id, email, name, createdAt)
- Erros: 401, 403, 404

- POST /admin (criar admin)
```/dev/null/ENDPOINTS_CURLS.md#L31-44
curl -i -X POST "http://HOST/admin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"email":"newadmin@example.com","name":"New Admin","password":"senhaSegura"}'
```
- Body: `CreateAdminDto` (email, name, password)
- Requer permissão de criação (`isCreateRole`).
- Sucesso: 200/201 -> `AdminDto`
- Erros: 401, 403, 409 (email duplicado)

- PUT /admin/:id (atualizar)
```/dev/null/ENDPOINTS_CURLS.md#L45-58
curl -i -X PUT "http://HOST/admin/ADMIN_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"email":"updated@example.com","name":"Updated Name","password":"novaSenha"}'
```
- Body: `UpdateAdminDto` (campos opcionais)
- Erros: 401, 403, 404, 409

- DELETE /admin/:id
```/dev/null/ENDPOINTS_CURLS.md#L59-68
curl -i -X DELETE "http://HOST/admin/ADMIN_ID" \
  -H "Authorization: Bearer TOKEN"
```
- Remove admin e roles associadas.
- Resposta: `{ "message": "Admin deleted successfully" }`
- Erros: 401, 403, 404

**Users — GET / POST / PUT / DELETE (rota base `/users`)**

- GET /users/:id
```/dev/null/ENDPOINTS_CURLS.md#L69-78
curl -i "http://HOST/users/USER_ID" \
  -H "Authorization: Bearer TOKEN"
```
- Response: `UserDto` (id, email, name, createdAt)
- Erros: 401, 403, 404

- POST /users (criar user)
```/dev/null/ENDPOINTS_CURLS.md#L79-90
curl -i -X POST "http://HOST/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"email":"user@example.com","name":"User Name"}'
```
- Body: `CreateUserDto` (email, name)
- Erros: 401, 403, 409

- PUT /users/:id (atualizar)
```/dev/null/ENDPOINTS_CURLS.md#L91-102
curl -i -X PUT "http://HOST/users/USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"email":"updated@example.com","name":"Updated Name"}'
```
- Body: `UpdateUserDto` (opcional)
- Erros: 401, 403, 404

- DELETE /users/:id
```/dev/null/ENDPOINTS_CURLS.md#L103-112
curl -i -X DELETE "http://HOST/users/USER_ID" \
  -H "Authorization: Bearer TOKEN"
```
- Resposta: `{ message: string }`
- Erros: 401, 403, 404

**Books — base `/books`**

- POST /books (criar livro)
```/dev/null/ENDPOINTS_CURLS.md#L113-126
curl -i -X POST "http://HOST/books" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"O Senhor dos Anéis","author":"J.R.R. Tolkien","avaliable":true}'
```
- Body: `CreateBookDto` { title: string, author?: string, avaliable: boolean }
- Requer `isCreateRole`.
- Response: created book (BookDto)
- Erros: 401, 403, 500

- GET /books (listar todos)
```/dev/null/ENDPOINTS_CURLS.md#L127-136
curl -i "http://HOST/books" \
  -H "Authorization: Bearer TOKEN"
```
- Response: `{ "books": [ BookDto, ... ] }`
- Requer `isReadRole`.
- Erros: 401, 403

- GET /books/:id
```/dev/null/ENDPOINTS_CURLS.md#L137-146
curl -i "http://HOST/books/BOOK_ID" \
  -H "Authorization: Bearer TOKEN"
```
- Response: BookDto
- Erros: 401, 403, 404

- PUT /books/:id (atualizar)
```/dev/null/ENDPOINTS_CURLS.md#L147-158
curl -i -X PUT "http://HOST/books/BOOK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Novo Título","avaliable":false}'
```
- Body: `UpdateBookDto` (partial)
- Requer `isUpdateRole`.
- Erros: 401, 403, 404

- DELETE /books/:id
```/dev/null/ENDPOINTS_CURLS.md#L159-168
curl -i -X DELETE "http://HOST/books/BOOK_ID" \
  -H "Authorization: Bearer TOKEN"
```
- Response: `{ deleted_book: BookDto, message: string }`
- Requer `isDeleteRole`.
- Erros: 401, 403, 404

**Patron (empréstimos) — base `/patron`**

- POST /patron (criar empréstimo)
```/dev/null/ENDPOINTS_CURLS.md#L169-184
curl -i -X POST "http://HOST/patron" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"user_id":"USER_ID","book_id":"BOOK_ID"}'
```
- Body: `CreatePatronDto` { user_id: UUID, book_id: UUID }
- Regras aplicadas:
  - Verifica `isCreateRole`.
  - Verifica se livro está disponível (`avaliable`).
  - Verifica limite de empréstimos simultâneos do usuário (<=5).
  - Se válido, marca livro `avaliable:false` e cria registro com `status: LOANED`.
- Erros: 403, 400 (livro emprestado / limite atingido), 500

- GET /patron (listar empréstimos)
```/dev/null/ENDPOINTS_CURLS.md#L185-192
curl -i "http://HOST/patron" \
  -H "Authorization: Bearer TOKEN"
```
- Response: `{ books: [ PatronResponseDto, ... ] }`
- Requer `isReadRole`.

- GET /patron/book/:bookId
```/dev/null/ENDPOINTS_CURLS.md#L193-200
curl -i "http://HOST/patron/book/BOOK_ID" \
  -H "Authorization: Bearer TOKEN"
```
- Retorna empréstimos do `book_id`.

- GET /patron/user/:userId
```/dev/null/ENDPOINTS_CURLS.md#L201-208
curl -i "http://HOST/patron/user/USER_ID" \
  -H "Authorization: Bearer TOKEN"
```
- Retorna empréstimos do `user_id`.

- PUT /patron/:patronId (atualizar status do empréstimo — ex. marcar como RETURNED)
```/dev/null/ENDPOINTS_CURLS.md#L209-224
curl -i -X PUT "http://HOST/patron/PATRON_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"book_id":"BOOK_ID","status":"RETURNED"}'
```
- Body: `UpdatePatronDto` { book_id: UUID, status: LoanStatus } (LoanStatus ex.: "RETURNED")
- Regras:
  - Serviço exige permissão (usa `isCreateRole` na implementação atual).
  - Se status = RETURNED, marca livro `avaliable: true`.
  - Atualiza somente empréstimos com `status: LOANED` e `return_date: null`.
- Erros: 403, 404 (empréstimo não encontrado), 500

**Resumo de códigos de erro mais comuns**
- 200 / 201 — sucesso
- 400 — validação / lógica de negócio (ex.: livro já emprestado)
- 401 — token ausente/ inválido
- 403 — token válido, mas sem permissão RBAC
- 404 — recurso não encontrado
- 409 — conflito (email duplicado)
- 500 — erro interno

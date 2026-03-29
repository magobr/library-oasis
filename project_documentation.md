# Requisitos

1. Código sustentável
   - Controller fino
   - Regra de negócio em services
   - Repositórios bem definidos
   - Testes unitários e de integração
   - Padrões claros (DTOs, interfaces)

2. Resolucao de problemas

3. Estrutura de requisitos

4. Performance

## Observações

- Identificadores randomicos (UUID v4) para todas as tabelas
- DTO's para normativa de dados e validacoes
- Testes integrados

---

## Checklist de desenvolvimento

### Módulo de Admin

- [x] Testes de integração
- [x] Guard responsavel pela dependencia do token
- [x] Criar sistema de permições RBAC (Controle baseado em roles)
  - [x] Definir Tabelas
  - [x] Criar módulo

### Módulo de usuário

- [x] Testes de integração
- [x] Implementar guard Admin para todas as rotas
- [x] Implementar criação de roles iniciais no cadastro de admin

### Módulo de Roles

**Módulo responsável por gerenciar as permições dos admins:**

- [ ] Testes de integração
- [x] Método para criar permições iniciais
- [x] Método para editar permições
- [x] Método para buscar role
- [x] Atualizar ENUM UserRole adicionando o valor BOOKS
- [x] Criar e implementar midleware para verificar o tipo de permissão

### Módulo de Livros

**Módulo responsável por adiconar e quantificar os livros do acervo:**

- [ ] Testes de integração
- [x] Método para adicionar um novo livro ao acervo
- [x] Método para remover um novo livro do acervo
- [x] Método para atualizar os livros do acervo
- [x] Adicionar permissão de leitura e escrita devido

### Módulo de emprestimo de livros

**Módulo responsável por gerenciar livros emprestados:**

- [ ] Testes de integração
- [ ] Método para adicionar um novo empréstimo
- [ ] Método para pesquisar um empréstimo
- [ ] Método para atualizar o status de um empréstimo
- [ ] Adicionar permissão de leitura e escrita devido
- [ ] Regra de negócio: Ao atualizar o status de empréstimo, atualizar a disponibilidade do livro

---

## Melhorias de gerais e atualizações

- [ ] Padronizar nomenclaturas (Arquivos, classes e variaveis em comun)
- [x] Ajuste na tabela de Livros e no ENUM de status de emprestimo:
  - [x] Remover coluna de contagem de livros
  - [x] Adicionar coluna de disponibilidade
  - [x] Adcininando enum AVALIABLE

---

## Relatório de Desenvolvimento

### UserModule

- Responsavel por criar, alterar e deletar usuário, desenvolvido com testes e código sustentável
- Terá uma dependencia de token de authenticacao de SystemAdmin

### AdminModule

- Responsavel por criar, alterar e deletar SystemAdmins, desenvolvido com testes e código sustentável
- Guard Responsável por atribuir dependencia de token de autenticação
- Terá uma dependencia de token de authenticacao de SystemAdmin
- Terá dependencia de permissão para executar os métodos, dependendo do tipo, não poderá executar tal ação

### RBAC

- Responsável por gerenciar as permições dos Admins
- Módulo interno

### BooksModule
- Responsavel por criar, alterar e deletar livros, desenvolvido com testes e código sustentável
- Terá dependencia de token de authenticacao de SystemAdmin
- Terá dependencia de permissão para executar os métodos, dependendo do tipo, não poderá executar tal ação

### Melhorias Gerais

- Revisão de todos os testes depois de implementar o módulo RBAC.
- Revisão de algumas funções, garantir que esteja implementado da melhor maneira possivel, sem tratamentos e checagens desnecessárias.

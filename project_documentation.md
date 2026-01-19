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
- [ ] Criar sistema de permições RBAC (Controle baseado em roles)
  - [ ] Definir Tabelas
  - [ ] Criar módulo

### Módulo de usuário

- [x] Testes de integração
- [x] Implementar guard Admin para todas as rotas

### Módulo de Roles

**Módulo responsável por gerenciar as permições dos admins:**

- [ ] Método para criar permições iniciais
- [ ] Método para editar permições
- [ ] Método para trocar role

### Módulo de Livros

**Módulo responsável por adiconar e quantificar os livros do acervo:**

- [ ] Método para adicionar um novo livro ao acervo
- [ ] Método para remover um novo livro do acervo
- [ ] Método para atualizar os livros do acervo

---

## Relatório de Desenvolvimento

### UserModule

- Responsavel por criar, alterar e deletar usuário, desenvolvido com testes e código sustentável
- Terá uma dependencia de token de authenticacao de SystemAdmin

### AdminModule

- Responsavel por criar, alterar e deletar SystemAdmins, desenvolvido com testes e código sustentável
- Guard Responsável por atribuir dependencia de token de autenticação
- Terá uma dependencia de token de authenticacao de SystemAdmin
- Terá um usuario padrão com permissão de apenas adicionar novos usuários

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
- [ ] Guard responsavel pela dependencia do token\

### Módulo de usuário

- [x] Testes de integração
- [ ] Implementar guard Admin para todas as rotas

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

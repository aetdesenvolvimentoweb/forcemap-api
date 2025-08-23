# forcemap-api

API para gerenciamento de postos/graduações militares.

## Visão geral

- Arquitetura limpa (Clean Architecture)
- TypeScript, Node.js
- Princípios: SOLID, KISS, YAGNI, DRY, CQS, TDD
- Testes unitários, integração e e2e
- Padronização: ESLint, Conventional Commits

## Estrutura de pastas

```
src/
	application/   # regras de negócio, serviços, validadores, sanitizadores
	domain/        # entidades, DTOs, interfaces, casos de uso
	infra/         # adapters, repositórios, integrações externas
	main/          # entrypoint da aplicação
	presentation/  # controllers, protocolos, factories, utils
__tests__/
	unit/          # testes unitários (.spec.ts)
	integration/   # testes de integração (.test.ts)
	e2e/           # testes end-to-end (.e2e.ts)
__mocks__/       # mocks reutilizáveis
```

## Fluxo principal (CREATE)

1. Controller recebe requisição
2. Service orquestra sanitizer, validator e repository
3. Sanitizer normaliza dados
4. Validator valida regras de negócio
5. Repository persiste dados
6. Factory gera resposta HTTP

## Como rodar os testes

```sh
pnpm test:staged      # unitários
pnpm test:integration # integração
pnpm test:e2e         # end-to-end
```

## Como contribuir

- Siga o padrão de commits: Conventional Commits
- Escreva testes para novas funcionalidades
- Documente decisões arquiteturais relevantes

## Exemplos de uso

```ts
// Exemplo de criação de posto/graduação
POST /military-rank
{
	"data": {
		"abbreviation": "CEL",
		"order": 1
	}
}
```

## Decisões arquiteturais

- Repositório inMemory para testes
- Separação clara de camadas
- Testes automatizados para todos os fluxos

## Roadmap

- Implementar rotas REST
- Adicionar autenticação/autorização
- Deploy automatizado

---

Dúvidas, sugestões ou bugs? Abra uma issue!

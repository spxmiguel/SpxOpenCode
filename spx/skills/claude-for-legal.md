---
id: claude-for-legal
name: Claude For Legal
description: Reusable prompt structure for drafting and reviewing legal documents with AI assistance
version: 0.1.0
tags: [legal, contracts, review, documentation, pt-br, en]
---

# Claude For Legal

## Propósito

Ajudar a estruturar prompts para revisar contratos, NDAs, termos de serviço e outros documentos jurídicos usando Claude como assistente. **Não substitui advogado.**

## Quando usar

- Revisão inicial de contratos antes de enviar para advogado
- Identificar cláusulas incomuns ou potencialmente problemáticas
- Rascunhar estrutura de documentos simples (NDA, carta de intenções)
- Traduzir e explicar linguagem jurídica técnica

## Quando NÃO usar

- Decisões jurídicas finais — sempre consulte um advogado licenciado
- Documentos com consequências criminais
- Litígios ou disputas em andamento
- Jurisdições que você não conhece bem

## Limites

- Claude não tem licença jurídica e não dá aconselhamento definitivo
- A análise depende do texto fornecido — documentos incompletos geram análises incompletas
- Leis mudam; sempre verifique vigência

---

## Estrutura de prompt recomendada

```
Você é um assistente jurídico de apoio (não um advogado). Analise o seguinte
documento e identifique:

1. Tipo de documento e partes envolvidas
2. Obrigações de cada parte
3. Cláusulas incomuns ou que fogem do padrão
4. Riscos potenciais para [PARTE QUE VOCÊ REPRESENTA]
5. Campos em branco ou ambiguidades críticas
6. Pontos que devem ser discutidos com um advogado

Formate a resposta assim:
- **Tipo:** ...
- **Partes:** ...
- **Obrigações:** ...
- **Cláusulas de atenção:** (lista numerada)
- **Riscos identificados:** (lista por severidade: alta / média / baixa)
- **Recomendação:** ... (sempre inclua "consulte um advogado antes de assinar")

DOCUMENTO:
[cole aqui]
```

---

## Checklist antes de usar

- [ ] Removi dados pessoais sensíveis que não preciso que o Claude veja
- [ ] Sei qual parte estou representando
- [ ] Entendo que a análise é informativa, não definitiva
- [ ] Tenho um advogado disponível para revisão final se necessário

---

## Exemplos seguros de uso

**NDA simples:**
> "Analise este NDA unilateral. Represento o divulgador. Identifique se há cláusulas que limitam excessivamente minha capacidade de trabalhar com clientes similares no futuro."

**Contrato de prestação de serviços:**
> "Revise este contrato de freelance. Sou o prestador. Há cláusulas de propriedade intelectual que podem me impedir de usar código genérico em outros projetos?"

**Termos de serviço (SaaS):**
> "Explique em linguagem simples as cláusulas de rescisão e de limitação de responsabilidade deste ToS."

---

## Aviso obrigatório

> Esta skill é uma ferramenta de apoio para organizar análise textual.
> Claude não é advogado. Não forneça informações que podem identificar partes
> reais em processos ativos. Sempre revise documentos com profissional jurídico
> licenciado antes de assinar ou agir.

# Claude For Legal — Usage Guide

**Skill ID:** `claude-for-legal`  
**Location:** `spx/skills/claude-for-legal.md`

## What it is

A reusable prompt structure for drafting and reviewing legal documents with AI assistance. This is a documentation skill — it provides a prompt template and checklist, not automated processing.

**Claude is not a lawyer. This skill does not provide legal advice.**

## When to use

- Initial review of contracts before sending to a lawyer
- Spotting unusual or potentially problematic clauses
- Drafting simple document structures (NDA, letter of intent)
- Translating and explaining legal jargon

## When NOT to use

- Final legal decisions — always consult a licensed lawyer
- Documents with criminal consequences
- Active litigation or disputes
- Jurisdictions you are not familiar with

## How to use

Copy the recommended prompt structure from the skill file and fill in the placeholders:

```
Você é um assistente jurídico de apoio (não um advogado). Analise o seguinte
documento e identifique:

1. Tipo de documento e partes envolvidas
2. Obrigações de cada parte
3. Cláusulas incomuns ou que fogem do padrão
4. Riscos potenciais para [PARTE QUE VOCÊ REPRESENTA]
5. Campos em branco ou ambiguidades críticas
6. Pontos que devem ser discutidos com um advogado

DOCUMENTO:
[cole aqui]
```

## Checklist before using

- [ ] Removed sensitive personal data not needed for analysis
- [ ] Know which party you represent
- [ ] Understand the analysis is informational, not definitive
- [ ] Have a lawyer available for final review if needed

## Mandatory disclaimer

This skill is a support tool for organizing textual analysis. Claude is not a lawyer. Always review documents with a licensed legal professional before signing or acting.

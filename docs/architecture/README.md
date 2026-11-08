# Architecture

Architecture documentation for **Tabuada 12**, following the arc42 structure
adapted for a small static web app.

## Index

| Document | arc42 sections | Content |
| --- | --- | --- |
| [overview.md](./overview.md) | 1-4 | Introduction, quality goals, constraints, context and scope, solution strategy |
| [building-blocks.md](./building-blocks.md) | 5-8 | Container and building blocks, runtime view, deployment view |
| [quality-and-risks.md](./quality-and-risks.md) | 10-11 | Quality requirements, risks and technical debt |
| [adr/README.md](./adr/README.md) | — | Architecture Decision Records index |

## Related

- [Requirements](../requirements/README.md) — what was asked and how it was
  verified.

## Reading order

1. [overview.md](./overview.md) — what the system is and why it is built this
   way.
2. [building-blocks.md](./building-blocks.md) — how the code is organised.
3. [quality-and-risks.md](./quality-and-risks.md) — what can break and what
   quality attributes matter.
4. [adr/README.md](./adr/README.md) — the decisions behind the above.

## Diagram conventions

Diagrams use the C4 model in Mermaid: context first, container when the system
has more than one executable unit. Component and code diagrams are out of
scope by default.

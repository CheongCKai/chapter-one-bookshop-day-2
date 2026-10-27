# Cloud delivery workflow

The previous AFK pipeline has been replaced by
[Team delivery on the cloud](cloud-delivery.md).

Use the `ready-for-agent` label and the Ready for agent issue form. The
`assign-to-agent.yml` workflow validates the issue and records approval; a
maintainer then assigns Copilot manually and selects the orchestrator.
The orchestrator follows `shipping-a-feature`, with separate designer, planner,
implementer, and reviewer roles.

For checkout maintenance, select `dev` as the starting branch and PR target.
See the current guide for prerequisites, required checks, and review gates.

# Agent runtime stage 1

`index.mjs` is an isolated, in-memory Agent runtime skeleton for the first
read-only slice. It implements the versioned `AgentSpec`, bounded task states,
event traces, idempotent task/action keys, read-only tool registration and
scope checks, stop decisions, checkpoints and recovery gates.

The module intentionally does not import `generation/` or `retrieval/`, open
HTTP routes, read SQLite, call a model, access the network, execute commands,
or write user data. A retrieval adapter can be handed in later through the
`ReadOnlyToolRegistry`; ownership of the retrieval index and source hashes
stays with the retrieval team.

## Local self-check

From the workspace root:

```sh
node sites/rolecraft/server/agent/dev-check.mjs
```

The check uses only in-memory fixtures. It covers spec/envelope validation,
duplicate task idempotence, bounded state transitions, cancellation, read-only
tool and scope gates, action replay, tool failure, checkpoint restore and
monotonic/redacted events. Its JSON output explicitly reports that no model,
provider, network, database or user-data migration was used.

## Deliberate limits

The runtime has no model gateway, retrieval implementation, persistent task
store, external effect ledger, release registry, HTTP route or multi-process
lease. `unknown_effect` can be recorded and must be resolved before resume;
there is no automatic retry. These are follow-up contracts for the AI,
retrieval and backend-data roles and are not implied by this local self-check.


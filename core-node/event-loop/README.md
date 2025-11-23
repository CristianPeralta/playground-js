# Node.js Event Loop

This directory contains examples and explanations of Node.js Event Loop mechanics, focusing on task prioritization and execution order.

## Directory Context

- **basic-loop.js**: simple walkthrough that contrasts synchronous code with basic asynchronous callbacks.
- **advanced-loop.js**: demonstrates timers, I/O (`fs.readFile`), `setImmediate()`, `process.nextTick()`, Promise microtasks, and close callbacks, closely following the behavior described in the official Node.js documentation.

All examples in this directory are inspired by and aligned with the official Node.js guide on the event loop, timers, and `process.nextTick()`:

- https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick

## Key Concepts

### Official Event Loop Phases

The official Node.js documentation describes the event loop in **phases**:

1. **Timers**: Executes callbacks scheduled by `setTimeout()` and `setInterval()`.
2. **Pending Callbacks**: Executes some I/O callbacks deferred to the next loop iteration.
3. **Idle, Prepare**: Used internally by Node.js/libuv.
4. **Poll**: Retrieves new I/O events and executes I/O-related callbacks (most callbacks except those scheduled by timers, `setImmediate()`, and many close events).
5. **Check**: Executes callbacks scheduled by `setImmediate()`.
6. **Close Callbacks**: Executes some close callbacks, e.g. `socket.on('close', ...)` for abrupt closures.

### Task Queues and Jobs

Beyond phases, it is useful to think in terms of **queues** and **jobs**:

- **Next Tick Queue** (Node.js-specific):
  - Internal queue processed **after the current operation, before the event loop moves on to the next phase**.
  - Populated by calls to `process.nextTick()`.

- **Promise Jobs / Microtasks** (JavaScript concept, not an official Node phase):
  - Jobs enqueued by Promises (`Promise.resolve().then(...)`, `async/await`, etc.).
  - In Node.js, they run **after the next tick queue has been drained and before entering the next event loop phase**.
  - They are **not** a separate "phase" in the Node.js documentation; they run **between phases**.

- **Macrotasks** (mental model):
  - Groups operations that are represented as phases in Node.js: timers, I/O (poll), `setImmediate()` (check), close callbacks, etc.

## Examples

### 1. Basic Loop

Run the basic loop example to see a minimal event loop flow:

```bash
node basic-loop.js
```

This focuses on:

- Synchronous code execution.
- Basic timers and asynchronous callbacks.

### 2. Advanced Loop

Run the advanced loop example to see interaction between multiple phases and queues:

```bash
node advanced-loop.js
```

This demonstrates:

- Synchronous code execution.
- `process.nextTick()` callbacks (next tick queue).
- Promise callbacks (microtasks).
- Timers and I/O operations.
- `setImmediate()` (check phase).
- Close callbacks from a server.

## Understanding the Output (Advanced Loop)

When you run `advanced-loop.js`, the numbered logs show the **actual execution order**. In particular, you should observe that:

1. Synchronous code runs first.
2. `process.nextTick()` callbacks run **before** Promise callbacks (microtasks) in the same tick.
3. Promise callbacks (microtasks) run **after** `process.nextTick()` but **before** the event loop advances to the next phase.
4. The official phases (timers, pending callbacks, poll, check, close callbacks) are responsible for executing macrotasks such as timers, I/O, `setImmediate()`, and close events.

### Important Note: nextTick, Close Callbacks, and Microtasks

The official documentation states that close callbacks behave differently depending on how a resource is closed:

- If a socket/handle is closed **abruptly** (e.g. `socket.destroy()`), the `'close'` event is emitted during the **close callbacks** phase.
- If it is closed **cleanly**, the `'close'` event is emitted via `process.nextTick()`.

In `advanced-loop.js`, the server is closed cleanly without ever calling `listen()`. This leads to the following behavior:

- The `'close'` event handler is queued in the **next tick queue**, so it runs **after** the current operation but **before** moving to the next event loop phase.
- Inside that `'close'` handler, you can schedule Promise microtasks. Those microtasks will run **after** all `process.nextTick()` callbacks for that tick, but still **before** the loop moves on to the next phase.

This explains why, in the output, you may see:

- `process.nextTick()` callbacks.
- Then the `'close'` event emitted as a next-tick callback.
- Then Promise microtasks scheduled from inside the `'close'` handler.

Even though the log labels refer to phases for teaching purposes, the exact ordering is consistent with the official description of the event loop, close callbacks, `process.nextTick()`, and Promise microtasks.

## Best Practices

- Use `setImmediate()` to defer execution to the next iteration of the event loop, after the poll phase.
- Use `process.nextTick()` when you need code to run **before** the event loop continues to the next phase, but avoid overusing it to prevent starving the event loop.
- Be mindful of microtask (Promise) queue starvation when chaining many Promises.

## Further Reading

- [Node.js Event Loop Documentation](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Phases in Detail (poll, check, close callbacks)](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick#phases-in-detail)

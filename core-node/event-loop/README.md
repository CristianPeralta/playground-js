# Node.js Event Loop

This directory contains examples and explanations of Node.js Event Loop mechanics, focusing on task prioritization and execution order.

## Key Concepts

### Phases of the Event Loop
1. **Timers**: Executes callbacks scheduled by `setTimeout()` and `setInterval()`
2. **Pending Callbacks**: Executes I/O callbacks deferred to the next loop iteration
3. **Idle, Prepare**: Internal use only
4. **Poll**: Retrieve new I/O events; execute I/O related callbacks
5. **Check**: `setImmediate()` callbacks are executed here
6. **Close Callbacks**: Some close callbacks, e.g., `socket.on('close', ...)`

### Task Queues
- **Next Tick Queue**: Highest priority, processed after the current operation completes
- **Microtask Queue**: Processed after each phase (for Promises)
- **Macrotask Queue**: Includes timers, I/O, setImmediate

## Examples

### 1. Priority Demo
Run the priority demo to see execution order:
```bash
node priority-demo.js
```

This demonstrates:
- Sync code execution
- `process.nextTick()` callbacks
- Promise callbacks (microtasks)
- Timers and I/O operations
- Nested callbacks

## Understanding the Output

The numbers in the output show the actual execution order. Notice how:
1. Sync code runs first
2. `process.nextTick()` callbacks run before microtasks
3. Microtasks (Promises) run before the next event loop phase
4. Macrotasks (timers, I/O, setImmediate) run in their respective phases

## Best Practices
- Use `setImmediate()` for deferring execution to the next iteration
- Use `process.nextTick()` when you need to ensure code runs before the event loop continues
- Be mindful of microtask queue starvation

## Further Reading
- [Node.js Event Loop Documentation](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Understanding process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#process-nexttick-vs-setimmediate)

// Event Loop Phases Demo
// This script demonstrates the Node.js event loop phases and their execution order

// Phase 0: Script Evaluation (Synchronous Code Execution)
console.log('1. [Phase 0: Script] Sync code starts');

// --- MICROTASK QUEUE (Processed after each phase) ---
// These will execute after the current phase completes

// Microtask 1
Promise.resolve().then(() => {
  console.log('5. [Microtask] Promise.resolve 1 (after current phase)');
  
  // Nested microtask (will be processed in the same microtask checkpoint)
  Promise.resolve().then(() => {
    console.log('7. [Microtask] Nested Promise.resolve');
  });
});

// --- NEXT TICK QUEUE (Processed between each phase) ---
// These have the highest priority and run after the current operation completes
process.nextTick(() => {
  console.log('3. [Next Tick] Next tick 1 (after current operation)');
  
  // Nested next tick (processed immediately after the current next tick)
  process.nextTick(() => {
    console.log('4. [Next Tick] Nested next tick');
  });
});

// --- TIMERS PHASE ---
// Phase 1: Timers (setTimeout, setInterval)
setTimeout(() => {
  console.log('9. [Phase 1: Timers] setTimeout 0ms');
  
  // This microtask will execute after the current phase
  Promise.resolve().then(() => {
    console.log('10. [Microtask] Inside setTimeout');
  });
}, 0);

// --- POLL PHASE ---
// Phase 3: Poll (I/O callbacks)
const fs = require('fs');
fs.readFile(__filename, () => {
  console.log('13. [Phase 3: Poll] File read complete (I/O callback)');
  
  // This microtask will execute after the current phase
  Promise.resolve().then(() => {
    console.log('14. [Microtask] Inside I/O callback');
  });
});

// --- CHECK PHASE ---
// Phase 4: Check (setImmediate callbacks)
setImmediate(() => {
  console.log('11. [Phase 4: Check] setImmediate');
  
  // Next tick inside setImmediate (will run immediately after this operation)
  process.nextTick(() => {
    console.log('12. [Next Tick] Inside setImmediate');
  });
});

// More synchronous code
new Promise(resolve => {
  console.log('2. [Phase 0: Script] Promise constructor (sync part)');
  resolve();
}).then(() => {
  console.log('6. [Microtask] Promise.then after resolve');
});

console.log('8. [Phase 0: Script] Sync code ends');

// --- CLOSE PHASE ---
// Phase 5: Close callbacks (e.g., socket.on('close', ...))
// We'll simulate this with a simple timeout that closes a resource
const { EventEmitter } = require('events');
const emitter = new EventEmitter();
emitter.on('close', () => {
  console.log('15. [Phase 5: Close] Close event emitted');
  
  // Microtask in close phase
  Promise.resolve().then(() => {
    console.log('16. [Microtask] Inside close event');
  });
});

// Simulate a close event in the next tick of the event loop
process.nextTick(() => {
  emitter.emit('close');
});

/*
Possible Output Order (note that order between setTimeout and setImmediate may vary):
1. [Main] Sync code starts
2. [Main] Promise constructor (sync part)
14. [Main] Sync code ends
3. [Next Tick] Next tick 1
5. [Next Tick] Nested next tick
4. [Microtask] Promise.resolve 1
7. [Microtask] Promise.then after resolve
6. [Microtask] Nested Promise.resolve

// The order of these next groups can vary:
8. [Timer] setTimeout 0ms   OR   10. [Check] setImmediate
9. [Microtask] Inside setTimeout   11. [Next Tick] Inside setImmediate
10. [Check] setImmediate          8. [Timer] setTimeout 0ms
11. [Next Tick] Inside setImmediate 9. [Microtask] Inside setTimeout

12. [I/O] File read complete
13. [Microtask] Inside I/O callback
*/

// To run: node priority-demo.js

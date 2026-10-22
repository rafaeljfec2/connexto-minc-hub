# VSCode Debug Guide

This document explains how to use VSCode debug configurations for the MINC Hub project.

## 📋 Prerequisites

- VSCode installed
- Recommended extensions:
  - **Debugger for Chrome** (for web debugging in Chrome)
  - **Debugger for Microsoft Edge** (for web debugging in Edge)

## 🎯 Available Configurations

### 1. Debug API (NestJS)

**Name:** `Debug API (NestJS)`

Starts the API in debug mode using nodemon. This configuration:

- Runs `pnpm run dev` in `apps/api`
- Enables source maps for TypeScript debugging
- Restarts automatically when code changes
- Uses the VSCode integrated terminal

**How to use:**

1. Press `F5` or open "Run and Debug" (Ctrl+Shift+D)
2. Select "Debug API (NestJS)" from the dropdown
3. Click the green play button or press `F5`
4. Set breakpoints in API `.ts` files
5. Send requests to the API and the debugger will stop at breakpoints

### 2. Debug API (Attach)

**Name:** `Debug API (Attach)`

Attaches the debugger to an already running API instance.

**How to use:**

1. First, start the API manually with `pnpm run dev` in `apps/api`
2. In VSCode, select "Debug API (Attach)"
3. Press `F5`
4. The debugger connects to port 9229

**When to use:** Useful when the API is already running in a terminal and you only want to attach the debugger.

### 3. Debug Web (Chrome)

**Name:** `Debug Web (Chrome)`

Opens Chrome with the debugger attached to the frontend.

**How to use:**

1. Ensure the dev server is running (`pnpm run dev` in `apps/web`)
2. Select "Debug Web (Chrome)" in VSCode
3. Press `F5`
4. Chrome opens at `http://localhost:5173`
5. Set breakpoints in frontend `.ts` and `.tsx` files
6. Interact with the app and the debugger will stop at breakpoints

**Features:**

- TypeScript/React code debugging
- Variable inspection
- Integrated console
- Source maps enabled

### 4. Debug Web (Edge)

**Name:** `Debug Web (Edge)`

Same as Debug Web (Chrome), but uses Microsoft Edge.

**How to use:** Same steps as Chrome; Edge opens instead of Chrome.

### 5. Debug Full Stack (API + Web Chrome)

**Name:** `Debug Full Stack (API + Web Chrome)`

Starts the API and frontend in Chrome **simultaneously**.

**How to use:**

1. Select "Debug Full Stack (API + Web Chrome)"
2. Press `F5`
3. Both debuggers start
4. You can debug backend and frontend at the same time

**Features:**

- Full-stack debugging in a single session
- Breakpoints work in both API and Web
- Perfect for full flows (e.g., frontend request → API processing → response)

### 6. Debug Full Stack (API + Web Edge)

**Name:** `Debug Full Stack (API + Web Edge)`

Same as above, but uses Edge instead of Chrome.

## 🔧 Nodemon Configuration

The `apps/api/nodemon.json` file is configured to support debugging:

```json
{
  "exec": "node --inspect=0.0.0.0:9229 -r ts-node/register -r tsconfig-paths/register src/main.ts"
}
```

The `--inspect=0.0.0.0:9229` flag enables the debugger on port 9229.

## 💡 Usage Tips

### Breakpoints

- Click the left editor margin (next to line numbers) to add breakpoints
- Conditional breakpoints: right-click a breakpoint → "Edit Breakpoint"
- Logpoints: add logs without changing code

### Debug Console

- Use the Debug Console (Ctrl+Shift+Y) to run code in the current context
- Evaluate variables, run functions, etc.

### Watch

- Add expressions in the "Watch" tab to monitor values in real time
- Useful for tracking changes in complex objects

### Call Stack

- View the call stack in the "Call Stack" tab
- Navigate frames to inspect context

### Variables

- Inspect all variables in the current scope
- Expand objects to see their properties

## 🐛 Troubleshooting

### API does not connect to the debugger

- Verify port 9229 is not in use
- Restart VSCode
- Verify nodemon is configured correctly

### Web does not open in the browser

- Ensure the dev server is running at `http://localhost:5173`
- Verify port 5173 is available
- Install "Debugger for Chrome" or "Debugger for Microsoft Edge"

### Breakpoints do not work

- Verify source maps are enabled
- Ensure code is compiled
- Try reloading the VSCode window (Ctrl+Shift+P → "Reload Window")

### Debug Full Stack does not start

- Verify both apps can start individually
- Ensure there are no port conflicts
- Try starting each debugger separately first

## 📚 Additional Resources

- [VSCode Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [Node.js Debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
- [Browser Debugging](https://code.visualstudio.com/docs/nodejs/browser-debugging)

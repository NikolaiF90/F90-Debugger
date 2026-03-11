# F90 Debugger
**A standalone debug UI for AI Dungeon scripts**
by PrinceF90

---

## What it is

F90 Debugger is a lightweight, standalone debug tool for AI Dungeon scripting. It gives you a visible in-game console — a story card — where your script can log messages in real time. Built for developers, not players.

It is intentionally decoupled from any specific project. Drop it into any AID script without modification.

---

## What it is not

This is not a plug-and-play tool for players. It is a developer tool. The console is visible in-game, logs are raw, and nothing is prettified for end users.

---

## Package contents

```
library.js              — F90 Debugger source. Include this in your scenario's Library script.
README_F90Debugger.md   — This file.
```

---

## Configuration

Inside `library.js`, at the top, you will find:

```javascript
const F90_DEBUG_CONFIG =
{
  DEBUG_MODE: false,
  MAX_LINES:  50,
  CARD_TITLE: "F90 Debug UI",
}
```

Set `DEBUG_MODE` to `true` to activate. Set it back to `false` when done — the card will be automatically removed.

Do not rename the story card in-game. If the card title does not match `CARD_TITLE`, the debugger will fail and output a message to AID's native console.

---

## Hook wiring

The package does not include `context.js` and `output.js` — those are yours. You need to wire F90 Debugger into them manually.

### context.js

```javascript
F90Debug("context");

// Your context script goes here
```

`F90Debug("context")` handles card creation and command processing. It should run before your script so the card is ready.

### output.js

```javascript
// Your script goes here
F90Debug("output");
const modifier = (text) => {
  return { text }
}
modifier(text)
```

`F90Debug("output")` **must be the last thing your script calls before the modifier.** It flushes and trims the log. If it runs too early, anything your script logs after that point will not appear until the next hook.

---

## Logging

Call `debugLog()` anywhere inside your script to queue a log entry.

```javascript
debugLog("yourFunctionName", "your message here");
```

Logs are timestamped, batched, and flushed to the card at the end of every output hook.

---

## Custom Commands

You can run commands directly from the in-game story card's entry field. The Debugger ships with no built-in commands — you register your own.

```javascript
// Call this during your script's init
registerDebugCommand("CLEAR LOG", () =>
{
  const card = storyCards.find(c => c.title === F90_DEBUG_CONFIG.CARD_TITLE);
  if (card) card.description = "[F90 Debug UI - logs appear below]";
  debugLog("command", "Log cleared");
});
```

To run a command in-game: open the `F90 Debug UI` story card, type your command into the entry field, and take any action. The command executes on the next context hook and the entry field clears automatically.

Commands match by exact name or prefix — so a registered key of `SET:` will match any command starting with `SET:`.

---

## Failure behavior

F90 Debugger does not auto-repair. If the story card is missing or renamed:
- All functions that depend on the card exit early
- A message is sent to AID's native console via `log()`
- Nothing surfaces in-game

To fix: ensure the story card title matches `F90_DEBUG_CONFIG.CARD_TITLE` exactly.

---

## Quick reference

| What | Where |
|---|---|
| `F90Debug("context")` | Top of context.js |
| `F90Debug("output")` | Last call in output.js, before modifier |
| `debugLog("fn", "msg")` | Anywhere in your script |
| `registerDebugCommand("CMD", handler)` | Your script's init block |

## Credits
When using including this tool in your script, credit is not needed, but appreciated.

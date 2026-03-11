// ============================================
// F90 Debugger - Standalone debug UI for AID scripts
// v1.0.0 by PrinceF90
//
// Quick Reference:
// 1. Set DEBUG_MODE: true in F90_DEBUG_CONFIG to activate
// 2. Call initF90Debug() in your library init block
// 3. Call F90Debug(hook) in your context and output scripts
// 4. Use debugLog("funcName", "message") anywhere to log
// 5. Use registerDebugCommand("CMD", handler) for custom commands
//
// Full guide: https://github.com/NikolaiF90/F90-Debugger/tree/main
// ============================================

// Cfg for F90 Debugger
const F90_DEBUG_CONFIG =
{
  DEBUG_MODE: true,
  MAX_LINES:  50,
  CARD_TITLE: "F90 Debug UI",
}

// Initialize the debugger
function initF90Debug()
{
  if (!state.f90Debug) state.f90Debug = { messages: [] };
}

// Logger
function debugLog(funcName, message)
{
  if (!F90_DEBUG_CONFIG.DEBUG_MODE) return;

  const now  = new Date();
  const h    = now.getUTCHours().toString().padStart(2, "0");
  const m    = now.getUTCMinutes().toString().padStart(2, "0");
  const s    = now.getUTCSeconds().toString().padStart(2, "0");
  const line = `[${h}:${m}:${s}] ${funcName} > ${message}`;

  state.f90Debug.messages.push(line);
}

// Initialize the UI
function initDebugCard()
{
  if (!F90_DEBUG_CONFIG.DEBUG_MODE)
  {
    const idx = storyCards.findIndex(c => c.title === F90_DEBUG_CONFIG.CARD_TITLE);
    if (idx !== -1) storyCards.splice(idx, 1);
    return;
  }

  const existing = storyCards.find(c => c.title === F90_DEBUG_CONFIG.CARD_TITLE);
  if (existing) return;

  storyCards.push(
  {
    title:        F90_DEBUG_CONFIG.CARD_TITLE,
    type:         "Other",
    keys:         "f90_debug",
    entry:        "",
    description:  "[F90 Debug UI - logs appear below]"
  });
}

// Flush every logs from buffer into the UI
function flushDebugLog()
{
  if (!F90_DEBUG_CONFIG.DEBUG_MODE) return;
  if (!state.f90Debug.messages || state.f90Debug.messages.length === 0) return;

  const card = storyCards.find(c => c.title === F90_DEBUG_CONFIG.CARD_TITLE);
  if (!card)
  {
    log("F90 Debugger: card not found. Was it renamed or deleted?");
    return;
  }

  card.description = (card.description || "") + "\n" + state.f90Debug.messages.join("\n");
  state.f90Debug.messages = [];
}

// Keep everything within set limit
function trimDebugLog()
{
  if (!F90_DEBUG_CONFIG.DEBUG_MODE) return;

  const card = storyCards.find(c => c.title === F90_DEBUG_CONFIG.CARD_TITLE);
  if (!card)
  {
    log("F90 Debugger: card not found. Was it renamed or deleted?");
    return;
  }

  const lines = (card.description || "").split("\n").filter(l => l.trim() !== "");
  if (lines.length > F90_DEBUG_CONFIG.MAX_LINES)
  {
    card.description = lines.slice(-F90_DEBUG_CONFIG.MAX_LINES).join("\n");
  }
}

const f90DebugCommands = {};

function registerDebugCommands(name, handler)
{
    f90DebugCommands[name] = handler;
}

function processDebugCommands()
{
    if (!F90_DEBUG_CONFIG.DEBUG_MODE) return;

    const card = storyCards.find(c => c.title === F90_DEBUG_CONFIG.CARD_TITLE);
    if (!card)
    {
        log("F90 Debugger: card not found. Was it renamed or deleted?");
        return;
    }

    if (!card.entry || card.entry.trim() === "") return;

    const commands = card.entry.trim().split("\n");

    for (const command of commands)
    {
        const cmd = command.trim();
        const matchedKey = Object.keys(f90DebugCommands).find(key => cmd === key || cmd.startsWith(key));

        if (matchedKey)
        {
            f90DebugCommands[matchedKey](cmd);
        }
        else
        {
            debugLog("processDebugCommands", `Unknown command: ${cmd}`);
        }
    }

    card.entry = "";
}

function F90Debug(hook)
{
    if (hook === "context")
    {
        initDebugCard();
        processDebugCommands();
    }

    if (hook === "output")
    {
        flushDebugLog();
        trimDebugLog();
    }
}

// ============================================
// 
// END OF F90 DEBUGGER. OTHER SCRIPT GOES BELOW
//
// ============================================

// Check if we are running in Electron using the user agent
export function isRunningInElectron() {
  return navigator.userAgent.toLowerCase().indexOf(" electron/") > -1
}

// Opened inside a music studio's window (YuE2, MiniMax, ACE-Step studios):
// the soundfont comes from the studio, not from the internet.
export function isRunningInStudio() {
  return (
    new URLSearchParams(window.location.search).get("studio") === "1" &&
    window.parent !== window
  )
}

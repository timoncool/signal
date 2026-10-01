export function getPlatform() {
  const platform = navigator.platform.toLowerCase()
  let os = null

  if (platform.indexOf("win") >= 0) {
    os = "Windows"
  } else if (platform.indexOf("mac") >= 0) {
    os = "macOS"
  }

  return os
}

export function isRunningInElectron() {
  // Check if we are running in Electron using the user agent
  return navigator.userAgent.toLowerCase().indexOf(" electron/") > -1
}

// Opened inside a music studio's window (YuE2, MiniMax, ACE-Step studios):
// the studio hands the song in and keeps it, so the cloud, the autosave and
// anything that calls out to the internet stay off.
export function isRunningInStudio() {
  return (
    new URLSearchParams(window.location.search).get("studio") === "1" &&
    window.parent !== window
  )
}

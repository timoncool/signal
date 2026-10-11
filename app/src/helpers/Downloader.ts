function download(url: string, name = "noname") {
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// http://stackoverflow.com/a/33622881/1567777
export function downloadBlob(blob: Blob, fileName: string) {
  // Inside a studio's window a download link goes nowhere: the studio asks
  // where to save and writes the file itself.
  if (window.parent !== window) {
    void blob.arrayBuffer().then((data) =>
      window.parent.postMessage(
        { signal: true, type: "save", name: fileName, data },
        window.location.origin,
        [data],
      ),
    )
    return
  }
  const url = window.URL.createObjectURL(blob)
  download(url, fileName)
  setTimeout(() => {
    return window.URL.revokeObjectURL(url)
  }, 1000)
}

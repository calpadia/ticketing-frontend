export function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime) // High pitch
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1) // Drop to lower pitch
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch (e) {
    console.error('Audio playback failed', e)
  }
}

export function showBrowserNotification(title, options) {
  if (!("Notification" in window)) return
  
  if (Notification.permission === "granted") {
    new Notification(title, options)
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, options)
      }
    })
  }
}

export function triggerNotification(title, body) {
  playNotificationSound()
  showBrowserNotification(title, {
    body,
    icon: '/favicon.ico' // Or any app icon if available
  })
}

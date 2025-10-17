const $ = sel => document.querySelector(sel)
const $all = sel => Array.from(document.querySelectorAll(sel))

const urlInput = $('#url')
const probeBtn = $('#probe')
const infoCard = $('#info')
const titleEl = $('#title')
const metaEl = $('#meta')
const formatsTableEl = $('#formatsTable')

probeBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim()
  if (!url) return alert('Please enter a YouTube URL')
  
  probeBtn.disabled = true
  probeBtn.textContent = 'Fetching...'
  
  try {
    const res = await fetch('/api/formats?url=' + encodeURIComponent(url))
    const data = await res.json()
    
    if (data.error) throw new Error(data.error)
    
    renderInfo(data)
  } catch (e) {
    alert('Error: ' + e.message)
  } finally {
    probeBtn.disabled = false
    probeBtn.textContent = 'Probe Formats'
  }
})

function renderInfo(info) {
  titleEl.textContent = info.title || 'Unknown Title'
  metaEl.textContent = `by ${info.uploader || 'unknown'}`
  
  if (!info.formats || info.formats.length === 0) {
    formatsTableEl.innerHTML = '<p style="color: var(--muted)">No formats available</p>'
    infoCard.classList.remove('hidden')
    return
  }
  
  // Create table
  const table = document.createElement('table')
  
  // Header
  const thead = document.createElement('thead')
  thead.innerHTML = `
    <tr>
      <th>Quality</th>
      <th>Type</th>
      <th></th>
    </tr>
  `
  table.appendChild(thead)
  
  // Body
  const tbody = document.createElement('tbody')
  
  info.formats.forEach(f => {
    const tr = document.createElement('tr')
    
    // Quality column
    const qualityTd = document.createElement('td')
    const qualityDiv = document.createElement('div')
    qualityDiv.className = 'quality-cell'
    qualityDiv.innerHTML = `<strong>${f.quality}</strong>`
    if (f.label) {
      qualityDiv.innerHTML += `<span class="quality-badge">${f.label}</span>`
    }
    qualityTd.appendChild(qualityDiv)
    
    // Type column
    const typeTd = document.createElement('td')
    const typeSpan = document.createElement('span')
    typeSpan.className = 'type-badge'
    if (f.type === 'Audio Only') {
      typeSpan.className += ' type-audio'
      typeSpan.innerHTML = '🎵 Audio Only'
    } else if (f.type === 'Video + Audio') {
      typeSpan.className += ' type-video-audio'
      typeSpan.innerHTML = '🎬 Video + Audio'
    } else {
      typeSpan.textContent = f.type
    }
    typeTd.appendChild(typeSpan)
    
    // Download button column
    const downloadTd = document.createElement('td')
    const btn = document.createElement('button')
    btn.className = 'download-btn'
    btn.innerHTML = '⚡ Download'
    btn.onclick = () => startDownload(urlInput.value.trim(), f.format_id)
    downloadTd.appendChild(btn)
    
    tr.appendChild(qualityTd)
    tr.appendChild(typeTd)
    tr.appendChild(downloadTd)
    tbody.appendChild(tr)
  })
  
  table.appendChild(tbody)
  formatsTableEl.innerHTML = ''
  formatsTableEl.appendChild(table)
  
  infoCard.classList.remove('hidden')
}

function startDownload(url, format_id) {
  const dlUrl = `/api/download?url=${encodeURIComponent(url)}&format_id=${encodeURIComponent(format_id)}&audio=false`
  
  // Trigger download
  const a = document.createElement('a')
  a.href = dlUrl
  a.download = ''
  document.body.appendChild(a)
  a.click()
  a.remove()
}

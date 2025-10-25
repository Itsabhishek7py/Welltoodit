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
  
  // Body (optimized section)
  const tbody = document.createElement('tbody')
  tbody.innerHTML = info.formats.map(f => `
    <tr>
      <td>
        <div class="quality-cell">
          <strong>${f.quality}</strong>
          ${f.label ? `<span class="quality-badge">${f.label}</span>` : ''}
        </div>
      </td>
      <td>
        <span class="type-badge ${
          f.type === 'Audio Only' ? 'type-audio' :
          f.type === 'Video + Audio' ? 'type-video-audio' : ''
        }">
          ${f.type === 'Audio Only' ? '🎵 Audio Only' :
            f.type === 'Video + Audio' ? '🎬 Video + Audio' : f.type}
        </span>
      </td>
      <td>
        <button class="download-btn" onclick="startDownload('${urlInput.value.trim()}', '${f.format_id}')">
          ⚡ Download
        </button>
      </td>
    </tr>
  `).join('')
  
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

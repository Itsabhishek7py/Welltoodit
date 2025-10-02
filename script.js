document.addEventListener('DOMContentLoaded', () => {
    const notepad = document.getElementById('notepad');
    const clearBtn = document.getElementById('clearBtn');
    const newNoteBtn = document.getElementById('newNoteBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const charCount = document.getElementById('charCount');
    const saveStatus = document.getElementById('saveStatus');

    let saveTimeout;

    // Load saved note
    const loadNote = () => {
        const savedNote = localStorage.getItem('userNote');
        if (savedNote) {
            notepad.value = savedNote;
            updateCharCount();
        }
    };

    // Update character count
    const updateCharCount = () => {
        const count = notepad.value.length;
        charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    };

    // Save note with delay
    const saveNote = () => {
        clearTimeout(saveTimeout);
        saveStatus.className = 'saving';
        saveStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        saveTimeout = setTimeout(() => {
            localStorage.setItem('userNote', notepad.value);
            saveStatus.className = 'saved';
            saveStatus.innerHTML = '<i class="fas fa-check"></i> Saved';
            
            // Reset status after 3 seconds
            setTimeout(() => {
                saveStatus.className = '';
                saveStatus.textContent = 'All changes saved';
            }, 3000);
        }, 1000);
    };

    // Clear note
    const clearNote = () => {
        if (!notepad.value) return;
        
        if (confirm('Are you sure you want to clear the note? This cannot be undone.')) {
            notepad.value = '';
            localStorage.removeItem('userNote');
            updateCharCount();
            saveStatus.className = '';
            saveStatus.textContent = 'Note cleared';
            notepad.focus();
        }
    };

    // Create new note
    const createNewNote = () => {
        if (notepad.value && confirm('Create new note? Current note will be saved.')) {
            localStorage.setItem('userNote', notepad.value);
            notepad.value = '';
            updateCharCount();
            notepad.focus();
        } else if (!notepad.value) {
            notepad.focus();
        }
    };

    // Download note
    const downloadNote = () => {
        if (!notepad.value) {
            alert('Please write something before downloading');
            return;
        }
        
        const blob = new Blob([notepad.value], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.href = url;
        a.download = `note-${timestamp}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Event listeners
    notepad.addEventListener('input', () => {
        updateCharCount();
        saveNote();
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            downloadNote();
        } else if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            createNewNote();
        }
    });

    clearBtn.addEventListener('click', clearNote);
    newNoteBtn.addEventListener('click', createNewNote);
    downloadBtn.addEventListener('click', downloadNote);

    // Initialize
    loadNote();
    updateCharCount();
    notepad.focus();
});
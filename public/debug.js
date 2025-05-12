document.addEventListener('DOMContentLoaded', () => {
    const debugToggle   = document.getElementById('debug-toggle');
    const debugWindow   = document.getElementById('debug-window');
    const debugPrompt   = document.getElementById('debug-prompt');
    const debugResponse = document.getElementById('debug-response');
    const debugError    = document.getElementById('debug-error');
  
    let lastPrompt   = '';
    let lastResponse = '';
    let lastError    = '';
  
    // Intercept fetch to /api/generate to capture prompt & response/error
    const origFetch = window.fetch;
    window.fetch = async (...args) => {
      if (typeof args[0] === 'string' && args[0].endsWith('/api/generate')) {
        try {
          const body = JSON.parse(args[1].body);
          lastPrompt = body.draft || '';
          debugPrompt.textContent = lastPrompt;
        } catch (e) { /* ignore parse errors */ }
      }
  
      const response = await origFetch(...args);
  
      if (typeof args[0] === 'string' && args[0].endsWith('/api/generate')) {
        response.clone().json()
          .then(data => {
            lastResponse = data.content || '';
            debugResponse.textContent = lastResponse;
          })
          .catch(err => {
            lastError = err.message;
            debugError.textContent = lastError;
          });
      }
  
      return response;
    };
  
    // Show/hide the debug window
    debugToggle.addEventListener('click', () => {
      const isOpen = debugWindow.style.display === 'block';
      debugWindow.style.display = isOpen ? 'none' : 'block';
      debugToggle.textContent = isOpen
        ? 'Open Debug Window'
        : 'Hide Debug Window';
      // Refresh contents
      debugPrompt.textContent   = lastPrompt;
      debugResponse.textContent = lastResponse;
      debugError.textContent    = lastError;
    });
  });
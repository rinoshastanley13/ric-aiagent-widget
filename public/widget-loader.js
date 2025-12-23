(function () {
    // Read the configuration from the script tag
    // The script tag that loaded this file is the last one in the document usually, 
    // or we can look for specific attributes if we gave it an ID.
    // Better: look for the script tag by src partially matching "widget-loader.js"

    var scriptParams = {};
    var scripts = document.getElementsByTagName('script');
    var myScript = null;

    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src && scripts[i].src.indexOf('widget-loader.js') !== -1) {
            myScript = scripts[i];
            break;
        }
    }

    if (!myScript) {
        console.error('Chat Widget: Could not find loader script tag.');
        return;
    }

    var key = myScript.getAttribute('data-key');
    var id = myScript.getAttribute('data-id');
    var host = myScript.getAttribute('data-host') || 'http://localhost:3000'; // Default to localhost for dev

    if (!key || !id) {
        console.error('Chat Widget: Missing data-key or data-id attributes.');
        return;
    }

    // Create the container
    var container = document.createElement('div');
    container.id = 'ric-chat-widget-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.width = '480px';
    container.style.maxWidth = '90vw';
    container.style.height = '700px';
    container.style.maxHeight = '88vh';
    container.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    container.style.borderRadius = '50px';
    container.style.overflow = 'hidden';
    container.style.zIndex = '999999';
    container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    container.style.background = 'white'; // Ensure white background
    // Start hidden or minimized? For now, let's just show it.
    // Real implementation might start as a "bubble" launcher.

    // Create the iframe
    var iframe = document.createElement('iframe');
    iframe.src = host + '/widget?key=' + encodeURIComponent(key) + '&id=' + encodeURIComponent(id);
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.setAttribute('allow', 'clipboard-read; clipboard-write'); // Permissions

    container.appendChild(iframe);
    document.body.appendChild(container);

    // Optional: Message listener for "close" or "minimize" events from iframe
    window.addEventListener('message', function (event) {
        // Validate origin if needed in production
        if (event.data === 'close-widget') {
            container.style.display = 'none';
        }
    });

})();

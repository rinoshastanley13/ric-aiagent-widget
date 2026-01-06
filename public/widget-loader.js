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
    container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    container.style.overflow = 'hidden';
    container.style.zIndex = '999999';
    container.style.transition = 'opacity 0.3s ease, transform 0.3s ease, width 0.3s ease, height 0.3s ease, border-radius 0.3s ease, bottom 0.3s ease, right 0.3s ease';

    function updateWidgetStyles() {
        var isMobile = window.innerWidth <= 480;

        if (isMobile) {
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.bottom = '0px';
            container.style.right = '0px';
            container.style.borderRadius = '0px';
        } else {
            container.style.width = '480px';
            container.style.height = '600px';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.borderRadius = '20px';
        }
    }

    // Initial styles
    updateWidgetStyles();

    // Responsive listener
    window.addEventListener('resize', updateWidgetStyles);
    // Start hidden or minimized? For now, let's just show it.
    // Real implementation might start as a "bubble" launcher.

    // Create the iframe
    var iframe = document.createElement('iframe');
    iframe.src = host + '/widget'; // No params, clean URL
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.setAttribute('allow', 'clipboard-read; clipboard-write'); // Permissions

    container.appendChild(iframe);
    document.body.appendChild(container);

    // Bridge Logic
    window.addEventListener('message', function (event) {
        // Validate origin if needed in production
        if (event.data === 'close-widget') {
            container.style.display = 'none';
        }

        if (event.data && event.data.type === 'WIDGET_READY') {
            // Widget is ready, send the context
            console.log('Loader: Sending INIT_WIDGET');
            var payload = {
                app_unique_key: key,
                app_id: id,
                // Pass optional user data if available
                user_name: myScript.getAttribute('data-name'),
                user_email: myScript.getAttribute('data-email'),
                tenantId: myScript.getAttribute('data-tenant-id'),
                company: myScript.getAttribute('data-company-name')
            };

            // Send to iframe
            // We need to use the contentWindow of the iframe
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'INIT_WIDGET',
                    payload: payload
                }, '*'); // Target origin '*' for now
            }
        }
    });

})();

(function () {
    // Read the configuration from the script tag
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
    var host = myScript.getAttribute('data-host') || 'http://localhost:3000';

    if (!key || !id) {
        console.error('Chat Widget: Missing data-key or data-id attributes.');
        return;
    }

    // Create the chat button
    var chatButton = document.createElement('div');
    chatButton.id = 'ric-chat-button';
    chatButton.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="white"/>
            <circle cx="8" cy="10" r="1.5" fill="#1d549f"/>
            <circle cx="12" cy="10" r="1.5" fill="#1d549f"/>
            <circle cx="16" cy="10" r="1.5" fill="#1d549f"/>
        </svg>
    `;

    // Base button styles
    chatButton.style.position = 'fixed';
    chatButton.style.background = 'linear-gradient(135deg, #22c55e, #1d549f)';
    chatButton.style.borderRadius = '50%';
    chatButton.style.cursor = 'pointer';
    chatButton.style.display = 'flex';
    chatButton.style.alignItems = 'center';
    chatButton.style.justifyContent = 'center';
    chatButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    chatButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    chatButton.style.zIndex = '999998';

    function updateButtonStyles() {
        var isMobile = window.innerWidth <= 480;
        if (isMobile) {
            chatButton.style.width = '50px';
            chatButton.style.height = '50px';
            chatButton.style.bottom = '15px';
            chatButton.style.right = '15px';
        } else {
            chatButton.style.width = '60px';
            chatButton.style.height = '60px';
            chatButton.style.bottom = '20px';
            chatButton.style.right = '20px';
        }
    }

    updateButtonStyles();

    // Hover effects
    chatButton.addEventListener('mouseenter', function () {
        chatButton.style.transform = 'scale(1.1)';
        chatButton.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
    });

    chatButton.addEventListener('mouseleave', function () {
        chatButton.style.transform = 'scale(1)';
        chatButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });

    document.body.appendChild(chatButton);

    // Create the widget container
    var container = document.createElement('div');
    container.id = 'ric-chat-widget-container';
    container.style.position = 'fixed';
    container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    container.style.overflow = 'hidden';
    container.style.zIndex = '999999';
    container.style.transition = 'opacity 0.3s ease, transform 0.3s ease, width 0.3s ease, height 0.3s ease, border-radius 0.3s ease, bottom 0.3s ease, right 0.3s ease';
    container.style.display = 'none'; // Start hidden
    container.style.opacity = '0';
    container.style.transform = 'scale(0.9)';

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

    updateWidgetStyles();

    // Responsive listener
    window.addEventListener('resize', function () {
        updateWidgetStyles();
        updateButtonStyles();
    });

    // Create the iframe
    var iframe = document.createElement('iframe');
    iframe.src = host + '/widget';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.setAttribute('allow', 'clipboard-read; clipboard-write');

    container.appendChild(iframe);
    document.body.appendChild(container);

    // Toggle functionality
    var isWidgetOpen = false;

    chatButton.addEventListener('click', function () {
        if (!isWidgetOpen) {
            // Open widget
            chatButton.style.opacity = '0';
            chatButton.style.transform = 'scale(0.8)';

            setTimeout(function () {
                chatButton.style.display = 'none';
                container.style.display = 'block';

                setTimeout(function () {
                    container.style.opacity = '1';
                    container.style.transform = 'scale(1)';
                }, 10);
            }, 200);

            isWidgetOpen = true;
        }
    });

    // Bridge Logic
    window.addEventListener('message', function (event) {
        if (event.data === 'close-widget') {
            // Close widget and show button
            container.style.opacity = '0';
            container.style.transform = 'scale(0.9)';

            setTimeout(function () {
                container.style.display = 'none';
                chatButton.style.display = 'flex';

                setTimeout(function () {
                    chatButton.style.opacity = '1';
                    chatButton.style.transform = 'scale(1)';
                }, 10);
            }, 300);

            isWidgetOpen = false;
        }

        if (event.data && event.data.type === 'WIDGET_READY') {
            console.log('Loader: Sending INIT_WIDGET');
            var payload = {
                app_unique_key: key,
                app_id: id,
                user_name: myScript.getAttribute('data-name'),
                user_email: myScript.getAttribute('data-email'),
                tenantId: myScript.getAttribute('data-tenant-id'),
                company: myScript.getAttribute('data-company-name')
            };

            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'INIT_WIDGET',
                    payload: payload
                }, '*');
            }
        }
    });

})();

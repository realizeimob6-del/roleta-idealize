const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const target = tabs.find(t => t.url.includes('roleta-idealize'));
    if (!target) {
      console.log('Tab not found');
      return;
    }
    const wsUrl = new URL(target.webSocketDebuggerUrl);
    
    // Connect via HTTP Upgrade
    const req = http.request({
      hostname: wsUrl.hostname,
      port: wsUrl.port,
      path: wsUrl.pathname,
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket',
        'Sec-WebSocket-Key': Buffer.from('1234567890123456').toString('base64'),
        'Sec-WebSocket-Version': '13'
      }
    });

    req.on('upgrade', (response, socket, head) => {
      console.log('Connected to Chrome DevTools Protocol!');

      function send(method, params, id = 1) {
        const payload = Buffer.from(JSON.stringify({ id, method, params }));
        let header;
        if (payload.length < 126) {
          header = Buffer.from([0x81, 0x80 | payload.length, 0x12, 0x34, 0x56, 0x78]);
        } else {
          header = Buffer.alloc(8);
          header[0] = 0x81;
          header[1] = 0x80 | 126;
          header.writeUInt16BE(payload.length, 2);
          header.writeUInt32BE(0x12345678, 4);
        }
        const masked = Buffer.alloc(payload.length);
        const mask = Buffer.from([0x12, 0x34, 0x56, 0x78]);
        for (let i = 0; i < payload.length; i++) {
          masked[i] = payload[i] ^ mask[i % 4];
        }
        socket.write(Buffer.concat([header, masked]));
      }

      socket.on('data', (buf) => {
        const str = buf.toString();
        const jsonMatch = str.match(/\{.*\}$/s);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.id === 2) {
              console.log('Modal state:', parsed.result.result.value);
              // Now take screenshot
              send('Page.captureScreenshot', { format: 'png' }, 3);
            } else if (parsed.id === 3) {
              const fs = require('fs');
              fs.writeFileSync('modal_open.png', Buffer.from(parsed.result.data, 'base64'));
              console.log('Screenshot saved to modal_open.png!');
              process.exit(0);
            }
          } catch(e) {}
        }
      });

      // Enable Runtime and evaluate button click
      send('Runtime.enable', {}, 1);
      setTimeout(() => {
        send('Runtime.evaluate', {
          expression: `
            (() => {
              const btn = document.getElementById('btn-open-qr');
              const modal = document.getElementById('qr-modal');
              btn.click();
              const r = modal.getBoundingClientRect();
              return {
                open: modal.open,
                display: window.getComputedStyle(modal).display,
                visibility: window.getComputedStyle(modal).visibility,
                x: r.x,
                y: r.y,
                width: r.width,
                height: r.height,
                contentWidth: modal.querySelector('.modal-content') ? modal.querySelector('.modal-content').offsetWidth : 0,
                contentHeight: modal.querySelector('.modal-content') ? modal.querySelector('.modal-content').offsetHeight : 0,
                contentDisplay: modal.querySelector('.modal-content') ? window.getComputedStyle(modal.querySelector('.modal-content')).display : null
              };
            })()
          `,
          returnByValue: true
        }, 2);
      }, 500);
    });

    req.end();
  });
});

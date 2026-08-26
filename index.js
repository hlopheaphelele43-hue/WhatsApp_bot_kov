const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const P = require('pino');
async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({ auth: state, logger: P({level:'silent'}) });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u) => {
    if(u.qr){ qrcode.generate(u.qr,{small:true}); console.log('SCAN QR'); }
    if(u.connection==='open') console.log('CONNECTED');
  });
  sock.ev.on('messages.upsert', async m => {
    const msg=m.messages[0]; if(!msg.message||msg.key.fromMe) return;
    const txt=msg.message.conversation||msg.message.extendedTextMessage?.text||"";
    await sock.sendMessage(msg.key.remoteJid,{text:`You said: ${txt} - Bot working`});
  });
}
start();

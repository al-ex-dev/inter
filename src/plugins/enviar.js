import fs from 'fs';
import path from 'path';

const groupJIDs = {
    sls: "120363244235096720@g.us",
    dxx: "120363263508525367@g.us"
};

export default {
    name: 'enviar',
    description: 'Envía mensajes a la lista de números agregados',
    comand: ['enviar'],
    exec: async (m, { sock, delay }) => {
        const filePath = path.join(global.origen, 'temp.json')
        const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : {}

        let [sent, exist, numbers] = [0, 0, []]
        const respondedUsers = new Set()

        sock.ev.off('messages.upsert', () => { })

        sock.ev.on('messages.upsert', async (response) => {
            const msg = response.messages?.[0]
            if (!msg || !msg.message?.buttonsResponseMessage) return

            const number = msg.key.remoteJid.replace('@s.whatsapp.net', '')
            if (respondedUsers.has(number)) return

            respondedUsers.add(number)
            const id = msg.message.buttonsResponseMessage.selectedButtonId

            if (id === 'si') {
                await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor escriba la dirección del domicilio para confirmar la entrega.' })

                sock.ev.on('messages.upsert', async function addressResponse(addressMsg) {
                    const addr = addressMsg.messages?.[0]
                    if (addr?.key.remoteJid === msg.key.remoteJid && addr.message?.conversation) {
                        const groupName = Object.keys(data).find(group => data[group].some(num => num.replace(/\D/g, '') === number))
                        const groupJID = groupJIDs[groupName]
                        await sock.sendMessage(groupJID, { text: `📦 +${number} recibirá el paquete. Dirección: ${addr.message.conversation}` })
                        await sock.sendMessage(msg.key.remoteJid, { text: 'Gracias por su respuesta.' })
                        sock.ev.off('messages.upsert', addressResponse)
                    }
                })
            } else if (id === 'no') {
                await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor indique la razón por la cual no recibirá el paquete.' })

                sock.ev.on('messages.upsert', async function reasonResponse(reasonMsg) {
                    const reason = reasonMsg.messages?.[0]
                    if (reason?.key.remoteJid === msg.key.remoteJid && reason.message?.conversation) {
                        const groupName = Object.keys(data).find(group => data[group].some(num => num.replace(/\D/g, '') === number))
                        const groupJID = groupJIDs[groupName]
                        await sock.sendMessage(groupJID, { text: `❌ +${number} no recibirá el paquete. Razón: ${reason.message.conversation}` })
                        await sock.sendMessage(msg.key.remoteJid, { text: 'Gracias por su respuesta.' })

                        sock.ev.off('messages.upsert', reasonResponse)
                    }
                })
            }
        })

        for (const groupName in data) {
            const groupNumbers = data[groupName]
            const groupJID = groupJIDs[groupName]

            await Promise.all(groupNumbers.map(async (n) => {
                const number = `${n.replace(/\D/g, '')}@s.whatsapp.net`
                const valid = await sock.onWhatsApp(number).then(([w]) => w?.jid).catch(() => null)
                if (!valid) {
                    exist++
                    numbers.push(n)
                    return
                }

                await sock.sendMessage(valid, {
                    text: "¿Recibirá el paquete?",
                    footer: _config.bot.credits,
                    buttons: [
                        { buttonId: 'si', buttonText: { displayText: 'Sí, recibiré el paquete' }, type: 1 },
                        { buttonId: 'no', buttonText: { displayText: 'No, no recibiré el paquete' }, type: 1 }
                    ],
                    headerType: 1,
                    viewOnce: true
                })

                await delay(7000)
                sent++
            }))
        }

        await sock.sendMessage(m.from, { text: `📊 Estadísticas de envío:\n• Total en lista: ${Object.values(data).flat().length}\n• Enviados: ${sent}\n• Sin WhatsApp: ${exist}\n📝 Números inválidos: ${numbers.join(', ') || 'Ninguno'}` })
    }
}
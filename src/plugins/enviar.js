import fs from 'fs'
import path from 'path'

export default {
    name: 'enviar',
    description: 'Envía mensaje a usuarios de grupos (todos o de un grupo específico)',
    comand: ['enviar'],
    exec: async (m, { sock, delay }) => {
        const grp = m.args[0]?.toLowerCase()
        const dbPath = path.join(process.cwd(), 'database.json')
        const configPath = path.join(process.cwd(), 'config.json')
        let db = { data: {} }
        let config = { bot: { message: "¿Recibirá el paquete?" } }

        try {
            if (fs.existsSync(dbPath)) db = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))
        } catch {
            return sock.sendMessage(m.from, { text: 'Error al leer la base de datos.' })
        }

        try {
            if (fs.existsSync(configPath)) config = JSON.parse(await fs.promises.readFile(configPath, 'utf8'))
        } catch {
            return sock.sendMessage(m.from, { text: 'Error al leer el archivo de configuración.' })
        }

        let nums = grp ? db.data[grp] || [] : Object.values(db.data).flat()
        nums = [...new Set(nums)]
        let s = 0, f = 0
        let invalid = []
        for (const num of nums) {
            const jid = num.includes('@') ? num : num + '@s.whatsapp.net'
            const valid = await sock.onWhatsApp(num).then(([w]) => w?.jid).catch(() => null)
            if (!valid) {
                f++
                invalid.push(num)
                continue
            }
            try {
                await sock.presenceSubscribe(jid)
                await delay(500)

                await sock.sendPresenceUpdate('composing', jid)
                await delay(2000)

                await sock.sendPresenceUpdate('paused', jid)
                await sock.sendMessage(jid, {
                    image: { url: "./inter.jpg" },
                    caption: config.bot.message.replace("@barrio", grp[barrio]),
                    footer: _config.bot.credits,
                    buttons: [
                        { buttonId: '.process_si', buttonText: { displayText: 'Sí, recibiré el paquete' }, type: 1 },
                        { buttonId: '.process_no', buttonText: { displayText: 'No, no recibiré el paquete' }, type: 1 }
                    ],
                    headerType: 1,
                    viewOnce: true
                })
                s++
            } catch {
                f++
            }
            await delay(5000)
        }
        await sock.sendMessage(m.from, { text: `📊 Estadísticas\nTotal en lista: ${nums.length}\nEnviado a ${s} usuario(s)${f ? `\nSin Whatsapp: ${f}\n📝 Números inválidos: ${invalid.join(', ')}` : ''}.` })
    }
}
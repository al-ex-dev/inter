import fs from 'fs'
import path from 'path'

export default {
    name: 'enviar',
    description: 'Envía mensaje a usuarios de grupos (todos o de un grupo específico)',
    comand: ['enviar'],
    exec: async (m, { sock }) => {
        const grp = m.args[0]?.toLowerCase()
        const dbPath = path.join(process.cwd(), 'database.json')
        let db = { data: {} }
        try {
            if (fs.existsSync(dbPath))
                db = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))
        } catch {
            return sock.sendMessage(m.from, { text: 'Error al leer la base de datos.' })
        }
        let nums = grp ? db.data[grp] || [] : Object.values(db.data).flat()
        nums = [...new Set(nums)]
        let s = 0, f = 0
        for (const num of nums) {
            const jid = num.includes('@') ? num : num + '@s.whatsapp.net'
            const valid = await sock.onWhatsApp(num).then(([w]) => w?.jid).catch(() => null)
            if (!valid) {
                f++
                continue
            }
            try {
                await sock.sendMessage(jid, {
                    text: "¿Recibirá el paquete?",
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
        }
        sock.sendMessage(m.from, { text: `Enviado a ${s} usuario(s)${f ? `, fallos en ${f}` : ''}.` })
    }
}
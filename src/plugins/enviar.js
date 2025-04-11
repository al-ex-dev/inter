import fs from 'fs'
import path from 'path'
export default {
    name: 'enviar',
    description: 'Envía mensaje a usuarios de grupos (todos o de un grupo específico)',
    comand: ['enviar'],
    exec: async (m, { sock, delay }) => {
        const g = m.args[0]?.toLowerCase()
        const dbP = path.join(process.cwd(), 'database.json')
        const cfgP = path.join(process.cwd(), 'config.json')
        let db = { data: {} }

        let barrios = {
            "stm": "Santa Maria",
            "sls": "San Luis",
            "20j": "20 de julio",
            "7da": "7 de abril",
            "gar": "Gardenias",
            "lsr": "La sierrita",
            "lam": "Las Américas",
            "std": "Santo Domingo",
            "vsc": "Villa San Carlos",
            "vsp": "Villa San Pedro",
            "crz": "Carrizal"
        }
        let cfg = { bot: { message: '¿Recibirá el paquete?' } }
        try {
            if (fs.existsSync(dbP)) db = JSON.parse(await fs.promises.readFile(dbP, 'utf8'))
        } catch {
            return sock.sendMessage(m.from, { text: 'Error al leer la base de datos.' })
        }
        try {
            if (fs.existsSync(cfgP)) cfg = JSON.parse(await fs.promises.readFile(cfgP, 'utf8'))
        } catch {
            return sock.sendMessage(m.from, { text: 'Error al leer el archivo de configuración.' })
        }
        let nums = g ? Object.keys(db.data[g] || {}) : Object.keys(db.data).flatMap(k => Object.keys(db.data[k]))
        nums = [...new Set(nums)]
        let s = 0, f = 0, inv = []

        await sock.sendMessage(m.from, { text: 'Procesando su solicitud...' })
        for (const n of nums) {
            const u = db.data[g]?.[n] || {}
            const jid = n.includes('@') ? n : n + '@s.whatsapp.net'
            const ok = await sock.onWhatsApp(n).then(([w]) => w?.jid).catch(() => null)
            if (!ok) {
                f++
                inv.push(n)
                continue
            }
            try {
                await sock.presenceSubscribe(jid)
                await delay(500)
                await sock.sendPresenceUpdate('composing', jid)
                await delay(2000)
                await sock.sendPresenceUpdate('paused', jid)
                const msg = cfg.bot.message
                    .replace('@guia', u.guia || 'N/A')
                    .replace('@valor', u.valor || 'N/A')
                    .replace('@direccion', u.direccion || 'N/A')
                    .replace('@ciudad', u.ciudad || 'N/A')
                    .replace('@nombre', u.nombre || 'N/A')
                await sock.sendMessage(jid, {
                    image: { url: './inter.jpg' },
                    caption: msg.replace("@barrio", barrios[g] || g),
                    footer: cfg.bot.credits,
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
        sock.sendMessage(m.from, {
            text: `📊 Estadísticas
Total en lista: ${nums.length}
Enviado a ${s} usuario(s)${f ? `

Sin Whatsapp: ${f}
📝 Números inválidos: ${inv.join(', ')}` : ''}.`
        })
    }
}

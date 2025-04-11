import fs from 'fs'
import path from 'path'

const groups = ["std", "7da", "lam", "gar", "LSr", "vsc", "20j", "vsp", "stm", "sls", "crz"]

export default {
    name: 'agregar',
    description: 'Agrega números a la lista de envío',
    comand: ['agregar'],
    exec: async (m, { sock }) => {
        const groupName = m.args[0] && m.args[0].toLowerCase()
        if (!groupName) return sock.sendMessage(m.from, { text: 'Especifica el nombre del grupo.' })
        if (!groups.includes(groupName)) return sock.sendMessage(m.from, { text: `Grupo inválido. Permisos: ${groups.join(', ')}` })

        const str = m.text.slice(m.text.indexOf(groupName) + groupName.length).trim()
        if (!str) return sock.sendMessage(m.from, { text: 'Especifica números a agregar.' })

        const nums = str.split(',').map(n => n.trim().replace(/\D/g, '')).filter(n => n)

        if (!nums.length) return sock.sendMessage(m.from, { text: 'No hay números válidos.' })

        const dbPath = path.join(process.cwd(), 'database.json')
        let db = { data: {} }

        try {
            if (fs.existsSync(dbPath)) db = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'));
        } catch {
            return sock.sendMessage(m.from, { text: 'Error al leer la base de datos.' });
        }

        db.data[groupName] = db.data[groupName] || [];
        let count = 0
        nums.forEach(num => {
            if (!db.data[groupName].includes(num)) {
                db.data[groupName].push(num)
                count++
            }
        })

        try {
            await fs.promises.writeFile(dbPath, JSON.stringify(db, null, 2))
            sock.sendMessage(m.from, { text: `Agregados ${count} número(s) a "${groupName}".` })
        } catch {
            sock.sendMessage(m.from, { text: 'Error al guardar la base de datos.' })
        }
    }
}
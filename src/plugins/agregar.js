import fs from 'fs'
import path from 'path'
const groups = ['std', '7da', 'lam', 'gar', 'lsr', 'vsc', '20j', 'vsp', 'stm', 'sls']

export default {
    name: 'agregar',
    description: 'Agrega una lista de usuarios con información específica a la base de datos',
    comand: ['agregar'],
    exec: async (m, { sock }) => {
        if (!m.text) return sock.sendMessage(m.from, { text: 'Especifica el grupo y la lista de usuarios a agregar.' })
        const [g, ...e] = m.text.split(' ')
        if (!g) return sock.sendMessage(m.from, { text: 'Especifica el nombre del grupo.' })
        if (!groups.includes(g)) return sock.sendMessage(m.from, { text: `Grupo inválido. Permisos: ${groups.join(', ')}` })
        const users = e.join(' ').split(',').map(u => u.trim().split('|'))
        if (users.some(u => u.length !== 6)) return sock.sendMessage(m.from, { text: 'Formato inválido en algunos usuarios. Asegúrate de usar el formato: guia|valor|direccion|ciudad|nombre|numero' })

        const dbPath = path.join(process.cwd(), 'database.json')
        let db = { data: {} }
        try {
            if (fs.existsSync(dbPath)) db = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))
        } catch {
            return sock.sendMessage(m.from, { text: 'Error al leer la base de datos.' })
        }

        db.data[g] = db.data[g] || {}
        const already = []
        let count = 0
        users.forEach(([guia, valor, direccion, ciudad, nombre, numero]) => {
            numero = numero.replace(/\D/g, '').trim()
            if (!numero) return
            if (db.data[g][numero]) already.push(numero)
            else {
                db.data[g][numero] = { guia, valor, direccion, ciudad, nombre }
                count++
            }
        })

        if (already.length) return sock.sendMessage(m.from, { text: `Los siguientes números ya están registrados en "${g}": ${already.join(', ')}` })
        try {
            await fs.promises.writeFile(dbPath, JSON.stringify(db, null, 2))
            sock.sendMessage(m.from, { text: `Agregados ${count} usuario(s) al grupo "${g}" en la base de datos.` })
        } catch {
            sock.sendMessage(m.from, { text: 'Error al guardar la base de datos.' })
        }
    }
}
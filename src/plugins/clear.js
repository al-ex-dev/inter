import fs from 'fs'
import path from 'path'

export default {
    name: 'clear',
    description: 'Limpia respuestas, datos de un grupo o todos los datos',
    comand: ['clear'],
    exec: async (m, { sock }) => {
        const option = m.args[0] ? m.args[0].toLowerCase() : null
        if (!option) return sock.sendMessage(m.from, { text: 'Uso: clear <respuestas|response|-r> / <grupo> / (all|-a)' })

        if (['respuestas', 'response', '-r'].includes(option)) {
            const respPath = path.join(process.cwd(), 'responses.json')
            try {
                await fs.promises.writeFile(respPath, JSON.stringify({}, null, 2))
                return sock.sendMessage(m.from, { text: 'Respuestas reiniciadas.' })
            }
            catch (e) {
                return sock.sendMessage(m.from, { text: 'Error al reiniciar respuestas.' })
            }
        }
        if (['all', '-a'].includes(option)) {
            const respPath = path.join(process.cwd(), 'responses.json')
            const dbPath = path.join(process.cwd(), 'database.json')
            try {
                await fs.promises.writeFile(respPath, JSON.stringify({}, null, 2))
                await fs.promises.writeFile(dbPath, JSON.stringify({ data: {} }, null, 2))
                return sock.sendMessage(m.from, { text: 'Todos los datos (números y respuestas) han sido reiniciados.' })
            }
            catch (e) {
                return sock.sendMessage(m.from, { text: 'Error al reiniciar todos los datos.' })
            }
        }
        
        const group = option
        const dbPath = path.join(process.cwd(), 'database.json')
        let db = { data: {} }

        try {
            if (fs.existsSync(dbPath)) db = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))
        }
        catch (e) {
            return sock.sendMessage(m.from, { text: 'Error al leer la base de datos.' })
        }

        if (!db.data[group]) return sock.sendMessage(m.from, { text: `El grupo "${group}" no existe en la base de datos.` })
        delete db.data[group]

        try {
            await fs.promises.writeFile(dbPath, JSON.stringify(db, null, 2))
            return sock.sendMessage(m.from, { text: `Datos del grupo "${group}" eliminados.` })
        }
        catch (e) {
            return sock.sendMessage(m.from, { text: 'Error al guardar la base de datos.' })
        }
    }
}
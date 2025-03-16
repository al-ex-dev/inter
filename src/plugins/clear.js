import fs from 'fs';
import path from 'path';

export default {
    name: 'clear',
    description: 'Limpia la lista de envío de un grupo específico',
    comand: ['clear'],
    exec: async (m, { sock }) => {
        const filePath = path.join(global.origen, 'temp.json')

        const group = m.text.trim()

        if (!group) return await sock.sendMessage(m.from, { text: 'Debes ingresar el nombre del grupo' })

        const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : {}
        data[group] = []

        fs.writeFileSync(filePath, JSON.stringify(data))

        await sock.sendMessage(m.from, { text: `Lista de envío del grupo ${group} limpiada` })
    }
}

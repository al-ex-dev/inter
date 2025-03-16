import fs from 'fs';
import path from 'path';

export default {
    name: 'delete',
    description: 'Elimina números de la lista de envío de un grupo específico',
    comand: ['delete'],
    exec: async (m, { sock }) => {
        const filePath = path.join(global.origen, 'temp.json')

        const [group, ...numbers] = m.text.split(' ')
        const numberList = numbers.join(' ').split(',').map(num => num.trim())

        if (!group || numberList.length === 0) return await sock.sendMessage(m.from, { text: 'Debes ingresar el nombre del grupo y los números a eliminar' })

        const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : {}
        const updated = (data[group] || []).filter(num => !numberList.includes(num))
        data[group] = updated

        fs.writeFileSync(filePath, JSON.stringify(data))

        await sock.sendMessage(m.from, { text: `Números eliminados del grupo ${group}: ${numberList.join(', ')}\nTotal en lista: ${updated.length}` })
    }
}

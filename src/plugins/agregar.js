import fs from 'fs';
import path from 'path';

const allowedGroups = [ "std",
    "7da",
    "lam",
    "gar",
    "LSr",
    "vsc",
    "20j",
    "vsp",
    "stm",
    "sls"
]

export default {
    name: 'agregar',
    description: 'Agrega números a la lista de envío',
    comand: ['agregar'],
    exec: async (m, { sock }) => {
        if (!m.text) return await sock.sendMessage(m.from, { text: 'Debes ingresar el nombre del grupo seguido de números separados por coma' })

        const filePath = path.join(global.origen, 'temp.json')
        const [groupName, ...numbersText] = m.text.split(' ')
        if (!groupName || numbersText.length === 0) return await sock.sendMessage(m.from, { text: 'Formato incorrecto. Uso: agregar <grupo> <números>' })
        if (!allowedGroups.includes(groupName)) return await sock.sendMessage(m.from, { text: `El grupo ${groupName} no está permitido` })

        const numbers = numbersText.join(' ').split(',').map(num => num.trim())
        if (numbers.length === 0) return await sock.sendMessage(m.from, { text: 'Debes ingresar al menos un número' })

        if (["--clear", "-c"].includes(m.args[0])) {
            fs.writeFileSync(filePath, '{}')
            return await sock.sendMessage(m.from, { text: 'Lista de envío limpiada' })
        }

        if (["--delete", "-d"].includes(m.args[0])) {
            const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : {}
            if (data[groupName]) {
                const updated = data[groupName].filter(num => !numbers.includes(num))
                data[groupName] = updated
                fs.writeFileSync(filePath, JSON.stringify(data))
                return await sock.sendMessage(m.from, { text: `Números eliminados del grupo ${groupName}: ${numbers.join(', ')}\nTotal en lista: ${updated.length}` })
            } else {
                return await sock.sendMessage(m.from, { text: `El grupo ${groupName} no existe` })
            }
        }

        const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : {}
        if (!data[groupName]) data[groupName] = []

        const list = [...data[groupName], ...numbers]
        data[groupName] = list
        fs.writeFileSync(filePath, JSON.stringify(data))

        await sock.sendMessage(m.from, { text: `Total en lista para el grupo ${groupName}: ${list.length}\nNúmeros agregados: ${numbers.join(', ')}` })
    }
}
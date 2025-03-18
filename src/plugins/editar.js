import fs from 'fs'
import path from 'path'

export default {
    name: 'editar',
    description: 'Edita el mensaje de confirmación de recepción de paquete',
    comand: ['editar'],
    exec: async (m, { sock }) => {
        if (!m.text) return sock.sendMessage(m.from, { text: 'Especifica el nuevo mensaje.' })

        const configPath = path.join(process.cwd(), 'config.json')
        let config = { bot: { message: "¿Recibirá el paquete?" } }

        try {
            if (fs.existsSync(configPath)) config = JSON.parse(await fs.promises.readFile(configPath, 'utf8'))
        } catch {
            return sock.sendMessage(m.from, { text: 'Error al leer el archivo de configuración.' })
        }

        config.bot.message = m.text

        try {
            await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2))
            sock.sendMessage(m.from, { text: 'Mensaje de confirmación actualizado.' })
        } catch {
            sock.sendMessage(m.from, { text: 'Error al guardar el archivo de configuración.' })
        }
    }
}

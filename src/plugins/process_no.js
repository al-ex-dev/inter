import fs from 'fs'
import path from 'path'

const groupJIDs = {
    std: "120363414245334813@g.us",
    "7da": "120363415396394740@g.us",
    lam: "120363395326413648@g.us",
    gar: "120363412943711808@g.us",
    LSr: "120363416152433165@g.us",
    vsc: "120363415235327468@g.us",
    "20j": "120363415113559887@g.us",
    vsp: "120363395770015878@g.us",
    stm: "120363415147154652@g.us",
    sls: "120363396504227197@g.us"
}

export default {
    name: 'no',
    description: 'Confirma que no recibirá el paquete y solicita una razón',
    comand: ['process_no'],
    exec: async (m, { sock }) => {
        const number = m.sender.replace(/\D/g, '')
        const respPath = path.join(process.cwd(), 'responses.json')
        let responses = {}

        try {
            if (fs.existsSync(respPath)) responses = JSON.parse(await fs.promises.readFile(respPath, 'utf8'))
        } catch (e) {
            return sock.sendMessage(m.from, { text: 'Error al leer respuestas.' })
        }

        if (responses[number]) return sock.sendMessage(m.from, { text: 'Ya has respondido.' })
        responses[number] = { response: 'no', reason: null }

        try {
            await fs.promises.writeFile(respPath, JSON.stringify(responses, null, 2))
        } catch (e) {
            return sock.sendMessage(m.from, { text: 'Error al guardar respuesta.' })
        }

        await sock.sendMessage(m.from, { text: 'Por favor, proporciona el motivo por el cual no recibirás el paquete.' })
        const reasonResponse = async (msgReason) => {
            const reply = msgReason.messages?.[0]
            if (reply?.key.remoteJid !== m.from || !reply.message?.conversation) return
            const reason = reply.message.conversation
            responses[number].reason = reason

            try {
                await fs.promises.writeFile(respPath, JSON.stringify(responses, null, 2))
            } catch (e) {
                return console.error('Error al guardar la razón')
            }

            const dbPath = path.join(process.cwd(), 'database.json')
            let data = {}

            try {
                if (fs.existsSync(dbPath)) data = JSON.parse(await fs.promises.readFile(dbPath, 'utf8')).data || {}
            } catch (e) {
                console.error('Error al leer la base de datos')
            }

            const groupName = Object.keys(data).find(g => data[g].some(num => num.replace(/\D/g, '') === number))
            if (groupName) {
                const groupJID = groupJIDs[groupName]
                if (groupJID) await sock.sendMessage(groupJID, { text: `📦 +${number} no recibirá el paquete. Motivo: ${reason}` })
            }
            await sock.sendMessage(m.from, { text: 'Gracias por su respuesta.' })
            sock.ev.off('messages.upsert', reasonResponse)
        }
        sock.ev.on('messages.upsert', reasonResponse)
    }
}

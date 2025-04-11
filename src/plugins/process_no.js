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
    sls: "120363396504227197@g.us",
    crz: "120363400438490901@g.us"
}

const reasons = {
    damaged_content: "Contenido dañado",
    address_change: "Cambio de dirección",
    not_what_i_ordered: "Pedido incorrecto/incompleto",
    owner_deceased: "Dueño fallecido",
    moved_city: "Cambio de ciudad",
    wrong_city: "Ciudad incorrecta",
    no_money: "Falta de dinero",
    no_one_home: "Nadie en casa",
    final_return: "Devolución definitiva",
    vacation: "Vacaciones",
    another_day: "Entrega en 1-3 días"
}

export default {
    name: 'no',
    description: 'Confirma que no recibirá el paquete y selecciona una razón',
    comand: ['process_no'],
    exec: async (m, { sock }) => {
        const number = m.sender.replace(/\D/g, '')
        const respPath = path.join(process.cwd(), 'responses.json')
        let responses = fs.existsSync(respPath) ? JSON.parse(await fs.promises.readFile(respPath, 'utf8')) : {}

        if (responses[number]) return sock.sendMessage(m.from, { text: 'Ya has respondido.' })
        responses[number] = { response: 'no', reason: null, timestamp: Date.now() }

        await fs.promises.writeFile(respPath, JSON.stringify(responses, null, 2))

        await sock.sendMessage(m.from, {
            text: 'Seleccione la razón:', interactiveButtons: Object.entries(reasons).map(([id, text]) => ({
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({ display_text: text, id })
            }))
        }, { quoted: m })

        const timeout = setTimeout(async () => {
            if (responses[number] && !responses[number].reason) {
                await fs.promises.writeFile(respPath, JSON.stringify(responses, null, 2))
                await sock.sendMessage(m.from, { text: 'Tiempo de respuesta agotado.' })
            }
        }, 2 * 60 * 60 * 1000) // 2 horas

        sock.ev.on('messages.upsert', async function addressResponse(msg) {
            const selected = msg.messages?.[0]?.message?.templateButtonReplyMessage?.selectedId
            if (!selected || !reasons[selected]) return

            responses[number].reason = reasons[selected]
            await fs.promises.writeFile(respPath, JSON.stringify(responses, null, 2))

            const dbPath = path.join(process.cwd(), 'database.json')
            let data = fs.existsSync(dbPath) ? JSON.parse(await fs.promises.readFile(dbPath, 'utf8')).data || {} : {}

            const groupName = Object.keys(data).find(g => data[g].some(num => num.replace(/\D/g, '') === number))
            if (groupName && groupJIDs[groupName]) {
                await sock.sendMessage(groupJIDs[groupName], { text: `📦 +${number} no recibirá el paquete.\nMotivo: ${reasons[selected]}` })
            }

            await sock.sendMessage(m.from, { text: 'Gracias por su respuesta.' })
            clearTimeout(timeout)
            sock.ev.off('messages.upsert', addressResponse)
        })
    }
}
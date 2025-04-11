export default {
    name: "get id",
    comand: ["getid"],
    exec: async (m, { sock }) => {
        m.reply(m.from)
    }
}
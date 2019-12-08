const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    let role = message.guild.roles.find("name", config.Clear_Command);

    if (!role) return console.log(`ERROR! The ${config.Clear_Command} role was not found, please create it.`);
    if (!message.member.roles.has(role.id)) return message.reply(`${config.No_Permission}`).then(msg => msg.delete(2000));
    if (!args[0]) return message.reply(config.No_Amount_Of_Messages_To_Clear).then(msg => msg.delete(2000));

    message.channel.bulkDelete(args[0]).then(() => {
        message.channel.send(`Cleared ${args[0]} messages.`).then(msg => msg.delete(5000));
    });

}

module.exports.help = {
    name: "clear"
}

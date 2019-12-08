const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    message.delete();
    let role = message.guild.roles.find("name", `${config.Unban_Command}`);
    let user = args[0]
    let reason = args.slice(1).join(" ")

    if (!role) return console.log(`ERROR! The ${config.Unban_Command} role was not found, please create it.`)
    if (!message.member.roles.has(role.id)) return message.reply(`${config.No_Permission}`).then(msg => {
        msg.delete(2000)
    });
    if (!args[0]) return message.reply(`Usage: -unban (user ID) (reason)`).then(msg => {
        msg.delete(2000)
    });
    if (!user) return message.reply(`${config.No_User}`).then(msg => {
        msg.delete(2000)
    });
    if (user.id === message.author.id) return message.reply(config.User_Is_Yourself);
    if (user.id === bot.user.id) return message.reply(config.User_Is_VeloriaBot).then(msg => {
        msg.delete(2000)
    });
    if (!reason) return message.reply(`${config.No_Reason}`).then(msg => {
        msg.delete(2000)
    });

    message.guild.unban(user, reason);
    message.channel.send(`${user} has been unbanned by ${message.author} for ${reason}!`)

}

module.exports.help = {
    name: "unban"
}

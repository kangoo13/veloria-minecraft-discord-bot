const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    message.delete();
    let role = message.guild.roles.find("name", config.Ban_Command);
    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let reason = args.join(" ").slice(22);

    if (!role) return console.log(`ERROR! The ${config.Ban_Command} role was not found, please create it.`)
    if (!message.member.roles.has(role.id)) return message.reply(`${config.No_Permission}`).then(msg => {
        msg.delete(2000)
    });
    if (!args[0]) return message.reply(`Usage: -ban (user) (reason)`).then(msg => {
        msg.delete(2000)
    });
    if (!user) return message.reply(`${config.No_User}`).then(msg => {
        msg.delete(2000)
    });
    if (user.roles.has(role.id)) return message.reply(`${config.User_Is_Staff}`).then(msg => {
        msg.delete(2000)
    });
    if (user.id === bot.user.id) return message.reply(config.User_Is_VeloriaBot).then(msg => {
        msg.delete(2000)
    });
    if (user.id === message.author.id) return message.reply(config.User_Is_Yourself);
    if (!reason) return message.reply(`${config.No_Reason}`).then(msg => {
        msg.delete(2000)
    });

    user.ban(reason);
    message.channel.send(`${user} (${user.id}) has been banned by ${message.author} for ${reason}!`)

}

module.exports.help = {
    name: "ban"
}

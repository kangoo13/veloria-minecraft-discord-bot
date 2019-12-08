const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let muterole = message.guild.roles.find(`name`, config.Mute_Role);
    let role = message.guild.roles.find("name", config.Mute_Command);
    let reason = args.join(" ").slice(22);

    if (!message.member.roles.has(role.id)) return message.reply(config.No_Permission).then(msg => {
        msg.delete(2000)
    });
    if (!args[0]) return message.reply(`Usage: -mute (user) (reason)`).then(msg => {
        msg.delete(2000)
    });
    if (!user) return message.reply(config.No_User).then(msg => {
        msg.delete(2000)
    });
    if (user.roles.has(role.id)) return message.reply(`${config.User_Is_Staff}`).then(msg => {
        msg.delete(2000)
    });
    if (user.id === bot.user.id) return message.reply(config.User_Is_VeloriaBot).then(msg => {
        msg.delete(2000)
    });
    if (user.id === message.author.id) return message.reply(config.User_Is_Yourself);
    if (!reason) return message.reply(config.No_Reason).then(msg => {
        msg.delete(2000)
    });
    if (!muterole) return console.log(`ERROR! The ${config.Mute_Role} role was not found, please create it.`)

    user.addRole(muterole.id);
    message.channel.send(`<@${user.id}> has been muted for ${reason}`)
}

module.exports.help = {
    name: "mute"
}

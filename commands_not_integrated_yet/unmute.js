const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let muterole = message.guild.roles.find(`name`, config.Mute_Role);
    let role = message.guild.roles.find("name", config.Mute_Command);
    let reason = args.slice(1).join(" ");

    if (!message.member.roles.has(role.id)) return message.reply(config.No_Permission).then(msg => {
        msg.delete(2000)
    });
    if (!args[0]) return message.reply(`Usage: -unmute (user) (reason)`).then(msg => {
        msg.delete(2000)
    });
    if (!user) return message.reply(config.No_User).then(msg => {
        msg.delete(2000)
    });
    if (!reason) return message.reply(config.No_Reason).then(msg => {
        msg.delete(2000)
    });
    if (!muterole) return console.log(`ERROR! The ${config.Mute_Role} role was not found, please create it.`)

    user.removeRole(muterole.id);
    message.channel.send(`<@${user.id}> has been unmuted by <@${message.author.id}> for ${reason}.`).then(msg => {
        msg.delete(5000)
    });
    ;
}

module.exports.help = {
    name: "unmute"
}

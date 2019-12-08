const Discord = require("discord.js");
const yml = require("../yml.js");
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml")
    let bMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!message.member.roles.has(message.guild.roles.find(r => r.name.toLowerCase() == config.Blacklist_Command.toLowerCase()).id)) return message.reply("You do not have permission for that command!");
    if (!bMember) return message.reply("Please provide a user name");
    if (!message.guild.roles.find(r => r.name.toLowerCase() == config.BlacklistRole.toLowerCase())) message.guild.createRole({name: config.BlacklistRole})
    let aRole = message.guild.roles.find(r => r.name.toLowerCase() == config.BlacklistRole.toLowerCase());
    if (!aRole) return message.reply(`Role doesn't exisit, VeloriaBot is creating it for you.`);

    if (bMember.roles.has(aRole.id)) return message.reply("That user already has this role!");
    await (bMember.addRole(aRole.id))

    message.channel.send(`${bMember} has been blacklisted!`)
}
module.exports.help = {
    name: "blacklist"
}

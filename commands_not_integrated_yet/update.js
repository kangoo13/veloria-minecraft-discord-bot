const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    message.delete();
    let role = message.guild.roles.find("name", config.Update_Command);
    let channel = message.guild.channels.find(`name`, config.Updates_Channel);
    let argument = args.join(" ");
    let botEmbed = new Discord.RichEmbed()
        .setColor(config.Color)
        .setAuthor(`Updates`)
        .setDescription(argument)

    if (!role) return console.log(`ERROR! The ${config.Update_Command} role was not found, please create it.`);
    if (!channel) return console.log(`ERROR! The ${config.Updates_Channel} role was not found, please create it.`);
    if (!message.member.roles.has(role.id)) return message.reply(config.No_Permission).then(msg => {
        msg.delete(2000)
    });
    if (!args[0]) return message.reply(`Usage: -update (update)`).then(msg => {
        msg.delete(2000)
    });

    channel.send(botEmbed)
}

module.exports.help = {
    name: "update"
}

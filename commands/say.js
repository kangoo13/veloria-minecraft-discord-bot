const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    message.delete();
    let role = message.guild.roles.find("name", config.Say_Command);
    let argument = args.join(" ");
    let embed = new Discord.RichEmbed()
        .setColor(config.Color)
        .setDescription(argument);

    if (!message.member.roles.has(role.id)) return message.reply(config.No_Permission)
    if (!args[0]) return message.reply(config.No_Message_To_Say);

    message.channel.send(embed);
}

module.exports.help = {
    name: "say"
}

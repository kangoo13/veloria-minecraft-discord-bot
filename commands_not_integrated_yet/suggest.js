const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    message.delete();
    let channel = message.guild.channels.find(`name`, config.Suggestions_Channel);
    let argument = args.join(" ");
    let embed = new Discord.RichEmbed()
        .setColor(config.Color)
        .setAuthor(`Suggestion From ${message.author.username}`, message.author.displayAvatarURL)
        .setDescription(argument)

    if (!args[0]) return message.reply(config.No_Suggestion_Found).then(msg => msg.delete(2000));

    channel.send(embed).then(async (msg) => {
        msg.react("✅").then(r => msg.react("❎"))
    });
    message.reply(config.Suggestion_Made_Reply_Message).then(msg => msg.delete(2000));

}
module.exports.help = {
    name: "suggest"
}

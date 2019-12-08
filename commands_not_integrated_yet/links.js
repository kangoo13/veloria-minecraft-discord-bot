const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    let embed = new Discord.RichEmbed()
        .setColor(config.Color)
        .addField("**LINKS**", `All links related to the server\n \n**Website:** ${config.Website}\n**Store:** ${config.Store}\n**Twitter:** ${config.Twitter}`)
    message.channel.send(embed)
}
module.exports.help = {
    name: "links"
}

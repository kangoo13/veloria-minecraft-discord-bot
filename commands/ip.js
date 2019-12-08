const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    let embed = new Discord.RichEmbed()
        .setColor(`${config.Color}`)
        .setAuthor(`${config.IPEmbed_Title}`)
        .setDescription(`${config.Server_IP}`)

    message.channel.send(embed);
};

module.exports.help = {
    name: "ip"
};

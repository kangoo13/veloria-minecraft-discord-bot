const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    let shopEmbed = new Discord.RichEmbed()
        .setAuthor(config.ShopEmbed_Title)
        .setColor(config.Color)
        .addField(`${config.ShopEmbed_Item1_SubTitle}`, `${config.ShopEmbed_Item1_Description}`)
        .addField(`${config.ShopEmbed_Item2_SubTitle}`, `${config.ShopEmbed_Item2_Description}`)
    message.channel.send(shopEmbed);
};
module.exports.help = {
    name: "shop"
}

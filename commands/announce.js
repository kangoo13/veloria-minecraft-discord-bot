const Discord = require("discord.js");
let yml = require("../yml.js");

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    message.delete();
    let role = message.guild.roles.find("name", `${config.Announce_Required_Rank}`);
    let channel = message.guild.channels.find(`name`, `${config.Announcement_Channel}`);

    if (!role) {
        return console.log(`ERREUR! Le role ${config.Announce_Required_Rank} n'a pas été trouvé, merci de le créer.`);
    }
    if (!args[0]) {
        return message.reply(`Utilisation: !announce (annonce)`).then(msg => {
            msg.delete(2000)
        });
    }
    if (!channel) {
        return console.log(`ERREUR! Le channel ${config.Announcement_Channel} n'a pas été trouvé, merci de le créer.`);
    }
    if (!message.member.roles.has(role.id)) {
        return message.reply(`${config.No_Permission}`).then(msg => {
            msg.delete(2000)
        });
    }
    if (!args[0]) {
        return message.reply(`${config.No_Announcement_Message_Found}`).then(msg => {
            msg.delete(2000)
        });
    }

    let all = new Discord.RichEmbed()
        .setColor(config.Color)
        .setAuthor(config.Announcement_Embed_Title)
        .setThumbnail(bot.user.displayAvatarURL)
        .setDescription(args.join(" "))
        .setFooter(config.Announce_Embed_Footer);

    return channel.send(all).then(channel.send(`@everyone`))
};

module.exports.help = {
    name: "announce"
};

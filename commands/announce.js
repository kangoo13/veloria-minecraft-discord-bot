const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    message.delete();
    let role = message.guild.roles.find("name", `${config.Announce_Required_Rank}`);
    let arguments = args.join(" ");
    let channel = message.guild.channels.find(`name`, `${config.Announcement_Channel}`);

    if (!role) return console.log(`ERROR! The ${config.Announce_Required_Rank} role was not found, please create it.`);
    if (!args[0]) return message.reply(`Usage: -announce (announcement)`).then(msg => {
        msg.delete(2000)
    });
    if (!channel) return console.log(`ERROR! The ${config.Announcement_Channel} channel was not found, please create it.`);
    if (!message.member.roles.has(role.id)) return message.reply(`${config.No_Permission}`).then(msg => {
        msg.delete(2000)
    });
    if (!args[0]) return message.reply(`${config.No_Announcement_Message_Found}`).then(msg => {
        msg.delete(2000)
    });

    let all = new Discord.RichEmbed()
        .setColor(config.Color)
        .setAuthor(config.AnnouncementEmbed_Title)
        .setThumbnail(bot.user.displayAvatarURL)
        .setDescription(args.join(" "))
        .setFooter(config.AnnounceEmbed_Footer)

    let none = new Discord.RichEmbed()
        .setColor(config.Color)
        .setAuthor(config.AnnouncementEmbed_Title)
        .setDescription(args.join(" "))

    let nopicture = new Discord.RichEmbed()
        .setColor(config.Color)
        .setAuthor(config.AnnouncementEmbed_Title)
        .setDescription(args.join(" "))
        .setFooter(config.AnnounceEmbed_Footer)

    let nofooter = new Discord.RichEmbed()
        .setColor(config.Color)
        .setAuthor(config.AnnouncementEmbed_Title)
        .setThumbnail(bot.user.displayAvatarURL)
        .setDescription(args.join(" "))

    if (config.AnnouncementEmbed_Picture === "true" && config.AnnouncementEmbed_Footer === "true") return channel.send(all).then(channel.send(`@everyone`))
    if (config.AnnouncementEmbed_Picture === "false" && config.AnnouncementEmbed_Footer === "false") return channel.send(none).then(channel.send(`@everyone`))
    if (config.AnnouncementEmbed_Footer === "false" && config.AnnouncementEmbed_Picture === "true") return channel.send(nofooter).then(channel.send(`@everyone`))
    if (config.AnnouncementEmbed_Footer === "true" && config.AnnouncementEmbed_Picture === "false") return channel.send(nopicture).then(channel.send(`@everyone`))
    if (config.AnnouncementEmbed_Picture !== "true" && config.AnnouncementEmbed_Picture !== "false") return console.log(`Please set the option "AnnouncementEmbed_Picture" to either **true** or **false** config.yml.`);
    if (config.AnnouncementEmbed_Footer !== "true" && config.AnnouncementEmbed_Picture !== "false") return console.log(`Please set the option "AnnouncementEmbed_Footer" to either **true** or **false** in your config.yml.`);
}

module.exports.help = {
    name: "announce"
}

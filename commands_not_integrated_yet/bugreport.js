const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    message.delete();
    let channel = message.guild.channels.find(`name`, `${config.Bug_Reports_Channel}`);
    let argument = args.join(" ");
    let embed = new Discord.RichEmbed()
        .setAuthor(`New Bug Report From ${message.author.username}`)
        .setColor(config.Color)
        .setDescription(args.join(" "))

    if (!args[0]) return message.reply(config.No_Bug_Found).then(msg => {
        msg.delete(2000)
    });
    ;
    if (!channel) return console.log(`ERROR! I could not find the ${config.Bug_Reports_Channel} channel. Please create the channel!`);

    channel.send(embed)
    message.reply(config.BugReported_Reply_Message).then(msg => {
        msg.delete(2000)
    });
}
module.exports.help = {
    name: "bugreport"
};

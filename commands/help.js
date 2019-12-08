const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    let embed = new Discord.RichEmbed()
        .setColor(config.color)
        .setThumbnail(bot.user.displayAvatarURL)
        .addField("**BOT COMMANDS**", "**-bugreport** Report a bug found on the server!\n**-coins** Check how many coins you have!\n**-ip** Get the IP of the server!\n**-level** Check your current level on the Discord server!\n**-links** Get important links related to the server!\n**-suggest** Suggest something for the server!")

    let staffembed = new Discord.RichEmbed()
        .setColor(config.color)
        .setThumbnail(bot.user.displayAvatarURL)
        .addField("**ADMIN COMMANDS**", "**-announce** Announce an important message to the server in an embed!\n**-ban** Ban users from the guild!\n**-blacklist** Blacklist users from talking or texting.\n**-clear** Clear a certain amount of messages!\n**-install** Install all needed Channels!\n**-mute** Mute a certain user!\n**-say** Create embeded messages!\n**-setprefix** Set the bot's command prefix!\n**-setstatus** Set the bots current status!\n**-update** Update the users about any changes happening.\n**-gcreate** create giveaways\n**-gdelete** delete giveaways\n**-greroll** reroll a finished giveaway")

    let role = message.guild.roles.find("name", `${config.Staff_Help_Menu}`);

    if (!role) console.log(`ERROR! The ${config.Staff_Help_Menu} role was not found, please create it.`);
    if (!message.member.roles.has(role.id)) return message.channel.send(embed)
    message.channel.send(staffembed).then(message.channel.send(embed));
}

module.exports.help = {
    name: "help"
}

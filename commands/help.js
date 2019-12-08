const Discord = require("discord.js");
let yml = require("../yml.js");

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    let embed = new Discord.RichEmbed()
        .setColor(config.color)
        .setThumbnail(bot.user.displayAvatarURL)
        .addField("**COMMANDES VELORIABOT**", "**!ip** Connaitre l'ip du serveur Minecraft Veloria !\n**!new** Créer un nouveau ticket !");

    let staffEmbed = new Discord.RichEmbed()
        .setColor(config.color)
        .setThumbnail(bot.user.displayAvatarURL)
        .addField("**COMMANDES ADMIN VELORIABOT**", "**-announce** Announce an important message to the server in an embed!\n**-ban** Ban users from the guild!\n**-blacklist** Blacklist users from talking or texting.\n**-clear** Clear a certain amount of messages!\n**-install** Install all needed Channels!\n**-mute** Mute a certain user!\n**-say** Create embeded messages!\n**-setprefix** Set the bot's command prefix!\n**-setstatus** Set the bots current status!\n**-update** Update the users about any changes happening.\n**-gcreate** create giveaways\n**-gdelete** delete giveaways\n**-greroll** reroll a finished giveaway")

    let role = message.guild.roles.find("name", `${config.Staff_Help_Menu}`);

    if (!role) console.log(`ERREUR! Le role ${config.Staff_Help_Menu} n'a pas été trouvé, merci de le créer.`);
    await message.channel.send(embed);
    if (message.member.roles.has(role.id)) {
        message.channel.send(staffEmbed).then(message.channel.send(embed));
    }
};

module.exports.help = {
    name: "help"
};

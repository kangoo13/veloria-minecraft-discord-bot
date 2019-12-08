const Discord = require('discord.js');
const fs = require('fs');
let yml = require("../yml.js")


module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    let role = message.guild.roles.find(`name`, config.GiveawayCreate_Command);

    if (!message.member.roles.has(role.id)) return message.reply(`${config.No_Permission}`);
    fs.readFile('./giveaways.json', 'utf-8', function (err, giveaways) {
        if (err) throw err;
        giveaways = JSON.parse(giveaways);
        let giveaway;
        if (!args[0]) giveaway = giveaways.sort((a, b) => b.start - a.start)[0];
        else {
            let g = giveaways.find(g => g.name.toLowerCase() == args.join(" ").toLowerCase());
            if (!g) return message.reply("No giveaway found with name ``" + args.join(" ") + "``");
            giveaway = g;
        }
        if (!giveaway.ended) return message.reply("That giveaway has not ended yet!");
        if (giveaway.reactions.length < 1) return message.reply("No one has entered the giveaway!");
        let winner = giveaway.reactions[~~(Math.random() * giveaway.reactions.length)];
        let embed = new Discord.RichEmbed()
            .setColor(config.Color)
            .setAuthor("Giveaway Winner")
            .setDescription("Congratulations to <@" + winner + "> for winning the " + giveaway.name)
            .addBlankField()
            .setFooter("Open a ticket to claim your prize")
            .setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/154/party-popper_1f389.png");

        let channel = message.guild.channels.find(`name`, config.Giveaway_Channel)
        channel.send(embed);
    })
}
module.exports.help = {
    name: "greroll"
}

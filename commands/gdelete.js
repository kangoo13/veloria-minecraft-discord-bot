const Discord = require('discord.js');
const fs = require('fs');
let yml = require("../yml.js")


module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    let role = message.guild.roles.find(`name`, config.GiveawayCreate_Command);

    if (!message.member.roles.has(role.id)) return message.reply(config.No_Permission);
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
        bot.guilds.get(giveaway.guild).channels.get(giveaway.channel).fetchMessage(giveaway.messageID).then(msg => msg.delete()).catch(err => {
        });
        giveaways.splice(giveaways.indexOf(giveaway), 1);
        message.channel.send(":white_check_mark: **Giveaway deleted**");
        fs.writeFile('./giveaways.json', JSON.stringify(giveaways), function (err) {
            if (err) console.log(err)
        })
    })
}
module.exports.help = {
    name: "gdelete"
}

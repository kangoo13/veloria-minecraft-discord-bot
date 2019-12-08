const Discord = require("discord.js");
let yml = require("../yml.js")
let coins = require("../data/coinsystem.json");

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    if (!args[0]) return message.reply("You have " + coins[message.author.id].coins + " coins");
    else {
        let user = message.mentions.users.first();
        if (!user) return message.reply(`${config.No_User}`).then(msg => {
            msg.delete(5000)
        });
        let coins2 = coins[user.id].coins;
        if (!coins) coins2 = 0;
        message.channel.send(user + " has " + coins2 + " coins");
    }
};

module.exports.help = {
    name: "coins",
}

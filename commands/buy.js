const Discord = require("discord.js");
const coins = require("../data/coinsystem.json");
const fs = require("fs")
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    const items = [
        {
            "item": `${config.Item_1}`,
            "coins": `${config.Item1_Price}`,
            "type": "role",
            "role": `${config.Item1_Role}`
        },

        {
            "item": `${config.Item_2}`,
            "coins": `${config.Item2_Price}`,
            "type": "role",
            "role": `${config.Item2_Role}`
        }
    ]

    let item;
    let valid = false;
    for (let i = 0; i < items.length; i++) if (items[i].item == args[0].toLowerCase()) {
        valid = true;
        item = items[i];
    }

    let userCoins = coins[message.author.id].coins;
    let price = item.coins;
    if (userCoins < price) return message.reply(config.Not_Enough_Coins)
    coins[message.author.id].coins -= price;

    if (item.type == "role") {
        let role = message.guild.roles.find(r => r.name.toLowerCase() == item.role);
        if (!role) return console.log(`ERROR! The ${item.role} role was not found, please create it.`)
        message.member.addRole(role.id);
        message.reply("You have purchased ``" + item.item + "`` for **" + item.coins + "** coins!");
    }

    fs.writeFile("./coins.json", JSON.stringify(coins), (err) => {
        if (err) console.log(err)
    })
}

module.exports.help = {
    name: "buy"
}

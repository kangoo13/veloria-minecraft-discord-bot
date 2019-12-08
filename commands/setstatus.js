const Discord = require("discord.js");
let file = require("../data/status.json");
const fs = require("fs");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    let role = message.guild.roles.find("name", config.SetStatus_Command);

    if (role && !message.member.roles.has(role.id)) return message.reply(config.No_Permission).then(msg => {
        msg.delete(2000)
    });
    if (!args[0]) return message.reply(`Usage: -setstatus (type) (new status) )`).then(msg => {
        msg.delete(2000)
    });
    if (args[0].toUpperCase() !== "WATCHING" && args[0].toUpperCase() !== "PLAYING" && args[0].toUpperCase() !== "STREAMING" && args[0].toUpperCase() !== "LISTENING") return message.reply("Wrong status! Use `playing`, `watching`, `streaming`, or `listening`");
    if (!args[1]) return message.reply("Please provide what you would like to change my status to.").then(msg => {
        msg.delete(2000)
    });
    bot.user.setActivity(args.slice(1).join(" "), {type: args[0].toUpperCase()});
    file["activity"] = args.slice(1).join(" ");
    file["type"] = args[0].toUpperCase();
    fs.writeFile("./status.json", JSON.stringify(file), (err) => {
        if (err) console.log(err)
    })

    message.reply(`The bot status has been updated to **${args[1]}**!`)
}

module.exports.help = {
    name: "setstatus"
}

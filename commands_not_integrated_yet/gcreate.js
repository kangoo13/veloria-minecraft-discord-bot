const Discord = require("discord.js");
const fs = require("fs");
let yml = require("../yml.js")


module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    const settings = {
        "permNeeded": `${config.GiveawayCreate_Command}`,
        "emoji": `${config.Emoji}`,
        "emojiUnicode": `${config.Emoji_Unicode}`,
        "maxGiveaways": `${config.Max_Giveaways}`
    }
    let giveaways = require("../data/giveaways.json");
    if (!message.member.hasPermission(settings.permNeeded)) return message.reply(config.No_Permission);
    if (giveaways.length > settings.maxGiveaways) return message.reply(config.Max_Giveaways_Reached);
    let questions = ["How long would you like the giveaway to be?", "What do you want to giveaway?", "Please explain the item you are giving away.", "How many winners will there be?"];
    let answers = [];
    for (let i = 0; i < questions.length; i++) {
        let question = questions[i];
        message.channel.send(question);
        await message.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 60000})
            .then(msg => {
                msg = msg.first();
                answers.push(msg.content);
            })
            .catch(err => message.reply("You took too long to respond!"));
    }
    message.channel.bulkDelete(questions.length * 2);
    let pattern = /(((\d)+(m|M))?((\d)+(h|H))?((\d)+(d|D))?)+/
    if (!pattern.exec(answers[0])) return message.reply("That is not a valid length of time!");
    if (!parseInt(answers[3])) return message.reply("That is not a valid number of winners!");
    let mins = parseInt(answers[0].match(/\d+[m]/) !== null ? answers[0].match(/\d+[m]/)[0] : 0);
    let days = parseInt(answers[0].match(/\d+[d]/) !== null ? answers[0].match(/\d+[d]/)[0] : 0);
    let hours = parseInt(answers[0].match(/\d+[h]/) !== null ? answers[0].match(/\d+[h]/)[0] : 0);

    let msAway = 0;
    if (mins) msAway += mins * 60000;
    if (hours) msAway += hours * 60 * 60000;
    if (days) msAway += days * 24 * 60 * 60000;
    let end = new Date(Date.now() + msAway);
    let embed = new Discord.RichEmbed()
        .setColor(config.Color)
        .setAuthor(`${answers[3]}x ${answers[1]}`)
        .setDescription(answers[2] + `\n\nReact with ${config.Emoji} to enter!`)
        .setFooter("Ends on")
        .setTimestamp(end);
    message.channel.send(embed)
        .then(msg => {
            msg.react(`${config.Emoji_Unicode}`)
            giveaways.push({
                messageID: msg.id,
                name: answers[1],
                end: Date.now() + msAway,
                winners: parseInt(answers[3]),
                channel: msg.channel.id,
                guild: msg.guild.id,
                ended: false,
                start: Date.now(),
                reactions: []
            })
            fs.writeFile("./giveaways.json", JSON.stringify(giveaways), function (err) {
                if (err) console.log(err)
            });
        });
    message.delete();
}

module.exports.help = {
    name: "gcreate"
}

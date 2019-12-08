const Discord = require("discord.js");
const tickets = require("../data/tickets.json");
const fs = require("fs");
const yml = require("../yml.js");
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml");
    let userLimit = config.User_Ticket_Limit;
    let amt = tickets.find(t => t && t.authorID == message.author.id);
    if (amt > userLimit) return message.reply("You can only have up to ``" + userLimit + "`` tickets at a time, you must close a ticket first to create a new one!");
    let currentTicket = tickets[0].currentTicket;
    let zero = 4 - (currentTicket.toString().length);
    let zeroes = "0".repeat(zero);
    message.guild.createChannel(`ticket- ${zeroes}${currentTicket}`, "text").then(ch => {
        let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Ticket_Support_Role.toLowerCase());
        if (role)
            ch.overwritePermissions(role.id, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                READ_MESSAGES: true,
                ADD_REACTIONS: true,
                READ_MESSAGE_HISTORY: true
            })
        else ch.send("There is no role called ``" + config.Ticket_Support_Role + "`` in this guild, so staff will not have permission to talk in this channel, please contact an administrator!");
        ch.overwritePermissions(message.author.id, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            READ_MESSAGES: true,
            ADD_REACTIONS: true,
            READ_MESSAGE_HISTORY: true
        })
        ch.overwritePermissions(message.guild.id, {
            VIEW_CHANNEL: false,
            SEND_MESSAGES: false,
            READ_MESSAGES: false,
            ADD_REACTIONS: false,
            READ_MESSAGE_HISTORY: false
        })
        let embed = new Discord.RichEmbed()
            .setColor("#098aed")
            .setDescription(`Your new ticket has been created in ${ch}!`);
        message.channel.send(embed);
        let embed2 = new Discord.RichEmbed()
            .setColor("#098aed")
            .setAuthor("Ticket bot")
            .setDescription(`${config.New_Ticket_Embed_Description.replace(/{user}/g, `${message.member}`)}\n\n**Reason:** ${args.join(" ")}`)
            .setFooter(config.New_Ticket_Embed_Footer)
            .setThumbnail(bot.user.avatarURL);
        let role2 = message.guild.roles.find(r => r.name.toLowerCase() == config.Ticket_Support_Role.toLowerCase());
        if (role2)
            ch.send(`${role2}`)
        ch.send(embed2)
        tickets.push({
            id: zeroes + currentTicket,
            authorID: message.author.id,
            reason: args.join(" "),
            name: "ticket",
            addedUsers: []
        })
        message.guild.createRole({
            name: `ticket-${zeroes}${currentTicket}`
        }).then(role => {
            message.member.addRole(role.id);
        })
        let channel = message.guild.channels.find(ch => ch.name == "ticket-log");
        if (channel) {
            let embed = new Discord.RichEmbed()
                .setColor("#098aed")
                .setThumbnail(bot.user.avatarURL)
                .setFooter("Ticket Log")
                .setAuthor("Ticket Created")
                .setDescription(`**Creator:** ${message.author} **with ID:** ${message.author.id}\n**Ticket ID:** ${zeroes}${currentTicket}\n**Channel Name:** ${ch.name}`);
            channel.send(embed);
        }
        tickets[0].currentTicket++;
        fs.writeFile("./tickets.json", JSON.stringify(tickets), (err) => {
            if (err) console.log(err)
        })
    })
}

module.exports.help = {
    name: "new"
}

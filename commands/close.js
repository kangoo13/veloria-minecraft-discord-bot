const Discord = require("discord.js");
const tickets = require("../data/tickets.json");
const fs = require("fs");
const yml = require("../yml.js");
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml");
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Ticket_Support_Role.toLowerCase());
    let id = message.channel.name.split("-")[1];
    let find = tickets.find(t => t && t.id == id);
    if (role && !message.member.roles.has(role.id) && find.authorID !== message.author.id)
        return message.reply("You do not have permission for that command!")
    if (!role) message.reply("``ERROR!`` I could not find the ``" + config.Ticket_Support_Role + "`` role in this guild, please contact an administrator!")
    if (!role && !message.member.hasPermission("ADMINISTRATOR"))
        return message.reply("You do not have permission for that command!")
    let check = new RegExp("([a-z]|[A-Z])+[-]([0-9])+");
    let c = check.exec(message.channel.name);
    if (!c) return message.reply("You are not in a ticket channel!");
    if (!find) return message.reply("``ERROR!`` I could not find that ticket in the database!");
    tickets.splice(tickets.indexOf(find), 1);
    message.channel.delete();
    let channel = message.guild.channels.find(ch => ch.name.toLowerCase() == "ticket-log");
    let user = message.guild.member(find.authorID);
    if (channel) {
        let embed = new Discord.RichEmbed()
            .setThumbnail(bot.user.avatarURL)
            .setFooter("Tickets")
            .setAuthor("Ticket Closed")
            .setColor(config.New_Ticket_Embed_Color)
            .setDescription(`**Closed by:** ${message.author} **with ID:** ${message.author.id}\n**Creator:** ${user} **with ID:** ${find.authorID}\n**Ticket ID:** ${find.id}\n**Channel Name:** ${find.name}-${find.id}\n**Added Users:** ${find.addedUsers.join(",")}`);
        channel.send(embed);
    }
    let role2 = message.guild.roles.find("name", `ticket-${find.id}`);
    if (role2) {
        message.member.removeRole(role2.id);
        role2.delete();
    }
    fs.writeFile("./tickets.json", JSON.stringify(tickets), (err) => {
        if (err) console.log(err)
    })
}

module.exports.help = {
    name: "close"
}

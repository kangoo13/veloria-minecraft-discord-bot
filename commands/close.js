const Discord = require("discord.js");
const tickets = require("../data/tickets.json");
const fs = require("fs");
const yml = require("../yml.js");
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml");
    let role = message.guild.roles.find(r => r.name.toLowerCase() === config.Ticket_Support_Role.toLowerCase());
    let id = message.channel.name.split("-")[1];
    let find = tickets.find(t => t && t.id === id);
    if (role && !message.member.roles.has(role.id) && find.authorID !== message.author.id)
        return message.reply("Vous n'avez pas les permissions pour cette commande !");
    if (!role) message.reply("``ERREUR!`` Je ne peux pas trouver le role ``" + config.Ticket_Support_Role + "`` sur ce Discord, merci de contacter un administateur !");
    if (!role && !message.member.hasPermission("ADMINISTRATOR"))
        return message.reply("Vous n'avez pas les permissions pour cette commande !");
    let check = new RegExp("([a-z]|[A-Z])+[-]([0-9])+");
    let c = check.exec(message.channel.name);
    if (!c) return message.reply("Vous n'êtes pas dans un channel de ticket !");
    if (!find) return message.reply("``ERREUR !`` Je ne peux pas trouver ce ticket dans la base de donnée !");
    tickets.splice(tickets.indexOf(find), 1);
    await message.channel.delete();
    let channel = message.guild.channels.find(ch => ch.name.toLowerCase() === config.Ticket_Logs_Channel);
    let user = message.guild.member(find.authorID);
    if (channel) {
        let embed = new Discord.RichEmbed()
            .setThumbnail(bot.user.avatarURL)
            .setFooter("Tickets")
            .setAuthor("Ticket Fermé")
            .setColor(config.New_Ticket_Embed_Color)
            .setDescription(`**Fermé par:** ${message.author} **ayant pour ID:** ${message.author.id}\n**Créateur:** ${user} **ayant pour ID:** ${find.authorID}\n**ID du Ticket:** ${find.id}\n**Nom du Channel:** ${find.name}-${find.id}\n**Utilisateurs Ajoutés:** ${find.addedUsers.join(",")}`);
        channel.send(embed);
    }
    let role2 = message.guild.roles.find("name", `ticket-${find.id}`);
    if (role2) {
        await message.member.removeRole(role2.id);
        await role2.delete();
    }
    fs.writeFile("./data/tickets.json", JSON.stringify(tickets), (err) => {
        if (err) console.log(err)
    })
};

module.exports.help = {
    name: "close"
};

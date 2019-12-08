const Discord = require("discord.js");
const rp = require("request-promise");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    const serverone = config.Gamemode_Name_One;
    const urlone = config.Gamemode_One_URL;
    const queryone = config.Gamemode_One_Query_URL;
    const server1url = config.Gamemode_1_url;
    const servername = config.Server_Name
    const exp1url = `${server1url}`
    const servers = [{"name": `${serverone}`, "url": `${urlone}`, "queryURL": `${queryone}`},]

    if (args.length >= 1) {
        let players;
        let total;
        let found = false;
        for (let i = 0; i < servers.length; i++) {
            if (servers[i].name.toLowerCase() == args[0].toLowerCase()) {
                found = true;
                await rp(servers[i].queryURL).then((html) => {
                    const json = JSON.parse(html);
                    if (json.error) players = "Offline";
                    else {
                        total = json.Players
                        if (!json.Playerlist) players = "None"
                        else players = json.Playerlist.join("\n")
                    }
                })
            }
        }
        if (!found) return message.reply("That is not a valid server!")

        let embed = await new Discord.RichEmbed()
            .setColor(config.Color)
            .setDescription(`${servername} - ${args[0]}\n\n**Players Online:** \`\`${total}\`\`\n\n${players}`);

        await message.channel.send(embed);
    } else {
        let description = "";
        let rdesc = "Server Status\n\n"
        rp(`${server1url}`).then((html) => {
            const json = JSON.parse(html);
            rdesc += "**Players Online:** ``" + json.players.online + "``\n\n";
        });

        for (let i = 0; i < servers.length; i++) {
            await rp(servers[i].url).then((html) => {
                const json = JSON.parse(html);
                if (json.error) description += `**${servers[i].name}:**\`\`Offline\`\``;
                else {
                    const playerCount = json.players.online;
                    description += `**${servers[i].name}:**\`\`${playerCount} players\`\`\n`;
                }
            })
        }
        let embed = new Discord.RichEmbed()
            .setColor(config.Color)
            .setFooter("Player and Server Status", bot.user.avatarURL)
            .setDescription(rdesc + description)
        message.channel.send(embed);
    }
}
module.exports.help = {
    name: "status"
}

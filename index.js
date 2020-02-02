const Discord = require("discord.js");
const request = require('request');
const fs = require('fs');
const bot = new Discord.Client();
const channels = require('./data/channels');
bot.commands = new Discord.Collection();
let yml = require("./yml.js");
let config;

if (fs.existsSync("./commands")) fs.readdir("./commands/", (err, files) => {

    if (err) {
        console.log(err);
    }
    let jsFiles = files.filter(f => f.split(".").pop() === "js");
    if (jsFiles.length <= 0) {
        console.log("Could not find any commands.");
        return;
    }
    jsFiles.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        bot.commands.set(props.help.name, props);
    });
    console.log(bot.commands.size + ' commands loaded.');
});

async function setupConfig() {
    config = await yml("./config.yml");
    await bot.login(config.Bot_Token);
}


function updateDiscordStatus() {
    bot.guilds.forEach(guild => {
        if (channels.hasOwnProperty(guild.id)) {
            const channelDiscordTotalMembers = channels[guild.id].filter(chan => chan.type === "channel" && chan.name === "totalMembersDiscord");
            const channelDiscordOnlineMembers = channels[guild.id].filter(chan => chan.type === "channel" && chan.name === "onlineMembersDiscord");
            if (channelDiscordTotalMembers.length > 0 && channelDiscordOnlineMembers.length > 0) {
                guild.channels.get(channelDiscordTotalMembers[0].id).setName(`⭐ Membres: ${guild.memberCount}`).catch(console.error);
                guild.channels.get(channelDiscordOnlineMembers[0].id).setName(`👥 En Ligne: ${guild.memberCount-guild.presences.size}`).catch(console.error);

            }
            const channelMinecraftServerOnline = channels[guild.id].filter(chan => chan.type === "channel" && chan.name === "onlineMembersMinecraft");
            if (channelMinecraftServerOnline.length > 0) {
                request(config.Minecraft_Online_Count_Url, {json: true}, (err, res, body) => {
                    if (body.hasOwnProperty('status') && body.status === true) {
                        guild.channels.get(channelMinecraftServerOnline[0].id).setName(`👥 ${body.count} connectés`).catch(console.error);
                        return;
                    } else if (err) {
                        console.log(err);
                    }
                    guild.channels.get(channelMinecraftServerOnline[0].id).setName(`👥 0 connectés`).catch(console.error);
                });

            }
        }


    });
}

setupConfig();

bot.once("ready", async () => {
    let gFile = require("./data/status.json");
    await bot.user.setActivity(config.activity || "Veloria", {type: 'PLAYING'});
    setInterval(updateDiscordStatus, 5000);
    console.log(`\x1b[33m`, `#-------------------------------#`);
    console.log('\x1b[32m', `VeloriaBot v${config.BOT_VERSION} is now ONLINE!`);
    console.log('\x1b[36m%s\x1b[0m', `Bot Activity: Playing ${gFile.activity || "Veloria"}`);
    console.log(`\x1b[33m`, `#-------------------------------#`);
});

// MESSAGE EVENT
bot.on("message", async message => {
    const config = await yml("./config.yml");
    if (message.author.bot || message.channel.type === "dm") {
        return;
    }
    fs.readFile("./data/prefixes.json", "utf8", async function (err, prefixes) {
        if (err) {
            return console.log(err);
        }
        prefixes = JSON.parse(prefixes);
        if (!prefixes[message.guild.id] || !prefixes[message.guild.id].prefix) {
            prefixes[message.guild.id] = {
                prefix: config.Bot_Prefix
            };
            fs.writeFile("./data/prefixes.json", JSON.stringify(prefixes), function (err) {
                if (err) console.log(err)
            });
        }

        // TICKET SYSTEM
        if (/\w+-\d+/.exec(message.channel.name)) {
            let tickets = require("./data/tickets.json");
            let ticket = tickets.find(t => t && t.channel === message.channel.id);
            if (ticket) {
                if (!ticket.messages) ticket.messages = [];
                ticket.messages.push({
                    content: message.content,
                    time: message.createdTimestamp,
                    author: message.author.username
                });
                fs.writeFile("./data/tickets.json", JSON.stringify(tickets), function (err) {
                    if (err) console.log(err)
                });
            }
        }

        let prefix = prefixes[message.guild.id].prefix;
        if (!config.Chat_Logs_Blacklist.includes(message.channel.name)) {
            fs.appendFile('./data/chatlogs.txt', `[${new Date().toISOString()}] [G: ${message.guild.name} (${message.guild.id})] [C: ${message.channel.name} (${message.channel.id})] [A: ${message.author.tag} (${message.author.id})] ${message.content}\n`, function (err) {
                if (err) throw err;
            });
        }

        if (!message.content.startsWith(prefix)) return;
        // COMMANDS CHANNEL
        if (config.Require_Commands_Channel.toLowerCase() === "true"
            && message.guild.roles.find(r => r.name.toLowerCase() === config.Bypass_Commands_Channel.toLowerCase())
            && message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition < message.guild.roles.find(r => r.name.toLowerCase() === config.Bypass_Commands_Channel.toLowerCase()).calculatedPosition
            && message.guild.channels.find(c => c.name.toLowerCase() === config.Commands_Channel.toLowerCase())
            && message.channel.name.toLowerCase() !== config.Commands_Channel.toLowerCase()
            && !message.channel.name.startsWith("ticket")) {
            const embed = new Discord.RichEmbed()
                .setColor(config.Error_Color)
                .setTitle("Mauvais channel!")
                .setDescription("Vous ne pouvez utiliser des commandes que dans le channel " + message.guild.channels.find(c => c.name.toLowerCase() === config.Commands_Channel.toLowerCase()) + "!");
            await message.delete(2500);
            message.channel.send(`<@${message.author.id}>`).then(msg => msg.delete(5000));
            return message.channel.send(embed).then(msg => msg.delete(5000));
        }

        const args = message.content.split(" ");
        const cmd = args.shift().slice(prefix.length);
        let commandFile = bot.commands.get(cmd);
        if (commandFile)
            try {
                if (config.Remove_Command_Messages === "true") {
                    await message.delete();
                }
                await commandFile.run(bot, message, args);
            } catch (e) {
                console.log(e);
            }
    });
});

process.on('uncaughtException', function (err) {
    console.log(err);
});

bot.on('error', async (err) => {
    console.log(err);
});

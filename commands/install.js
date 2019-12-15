const Discord = require("discord.js");
const fs = require("fs");
let yml = require("../yml.js");
const channels = require("../data/channels.json");


module.exports.run = async (bot, message, args) => {
    message.delete();
    if (!message.member.hasPermission("ADMINISTRATOR")) {
        return message.reply("Vous n'avez pas la permission d'installer VeloriaBot.").then(msg => {
            msg.delete(2000);
        });
    }

    if (!channels.hasOwnProperty(message.guild.id)) {
        channels[message.guild.id] = [];
    }

    const discordStatusCategory = channels[message.guild.id].filter(chan => chan.type === "category" && chan.name === "statusDiscordCategory");

    if (discordStatusCategory.length === 0) {
        await message.guild.createChannel("───STATUT DISCORD───", {
            position: 1,
            type: ('category')
        }).then(async discordParentChannel => {
            channels[message.guild.id].push({
                id: discordParentChannel.id,
                type: 'category',
                name: 'statusDiscordCategory'
            });

            await message.guild.createChannel(`⭐ Membres : X`, {
                type: 'voice', 'permissionOverwrites': [{
                    id: message.guild.defaultRole,
                    deny: ['CONNECT'],
                    allow: ['READ_MESSAGES'],
                }]
            }).then(chTotalMembers => {
                chTotalMembers.setParent(discordParentChannel);
                channels[message.guild.id].push({
                    id: chTotalMembers.id,
                    type: 'channel',
                    name: 'totalMembersDiscord'
                });
            });

            await message.guild.createChannel(`👥 En Ligne : X`, {
                type: 'voice', 'permissionOverwrites': [{
                    id: message.guild.defaultRole,
                    deny: ['CONNECT'],
                    allow: ['READ_MESSAGES'],
                }]
            }).then(chDiscordOnline => {
                chDiscordOnline.setParent(discordParentChannel);
                channels[message.guild.id].push({
                    id: chDiscordOnline.id,
                    type: 'channel',
                    name: 'onlineMembersDiscord'
                });
            });
        });
    }

    const minecraftStatusCategory = channels[message.guild.id].filter(chan => chan.type === "category" && chan.name === "statusServerCategory");

    if (minecraftStatusCategory.length === 0) {
        await message.guild.createChannel("───STATUT SERVEUR───", {
            position: 2,
            type: ('category')
        }).then(async minecraftServerParentChannel => {
            channels[message.guild.id].push({
                id: minecraftServerParentChannel.id,
                type: 'category',
                name: 'statusServerCategory'
            });

            await message.guild.createChannel(`🌐 PLAY.VELORIA.FR`, {
                type: 'voice', 'permissionOverwrites': [{
                    id: message.guild.defaultRole,
                    deny: ['CONNECT'],
                    allow: ['READ_MESSAGES'],
                }]
            }).then(chIpServer => {
                chIpServer.setParent(minecraftServerParentChannel);
                channels[message.guild.id].push({
                    id: chIpServer.id,
                    type: 'channel',
                    name: 'ipServer'
                });
            });

            await message.guild.createChannel(`👥 X connectés`, {
                type: 'voice', 'permissionOverwrites': [{
                    id: message.guild.defaultRole,
                    deny: ['CONNECT'],
                    allow: ['READ_MESSAGES'],
                }]
            }).then(chMinecraftConnected => {
                chMinecraftConnected.setParent(minecraftServerParentChannel);
                channels[message.guild.id].push({
                    id: chMinecraftConnected.id,
                    type: 'channel',
                    name: 'onlineMembersMinecraft'
                });
            });
        });
    }

    await fs.writeFile("./data/channels.json", JSON.stringify(channels), (err) => {
        if (err) {
            console.log(err)
        }
    });
};

module.exports.help = {
    name: "install"
};

if (process.platform !== "win32") require("child_process").exec("npm install n && n lts");
require("child_process").exec("npm install", async function (err, stdout) {
    let coinCooldown = new Set();
    let cooldown = new Set();
    const Discord = require("discord.js");
    const fs = require('fs');
    let coins = require("./data/coinsystem.json");
    let xp = require("./data/experience.json");
    const Embed = require('./embed.js');
    const bot = new Discord.Client({autoReconnect: true});
    bot.commands = new Discord.Collection();
    const coinCooldownSeconds = 5;
    const invites = {};
    let errors = [];
    module.exports.errors = errors;
    let yml = require("./yml.js")
    if (fs.existsSync("./commands")) fs.readdir("./commands/", (err, files) => {

        if (err) console.log(err);
        let jsfile = files.filter(f => f.split(".").pop() === "js");
        if (jsfile.length <= 0) {
            console.log("Could not find any commands.");
            return;
        }
        jsfile.forEach((f, i) => {
            let props = require(`./commands/${f}`);
            bot.commands.set(props.help.name, props);
        });
        console.log(bot.commands.size + ' commands loaded.');
    });
    let config;

    async function setupConfig() {
        config = await yml("./config.yml");
        bot.login(config.Bot_Token);
    }

    setupConfig();
    bot.on("ready", async () => {
        let gFile = require("./data/status.json");
        bot.user.setActivity(gFile.activity, {type: gFile.type});
        checkGiveaway();
        setInterval(checkGiveaway, 60000);
        checkStatuses();
        console.log(`\x1b[33m`, `#-------------------------------#`)
        console.log('\x1b[32m', `VeloriaBot v${config.BOT_VERSION} is now ONLINE!`)
        console.log('\x1b[36m%s\x1b[0m', `Bot Activity: ${gFile.type || "Not Set"} ${gFile.activity || ""}`)
        console.log(`\x1b[33m`, `#-------------------------------#`);
        bot.guilds.forEach(g => {
            g.fetchInvites().then(guildInvites => {
                invites[g.id] = guildInvites;
            });
        });

    });

    // ADVERTISEMENT CHECK
    function checkStatuses() {
        if (config.Status_Antiadvertisement_System && config.Status_Antiadvertisement_System.toLowerCase() == "true") {
            const whitelist = Object.values(config.Whitelisted_Websites).map(w => w.toLowerCase());
            bot.guilds.forEach(guild => {
                const channel = guild.channels.find(c => c.name.toLowerCase() == config.Status_Advertisement_Notification_Channel.toLowerCase());
                const bypass = guild.roles.find(r => r.name.toLowerCase() == config.Advertisement_Bypass_Role.toLowerCase());
                if (!channel) return;
                guild.fetchMembers().then(members => {
                    members.members.array().forEach(member => {
                        const status = member.user.presence.game;
                        if (status) {
                            if (member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= bypass.calculatedPosition) return;
                            const check = [status.name, status.url, status.details, status.state, status.assets ? status.assets.largeText : '', status.assets ? status.assets.smallText : ''];
                            check.forEach(c => {
                                if (/(https?:\/\/|www\.|https?:\/\/www\.).+/.exec(c)) {
                                    if (!whitelist.find(w => c.toLowerCase().includes(w.toLowerCase()))) {
                                        const embed = new Discord.RichEmbed()
                                            .setColor(config.Theme_Color)
                                            .setTitle("**ADVERTISEMENT DETECTED**")
                                            .addField("User", member)
                                            .addField("User ID", member.id)
                                            .addField("Detected", c);
                                        channel.send(embed);
                                    }
                                }
                            })
                        }
                    })
                })
            })
        }
    }

    // GIVEAWAY SYSTEM
    function checkGiveaway() {
        let giveaways = require("./data/giveaways.json");
        giveaways.forEach(giveaway => {
            if (giveaway.end <= Date.now() && !giveaway.ended) {
                //giveaway has ended
                giveaways.find(g => g == giveaway).ended = true;
                fs.writeFile('./data/giveaways.json', JSON.stringify(giveaways), function (err) {
                    if (err) console.log(err)
                })
                let guild = bot.guilds.get(giveaway.guild);
                let channel = guild.channels.get(giveaway.channel);
                if (guild && channel) {
                    channel.fetchMessage(giveaway.messageID).then(msg => {
                        let winners = [];
                        let reactions = [...giveaway.reactions];
                        for (let i = 0; i < giveaway.winners; i++) {
                            let user = reactions[~~(Math.random() * reactions.length)];
                            winners.push(user);
                            reactions.splice(reactions.indexOf(user), 1);
                        }
                        if (giveaway.reactions.length < 1) return channel.send("No one entered the giveaway.");
                        let embed = new Discord.RichEmbed()
                            .setColor(config.Theme_Color)
                            .setTitle("Giveaway Winner")
                            .setDescription("Congratulations to " + winners.filter(u => u).map(u => "<@" + u + ">").join(",") + " for winning the " + giveaway.name)
                            .addBlankField()
                            .setFooter("Open a ticket to claim your prize")
                            .setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/154/party-popper_1f389.png");
                        channel.send(embed);
                        channel.send(winners.filter(u => u).map(u => "<@" + u + ">").join(","))

                    })
                }
            }
        })
    }

    const usersInVoiceChannel = [];
    // TEMP CHANNELS
    bot.on('voiceStateUpdate', async (oldmember, newmember) => {
        const config = await yml('./config.yml');
        if (config.Temp_Channels_Enabled !== "true") return;
        if (!oldmember.voiceChannel && newmember.voiceChannel) {
            usersInVoiceChannel.push({user: newmember.id, joinedAt: Date.now()});
        } else if (oldmember.voiceChannel && newmember.voiceChannel && oldmember.voiceChannelID !== newmember.voiceChannelID && usersInVoiceChannel.map(u => u.user).includes(oldmember.id)) {
            usersInVoiceChannel.splice(usersInVoiceChannel.indexOf(usersInVoiceChannel.find(u => u.user == oldmember.id)), 1);
            usersInVoiceChannel.push({user: newmember.id, joinedAt: Date.now()});
        } else if (oldmember.voiceChannel && !newmember.voiceChannel && usersInVoiceChannel.map(u => u.user).includes(oldmember.id)) {
            usersInVoiceChannel.splice(usersInVoiceChannel.indexOf(usersInVoiceChannel.find(u => u.user == oldmember.id)), 1);
        }
        let tempVoiceChannel = oldmember.guild.channels.find(c => c.type == 'voice' && c.name.toLowerCase() == config.Join_To_Create.toLowerCase());
        let tempVoiceCategory = oldmember.guild.channels.find(c => c.type == 'category' && c.name.toLowerCase() == config.Temp_Channel_Category.toLowerCase());
        if (tempVoiceChannel) {
            if (newmember.voiceChannelID == tempVoiceChannel.id) {
                oldmember.guild.createChannel(oldmember.user.username, {type: 'voice'}).then(channel => {
                    channel.setParent(tempVoiceCategory);
                    oldmember.setVoiceChannel(channel.id);
                })
            }
        }
        if (oldmember.voiceChannel && oldmember.voiceChannel !== newmember.voiceChannel && oldmember.voiceChannel.parentID == tempVoiceCategory.id) {
            if (oldmember.voiceChannel.members.size == 0) oldmember.voiceChannel.delete();
        }
    })

    // JOIN EVENT
    bot.on("guildMemberAdd", async member => {
        console.log(`${member.user.tag} joined the server.`)

        if (!fs.existsSync("./commands")) return;

        const config = await yml("./config.yml");

        if (config.Join_Role !== `-NONE`) {
            let role = member.guild.roles.find(r => r.name.toLowerCase() == config.Join_Role.toLowerCase())
            member.addRole(role.id);
        }

        if (config.Join_Messages === `true`) {

            if (config.DM_Message !== `-NONE`) {
                let JoinMessageVariable_User = config.DM_Message.replace(/{user}/g, `<@${member.user.id}>`);
                let JoinMessageVariable_Tag = JoinMessageVariable_User.replace(/{tag}/g, `${member.user.tag}`);
                let DMMessageVariable_Total = JoinMessageVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

                member.send(DMMessageVariable_Total);
            }

            const channel = member.guild.channels.find(r => r.name.toLowerCase() === config.Join_Message_Channel.toLowerCase());

            let JoinMessageVariable_User = config.Join_Message.replace(/{user}/g, `<@${member.user.id}>`);
            let JoinMessageVariable_Tag = JoinMessageVariable_User.replace(/{tag}/g, `${member.user.tag}`);
            let JoinMessageVariable_Total = JoinMessageVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

            let HeaderVariable_User = config.Join_Embed_Header.replace(/{user}/g, `<@${member.user.id}>`)
            let HeaderVariable_Tag = HeaderVariable_User.replace(/{tag}/g, `${member.user.tag}`)
            let HeaderVariable_Total = HeaderVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

            let DescriptionVariable_User = config.Join_Embed_Description.replace(/{user}/g, `<@${member.user.id}>`)
            let DescriptionVariable_Tag = DescriptionVariable_User.replace(/{tag}/g, `${member.user.tag}`)
            let DescriptionVariable_Total = DescriptionVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

            let FooterVariable_User = config.Join_Embed_Footer.replace(/{user}/g, `<@${member.user.id}>`)
            let FooterVariable_Tag = FooterVariable_User.replace(/{tag}/g, `${member.user.tag}`)
            let FooterVariable_Total = FooterVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

            if (config.Join_Message === "embed") {

                let embed = new Discord.RichEmbed()
                    .setColor(config.Theme_Color)
                    .setTitle(HeaderVariable_Total)
                    .setDescription(DescriptionVariable_Total)

                if (config.Join_Embed_Timestamp === `true`) embed.setTimestamp();
                if (config.Join_Embed_Footer === `-NONE`) return channel.send(embed);

                embed.setFooter(FooterVariable_Total)
                return channel.send(embed);
            }

            channel.send(JoinMessageVariable_Total);
        }

        if (config.Invite_Rewards_System !== 'true') return;
        member.guild.fetchInvites().then(async guildInvites => {
            const cached = invites[member.guild.id];
            const invite = guildInvites.find(i => cached.get(i.code).uses < i.uses);
            member.guild.fetchInvites().then(async invites => {
                let invs = 0;
                invites.forEach(inv => {
                    if (inv.inviter.id == invite.inviter.id) invs += inv.uses;
                })
                Object.keys(config.Invite_Rewards).forEach(async invites => {
                    if (invs == invites) {
                        let role = member.guild.roles.find(r => r.name.toLowerCase() == config.Invite_Rewards[invites].toLowerCase());
                        if (!role) return;
                        member.guild.member(invite.inviter).addRole(role);
                        invite.inviter.send("You have achieved ``" + invites + "`` invites, so you have recieved the ``" + role.name + "`` role!").catch(err => {
                        });
                    }
                })
            })
        })
    });

    // LEAVE EVENT
    bot.on("guildMemberRemove", async member => {
        console.log(`${member.user.tag} left the server.`);

        if (!fs.existsSync("./commands")) return;
        const config = await yml("./config.yml");

        if (xp[member.id]) {
            delete xp[member.id];
            fs.writeFile("./data/experience.json", JSON.stringify(xp), function (err) {
                if (err) console.log(err)
            })
        }
        if (coins[member.id]) {
            delete coins[member.id];
            fs.writeFile("./data/coinsystem.json", JSON.stringify(coins), function (err) {
                if (err) console.log(err)
            })
        }

        if (config.Leave_Messages === `true`) {

            const channel = member.guild.channels.find(r => r.name.toLowerCase() === config.Leave_Message_Channel.toLowerCase());

            let LeaveMessageVariable_User = config.Leave_Message.replace(/{user}/g, `<@${member.user.id}>`);
            let LeaveMessageVariable_Tag = LeaveMessageVariable_User.replace(/{tag}/g, `${member.user.tag}`);
            let LeaveMessageVariable_Total = LeaveMessageVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

            let HeaderVariable_User = config.Leave_Embed_Header.replace(/{user}/g, `<@${member.user.id}>`)
            let HeaderVariable_Tag = HeaderVariable_User.replace(/{tag}/g, `${member.user.tag}`)
            let HeaderVariable_Total = HeaderVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

            let DescriptionVariable_User = config.Leave_Embed_Description.replace(/{user}/g, `<@${member.user.id}>`)
            let DescriptionVariable_Tag = DescriptionVariable_User.replace(/{tag}/g, `${member.user.tag}`)
            let DescriptionVariable_Total = DescriptionVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

            let FooterVariable_User = config.Leave_Embed_Footer.replace(/{user}/g, `<@${member.user.id}>`)
            let FooterVariable_Tag = FooterVariable_User.replace(/{tag}/g, `${member.user.tag}`)
            let FooterVariable_Total = FooterVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

            if (config.Leave_Message === "embed") {

                let embed = new Discord.RichEmbed()
                    .setColor(config.Theme_Color)
                    .setTitle(HeaderVariable_Total)
                    .setDescription(DescriptionVariable_Total)

                if (config.Leave_Embed_Timestamp === `true`) embed.setTimestamp();
                if (config.Leave_Embed_Footer === `-NONE`) return channel.send(embed);

                embed.setFooter(FooterVariable_Total)
                return channel.send(embed);
            }

            channel.send(LeaveMessageVariable_Total);
        }

    });

    // MESSAGE EVENT
    bot.on("message", async message => {
        const config = await yml("./config.yml");
        const lang = await yml("./lang.yml");
        if (message.author.bot) return;
        if (message.channel.type === "dm") return;
        // embed.send(message.channel);
        fs.readFile("./data/prefixes.json", "utf8", async function (err, prefixes) {
            if (err) return console.log(err);
            prefixes = JSON.parse(prefixes);
            if (!prefixes[message.guild.id] || !prefixes[message.guild.id].prefix) {
                prefixes[message.guild.id] = {
                    prefix: config.Bot_Prefix
                };
                fs.writeFile("./data/prefixes.json", JSON.stringify(prefixes), function (err) {
                    if (err) console.log(err)
                });
            }


            if (fs.existsSync("./commands")) {
                // COINS SYSTEM
                if (config.Coin_System == "true") {
                    if (!coins[message.author.id]) {
                        coins[message.author.id] = {
                            coins: 0
                        };
                    }
                    let coinAmt = Math.floor(Math.random() * 1) + parseInt(config.Coin_Amount);
                    let baseAmt = Math.floor(Math.random() * 1) + parseInt(config.Coin_Amount);
                    if (coinAmt === baseAmt) {
                        if (!coinCooldown.has(message.author.id)) {
                            coins[message.author.id] = {
                                coins: coins[message.author.id].coins + coinAmt
                            };
                            fs.writeFile("./data/coinsystem.json", JSON.stringify(coins), (err) => {
                                if (err) console.log(err)
                            });
                            coinCooldown.add(message.author.id);
                            setTimeout(function () {
                                coinCooldown.delete(message.author.id);
                            }, coinCooldownSeconds * 1000)
                        }
                    }
                }
                // XP SYSTEM
                if (config.Level_System == "true") {
                    if (!xp[message.author.id]) {
                        xp[message.author.id] = {level: 1, xp: 0};
                        fs.writeFile("./data/experience.json", JSON.stringify(xp), function (err) {
                            if (err) console.log(err)
                        });
                    }
                    let amt = ~~(Math.random() * 10) + config.Approximate_XP_Per_Message;
                    if (!cooldown.has(message.author.id)) {
                        let old = xp[message.author.id];
                        let xpNeeded = ~~((old.level * ((175 * old.level) * 0.5)) - amt - old.xp);
                        xp[message.author.id].xp += amt;
                        if (xpNeeded < 1) {
                            xp[message.author.id].level += 1;
                            let newLevel = xp[message.author.id].level;
                            let embed = new Discord.RichEmbed()
                                .setTitle("**LEVEL UP**")
                                .setDescription("<@" + message.author.id + ">, you just leveled up! You are now level **" + newLevel + "**!")
                                .setColor(config.Theme_Color);
                            message.channel.send(embed).then(msg => {
                                if (config.Delete_Level_Up_Embed === true) {
                                    msg.delete(5000);
                                }
                            })
                            const levelRoles = config.Level_Roles;
                            if (levelRoles[newLevel]) {
                                let role = message.guild.roles.find(r => r.name.toLowerCase() == levelRoles[newLevel].toLowerCase());
                                if (role) message.member.addRole(role).catch(console.log);
                            }
                        }
                        fs.writeFile("./data/experience.json", JSON.stringify(xp), function (err) {
                            if (err) console.log(err)
                        });
                        cooldown.add(message.author.id);
                        setInterval(function () {
                            cooldown.delete(message.author.id);
                        }, 10000)
                    }
                }
                // TICKET SYSTEM
                if (/\w+-\d+/.exec(message.channel.name)) {
                    let tickets = require("./data/tickets.json");
                    let ticket = tickets.find(t => t && t.channel == message.channel.id);
                    if (ticket) {
                        if (!ticket.messages) ticket.messages = [];
                        ticket.messages.push({
                            content: message.content,
                            time: message.createdTimestamp,
                            author: message.author.username
                        })
                        fs.writeFile("./data/tickets.json", JSON.stringify(tickets), function (err) {
                            if (err) console.log(err)
                        })
                    }
                }

                // FILTER SYSTEM
                if (config.Filter_System == "true") {

                    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Filter_Bypass_Role.toLowerCase());
                    if (!role || message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition < role.calculatedPosition) {
                        let filter = require("./data/filter.json");
                        let words = message.content.split(" ");

                        for (let i = 0; i < words.length; i++)
                            for (let x = 0; x < filter.length; x++)
                                if (filter[x].toLowerCase() == words[i].toLowerCase()) {
                                    message.delete();
                                    return message.channel.send(Embed({
                                        title: 'Filter',
                                        description: lang.Filter_Message
                                    })).then(msg => {
                                        msg.delete(5000)
                                    });
                                }
                    }
                    // ADVERTISEMENT SYSTEM
                    let bypass = message.guild.roles.find(r => r.name.toLowerCase() == config.Advertisement_Bypass_Role.toLowerCase());
                    if (config.Anti_Advertisement_System == "true" && bypass && message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition < bypass.calculatedPosition) {
                        if (/(https?:\/\/)?([^\s]+)?[^\s]+\.[^\s]+/.exec(message.content)) {
                            const whitelist = Object.values(config.Whitelisted_Websites).map(v => v.toLowerCase());
                            if (!whitelist.find(w => message.content.toLowerCase().includes(w.toLowerCase()))) {
                                message.delete();
                                return message.channel.send(Embed({
                                    title: 'Anti-Advertisement',
                                    description: lang.Advertisement_Message
                                })).then(msg => {
                                    msg.delete(5000)
                                });
                            }
                        }
                    }
                }
            }
            let prefix = prefixes[message.guild.id].prefix;
            if (!config.Chat_Logs_Blacklist.includes(message.channel.name)) fs.appendFile('./data/chatlogs.txt', `[${new Date().toISOString()}] [G: ${message.guild.name} (${message.guild.id})] [C: ${message.channel.name} (${message.channel.id})] [A: ${message.author.tag} (${message.author.id})] ${message.content}\n`, function (err) {
                if (err) throw err;
            });

            const responses = config.Auto_Responses;
            const response = responses[Object.keys(responses).find(r => r.toLowerCase() == message.content.toLowerCase())];
            if (response) return message.channel.send(Embed({description: response}));

            if (!message.content.startsWith(prefix)) return;
            // COMMANDS CHANNEL
            if (config.Require_Commands_Channel.toLowerCase() == "true"
                && message.guild.roles.find(r => r.name.toLowerCase() == config.Bypass_Commands_Channel.toLowerCase())
                && message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition < message.guild.roles.find(r => r.name.toLowerCase() == config.Bypass_Commands_Channel.toLowerCase()).calculatedPosition
                && message.guild.channels.find(c => c.name.toLowerCase() == config.Commands_Channel.toLowerCase())
                && message.channel.name.toLowerCase() !== config.Commands_Channel.toLowerCase()
                && !message.channel.name.startsWith("ticket")) {
                const embed = new Discord.RichEmbed()
                    .setColor(config.Error_Color)
                    .setTitle("Wrong channel!")
                    .setDescription("You can only use commands in " + message.guild.channels.find(c => c.name.toLowerCase() == config.Commands_Channel.toLowerCase()) + "!");
                message.delete(2500);
                message.channel.send(`<@${message.author.id}>`).then(msg => msg.delete(2500));
                return message.channel.send(embed).then(msg => msg.delete(2500));
            }

            const args = message.content.split(" ");
            const cmd = args.shift().slice(prefix.length);
            let commandfile = bot.commands.get(cmd);
            if (commandfile)
                try {
                    if (config.Remove_Command_Messages == "true") message.delete();
                    await commandfile.run(bot, message, args);
                } catch (e) {
                    errors.push({
                        error: e,
                        author: message.author.tag,
                        message: message.content,
                        time: Date.now()
                    });
                    module.exports.errors = errors;
                    console.log(e);
                }
        })
    });
    process.on('uncaughtException', function (err) {
        console.log(err);
        errors.push({
            error: err,
            author: "Unknown",
            message: "Unknown",
            time: Date.now()
        })
        module.exports.errors = errors;
    })
    bot.on('error', async (err) => {
        console.log(err);
    })
    const events = {
        MESSAGE_REACTION_ADD: 'messageReactionAdd',
        MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
    };
    bot.on('raw', async event => {
        if (!events.hasOwnProperty(event.t)) return;
        const {d: data} = event;
        const user = bot.users.get(data.user_id);
        const channel = bot.channels.get(data.channel_id);
        const message = await channel.fetchMessage(data.message_id);
        const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
        const member = message.guild.member(user.id);
        if (user.bot) return;
        // GIVEAWAYS
        if (event.t == "MESSAGE_REACTION_ADD") {
            let giveaways = require("./data/giveaways.json");
            let giveaway = giveaways.find(g => g.messageID == message.id);
            if (emojiKey == config.Emoji_Unicode && giveaway && !user.bot) {
                giveaways.find(g => g.messageID == message.id).reactions.push(user.id);
                fs.writeFile("./data/giveaways.json", JSON.stringify(giveaways), function (err) {
                    if (err) console.log(err)
                });
            }
        }
        if (event.t == "MESSAGE_REACTION_REMOVE") {
            let giveaways = require("./data/giveaways.json");
            let giveaway = giveaways.find(g => g.messageID == message.id);
            if (emojiKey == config.Emoji_Unicode && giveaway && giveaway.reactions.includes(user.id) && !user.bot) {
                giveaways.find(g => g.messageID == message.id).reactions.splice(giveaway.reactions.indexOf(user.id), 1);
                fs.writeFile("./data/giveaways.json", JSON.stringify(giveaways), function (err) {
                    if (err) console.log(err)
                });
            }
        }
        // ROLE MENU
        if (message.embeds.length > 0 && message.embeds[0].title && message.embeds[0].title.startsWith("Role Menu")) {
            const menu = message.embeds[0].title.split("Role Menu - ")[1];
            const configMenu = config.Role_Menu_Roles[menu];
            if (configMenu) {
                Object.keys(configMenu).forEach(async roleEmoji => {
                    if (emojiKey == roleEmoji) {
                        const role = message.guild.roles.find(r => r.name.toLowerCase() == configMenu[roleEmoji].toLowerCase());
                        if (!role) return message.channel.send(Embed({
                            preset: 'errorinfo',
                            description: `The ${configMenu[roleEmoji]} role does not exist.`
                        })).then(msg => msg.delete(5000));
                        if (member.roles.has(role.id)) {
                            await member.removeRole(role);
                            await message.channel.send(Embed({description: member + ", You no longer have the ``" + configMenu[roleEmoji] + "`` role!"})).then(msg => {
                                msg.delete(5000)
                            });
                        } else {
                            await member.addRole(role);
                            await message.channel.send(Embed({description: member + ", You now have the ``" + configMenu[roleEmoji] + "`` role!"})).then(msg => {
                                msg.delete(5000)
                            });
                        }
                    }
                })
            }
        }
        let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Accept_Deny_Suggestions.toLowerCase());
        if (member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition < role.calculatedPosition) return;
        if (channel.name.toLowerCase() == config.Suggestions_Channel.toLowerCase()) {
            if (message.embeds.length > 0) {
                let oldEmbed = message.embeds[0];
                let embed = new Discord.RichEmbed()
                    .setDescription(oldEmbed.description)
                if (emojiKey == config.Deny_Suggestions_Emoji) {
                    if (oldEmbed.title.endsWith(`**- DENIED**`)) return;
                    message.reactions.get(config.Deny_Suggestions_Emoji).remove();
                    let containsaccepted = `${oldEmbed.title} `
                    let replace = `${containsaccepted.replace(" **- ACCEPTED**", "")} **- DENIED**`
                    let finished = replace.replace(/\s+/g, ' ').trim();
                    embed.setColor("#e50220");
                    embed.setTitle(finished)
                    embed.setFooter(oldEmbed.footer.text, oldEmbed.footer.iconURL);
                    embed.setTimestamp()
                    message.edit(embed);
                } else if (emojiKey == config.Accept_Suggestions_Emoji) {
                    if (oldEmbed.title.endsWith(`**- ACCEPTED**`)) return;
                    message.reactions.get(config.Accept_Suggestions_Emoji).remove();
                    let containsdenied = `${oldEmbed.title} `
                    let replace = `${containsdenied.replace(" **- DENIED**", "")} **- ACCEPTED**`
                    let finished = replace.replace(/\s+/g, ' ').trim();
                    embed.setTitle(finished);
                    embed.setColor("#08d80f");
                    embed.setFooter(oldEmbed.footer.text, oldEmbed.footer.iconURL);
                    embed.setTimestamp()
                    message.edit(embed);
                }
            }
        }
        if (config.Verification_System == 'true') {
            if (message.id == config.Verification_Message_ID && emojiKey == config.Verification_Emoji) {
                const role = message.guild.roles.find(r => r.name == config.Verification_Role);
                const remrole = message.guild.roles.find(r => r.name == config.Join_Role)
                member.removeRole(remrole.id)
                member.addRole(role.id)
            }
        }
    })
});

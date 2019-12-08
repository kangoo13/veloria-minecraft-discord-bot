const Discord = require("discord.js");
const fs = require("fs");
let yml = require("../yml.js")


module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    message.delete();
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(config.No_Permission).then(msg => {
        msg.delete(2000)
    });


    message.guild.createChannel("Staff", "category").then(ch => {
        message.guild.createChannel(`Staff-Chat`, "text").then(ch => {
            let category = message.guild.channels.find("name", "Staff");
            ch.setParent(category);
        })
        message.guild.createChannel(`logs`, "text").then(ch => {
            let category = message.guild.channels.find("name", "Staff");
            ch.setParent(category);
            message.channel.send(`✅**VeloriaBot** has been installed. Now all you need to do is setup the perms for each channel!`)
        })
    });

    message.guild.createChannel("ADMINISTRATION", "category").then(ch => {
        message.guild.createChannel(`announcements`, "text").then(ch => {
            let category = message.guild.channels.find("name", "ADMINISTRATION");
            ch.setParent(category);
        })
        message.guild.createChannel(`updates`, "text").then(ch => {
            let category = message.guild.channels.find("name", "ADMINISTRATION");
            ch.setParent(category);
        })
        message.guild.createChannel(`giveaway`, "text").then(ch => {
            let category = message.guild.channels.find("name", "ADMINISTRATION");
            ch.setParent(category);
        })
        message.guild.createChannel(`welcome`, "text").then(ch => {
            let category = message.guild.channels.find("name", "ADMINISTRATION");
            ch.setParent(category);
        })
    });

    message.guild.createChannel("MAIN", "category").then(ch => {
        message.guild.createChannel(`main`, "text").then(ch => {
            let category = message.guild.channels.find("name", "MAIN");
            ch.setParent(category);
        })
        message.guild.createChannel(`bot-spam`, "text").then(ch => {
            let category = message.guild.channels.find("name", "MAIN");
            ch.setParent(category);
        })
        message.guild.createChannel(`suggestions`, "text").then(ch => {
            let category = message.guild.channels.find("name", "MAIN");
            ch.setParent(category);
        })
        message.guild.createChannel(`bug-reports`, "text").then(ch => {
            let category = message.guild.channels.find("name", "MAIN");
            ch.setParent(category);


            message.guild.createRole({
                name: "Admin",
                color: "#000000",
                permissions: []
            })
            message.guild.createRole({
                name: "Mod",
                color: "#000000",
                permissions: []
            })
            message.guild.createRole({
                name: "Helper",
                color: "#000000",
                permissions: []
            })
            message.guild.createRole({
                name: "Blacklisted",
                color: "#000000",
                permissions: []
            })
            message.guild.createRole({
                name: "Member",
                color: "#000000",
                permissions: []
            })

            let installchannel = message.guild.channels.find(`name`, "logs");
            let embed = new Discord.RichEmbed()
                .setColor("#1B55AA")
                .setThumbnail(bot.user.avatarURL)
                .setFooter("VeloriaBot - Made By: Kangoo13")
                .setAuthor("VeloriaBot Installtion Complete")
                .setDescription(`Thank you for installing VeloriaBot! \nThe following channels have been created \n \n**Administration** \n#announcements #updates #welcome \n**Main** \n#main #bot-spam #suggestions #bug-report \n \nThe folling roles have been created\n Member Helper Mod Admin \n \n**Installed by** \n${message.author} \n \nAny issues please contact us on our discord.`);
            installchannel.send(embed);

        })
    })
}

module.exports.help = {
    name: "install"
}

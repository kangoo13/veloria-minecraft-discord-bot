let yml = require("../yml.js");
const fs = require("fs");
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml");
    let prefixes = require("../data/prefixes.json");
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Prefix_Command.toLowerCase());
    if (!role) {
        return message.channel.send("The " + config.Prefix_Command + " role does not exist.");
    }
    if (!message.member.roles.has(role.id)) {
        return message.channel.send("You do not have permission for that command.");
    }
    if (args.length == 0) {
        return message.channel.send("You must provide a prefix.");
    }
    prefixes[message.guild.id].prefix = args[0];
    fs.writeFile("./prefixes.json", JSON.stringify(prefixes), function (err) {
        if (err) console.log(err)
    });
    message.channel.send("The prefix has been set to " + args[0]);
}
module.exports.help = {
    name: "setprefix"
}

const Command = require("../structures/command.js");
const {EmbedBuilder} = require('discord.js');
const config = require("../config");

module.exports = new Command({
        name: "support",
        aliases: ["sp"],
        description: "Displays associated links",
        permission: "SEND_MESSAGES",
        async run(message, args, client, slash) {
                const embed = new EmbedBuilder();
                embed.setColor('#44b868');
                embed.setDescription(`**Links:**\n
                Want to contribute?
                [Github]  https://github.com/rimba5446/sayuchan
                Support Server
                [Discord] https://dsc.gg/rzgroup\n`);
                
                return message.reply({embeds: [embed]});
        }
});
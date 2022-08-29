const Command = require("../structures/command.js");

module.exports = new Command({
	name: "stop",
	aliases: ['dc'],
	description: "Disconnects from the music channel and clears the server queue",
	permission: "SEND_MESSAGES",
	async run(message, args, client, slash) {
        const queue = client.player.getQueue(message.guild);
        if (queue) await queue.destroy(true);
		message.guild.members.me.voice.disconnect();
        slash ? message.reply({embeds: [{ description: `👋 The music playing on this server has been turned off, see you next time.`, color: 0x44b868 }]}) : message.react('👋');
	}
});
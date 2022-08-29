const Event = require("../structures/event.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = new Event("trackAdd", async (player, queue, track) => {
    player.client.io.to(queue.guild.id);
});

module.exports = new Event("connectionError", async (player, queue, error) => {
    console.log(`(${queue.guild.name}) connectionError: ${error.message}`);
});

module.exports = new Event("error", async (player, queue, error) => {
    console.log(`(${queue.guild.name}) error: ${error.message}`);
});

module.exports = new Event("queueEnd", async (player, queue) => {
    if(queue.npmessage && queue.npmessage.editable) {
        queue.npmessage.delete().catch(error=> {});
    }
});

module.exports = new Event("tracksAdd", async (player, queue, tracks) => {
    player.client.io.to(queue.guild.id);
});

module.exports = new Event("trackEnd", async (player, queue, track) => {
    if(queue.npmessage && queue.npmessage.editable) {
        queue.npmessage.delete().catch(error=> {});
    }
});

module.exports = new Event("trackStart", async (player, queue, track) => {
    if(!queue.guild.members.me.permissionsIn(queue.metadata.channel).has(player.client.requiredTextPermissions)) {
        console.log(`(${queue.guild.name}) destroying queue due to missing text channel permissions`);
        return queue.destroy();
    }
    if(queue.npmessage && queue.npmessage.editable) {
        queue.npmessage.delete().catch(error=> {});
    }
    let row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('buttoncontrol_play')
                .setLabel('Pause')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('buttoncontrol_skip')
                .setLabel('Skip')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('buttoncontrol_stop')
                .setLabel('Stop')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('buttoncontrol_queue')
                .setLabel('Show queue')
                .setStyle(ButtonStyle.Secondary)
        )
    const title = ['spotify-custom', 'soundcloud-custom'].includes(track.source) ?
        `${track.author} - ${track.title}` : `${track.title}`;
    queue.metadata.channel.send({
        embeds: [
            {
                title: `Now playing`,
                description: `**[${title}](${track.url})** - ${track.requestedBy}`,
                thumbnail: {
                    url: `${track.thumbnail}`
                },
                color: 0x44b868,
            }
        ],
        components: [row]
    }).then((msg) => {
        queue.npmessage = msg;
    });
});
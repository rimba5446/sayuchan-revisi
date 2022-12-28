const { Client, GatewayIntentBits } = require("discord.js");
const { Player } = require("discord-player");
const config = require("../config.js");
const fs = require("fs");
const { Lyrics } = require("@discord-player/extractor");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const extractor = require("../utils/extractor.js");
const playdl = require("play-dl");


class Bot extends Client {
	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.MessageContent
			]
		});

		this.commands = [];
		this.player = new Player(this);
		this.player.use("sayuchan", extractor);
		this.requiredVoicePermissions = [
			"VIEW_CHANNEL",
			"CONNECT",
			"SPEAK"
		];
		this.requiredTextPermissions = [
			"VIEW_CHANNEL",
			"SEND_MESSAGES",
			"READ_MESSAGE_HISTORY",
			"ADD_REACTIONS",
			"EMBED_LINKS"
		];
		this.prefix = process.env.PREFIX || config.prefix;
	}

	async init(token) {
		if (!token)
			return console.error("--- ERROR: Bot token is empty! Make sure to fill this out in config.js");

		config.clientId = process.env.CLIENTID || config.clientId;
		config.geniusApiToken = process.env.GENIUSAPITOKEN || config.geniusApiToken;

		playdl.getFreeClientID().then((clientID) => {
			playdl.setToken({
				soundcloud : { client_id : clientID }
			});
		});

		let count = 0;

		// commands
		const commandFiles = fs.readdirSync("./commands")
			.filter(file => file.endsWith(".js"));
		const commands = commandFiles.map(file => require(`../commands/${file}`));
		commands.forEach(cmd => {
			count++;
			this.commands.push(cmd);
		});
		console.log(`${count} commands loaded.`);
		count = 0;

		// slash commands
		if(config.clientId && config.clientId !== "") {
			const slashCommands = commands.map(cmd => ({
				name: cmd.name,
				description: cmd.description,
				options: cmd.options,
				defaultPermission: true
			}));
			const rest = new REST({ version: '9' }).setToken(token);
			await rest.put(Routes.applicationCommands(config.clientId), { body: slashCommands })
				.then(() => console.log('Global slash commands registered successfully.'))
				.catch(console.error);
		}
		
		// client events
		this.removeAllListeners();
		fs.readdirSync("./events")
			.filter(file => file.endsWith(".js"))
			.forEach(file => {
				count++;
				const event = require(`../events/${file}`);
				this.on(event.event, event.run.bind(null, this));
			});
		console.log(`${count} client events loaded.`);
		count = 0;

		// discord-player evsents
		fs.readdirSync("./sayuplayer")
			.filter(file => file.endsWith(".js"))
			.forEach(file => {
				count++;
				const event = require(`../sayuplayer/${file}`);
				this.player.on(event.event, event.run.bind(null, this.player))
			});
		console.log(`${count} player events loaded.`);

		// @discord-player/extractor lyrics
		this.lyrics = Lyrics.init(config.geniusApiToken);
		if (!config.geniusApiToken)
			console.log("No Genius API token provided. Lyrics feature might not work properly.");

		this.login(token);
	}
}

module.exports = Bot;

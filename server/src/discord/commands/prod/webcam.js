const {
    SlashCommandBuilder,
    userMention
} = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("webcam")
        .addUserOption(option => option.setName("user").setDescription("The user to show the webcam of"))
        .setDescription("Replies with Pong!"),
    async execute(interaction) {
        const target = interaction.options.getUser("user") ?? interaction.user;

        await interaction.reply(`Pong! ${userMention(target.id)}`);
    },
};

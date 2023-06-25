const {
    SlashCommandBuilder,
    userMention
} = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("webcam")
        .addUserOption(option => option.setName("user").setDescription("The user to show the webcam of"))
        .addStringOption(option => option.setName("forced-name").setDescription("Get a webcam link for a name"))
        .setDescription("Get a webcam link for a user"),
    async execute(interaction) {
        const target = interaction.options.getUser("user") ?? interaction.user;
        //TODO use internal actions to get webcam links here

        await interaction.reply(`Pong! ${userMention(target.id)}`);
    },
};

// Require the necessary discord.js classes
const { MessageFlagsBitField } = require('discord.js');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], partials: [Partials.Channel, Partials.Message] })

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (message.content.toLowerCase().includes("https")) {
        const regex = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/;
        var args = message.content.match(regex);
        if (args) {
            var link = args[0].toLowerCase();
            if (link.includes("twitter.com")) {
                var twitterSplit = link.split('/');
                link = twitterSplit[5].split('?')[0];
            }
            else if (link.includes("youtube.com") || link.includes("youtu.be")) {
                link = link.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/)[1];
            }
            
            message.channel.messages.fetch({ limit: 100 }).then(async messages => { // Fetches the last 100 messages of the channel were the command was given
                var filteredMsg = messages.filter(m => m.content.toLowerCase().includes(link) && m.id != message.id);
                if (filteredMsg.size > 0) {
                    message.channel.send("Scroll up. This link was already posted in this channel.");
                }
                else {
                    var promiseList = [];
                    var listOfChannels = [];
                    message.guild.channels.cache.forEach(async channel => {
                            if (channel.type == 0) {
                              promiseList.push(channel.messages.fetch({ limit: 100 }).then(messages => { // Fetches the last 100 messages of the channel were the command was given
                                  var filteredMsg = messages.filter(m => m.content.toLowerCase().includes(link) && m.id != message.id);
                                  if (filteredMsg.size > 0) {
                                      listOfChannels.push(channel.id);
                                  }
                              }));
                          }});
                    if (promiseList.length >= 1) {
                        await Promise.all(promiseList);
                    }
                    if (listOfChannels.length > 0) {
                        var messageToPost = "This link was already posted in these channel(s): ";
                        let i = 0;
                        listOfChannels.forEach(channelId => {
                            if (i == 0) {
                                messageToPost = messageToPost.concat(message.guild.channels.cache.get(channelId).toString());
                            }
                            else {
                                messageToPost = messageToPost.concat(", " + message.guild.channels.cache.get(channelId).toString());
                            }
                            i++;
                        })
                        message.channel.send(messageToPost);
                    }
                }
            })
        }
    }
});

// Login to Discord with your client's token
client.login(token);
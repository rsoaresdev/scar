import { PresenceUpdateStatus, ActivityType } from "discord.js";

export async function ready(client) {
 const registerTime = performance.now();
 client.debugger("info", "Registering slash commands...");
 client.application.commands
  .set(client.slashCommands)
  .catch((err) => {
   client.debugger("error", err);
  })
  .then((commands) => {
   const percentage = Math.round((commands.size / client.slashCommands.size) * 100);
   client.debugger("ready", `Successfully registered ${commands.size + client.additionalSlashCommands} (${percentage}%) slash commands (with ${client.additionalSlashCommands} subcommands) in ${client.performance(registerTime)}`);
  });

 client.debugger("ready", `Logged in as ${client.user.tag}, ID: ${client.user.id}`);

 const servers = await client.guilds.cache.size;
 const shard = client.ws.shards.first();
 const users = client.guilds.cache.filter((guild) => guild.available).reduce((acc, guild) => acc + guild.memberCount, 0);
 const shardCount = client.ws.shards.size;

 if (process.env.TOPGG_API_KEY) {
  client.debugger("info", `Posting stats to top.gg (${servers} servers, shard ${shard.id + 1}/${shardCount})`);

  const req = await fetch(`https://top.gg/api/bots/${client.user.id}/stats`, {
   method: "POST",
   headers: {
    Authorization: process.env.TOPGG_API_KEY,
    "Content-Type": "application/json",
   },
   body: JSON.stringify({
    server_count: servers,
    shard_id: shard.id,
    shard_count: shardCount,
   }),
  });

  if (req.status === 200) {
   client.debugger("info", "✅ Successfully posted stats to top.gg!");
  } else {
   client.debugger("error", "❌ Failed to post stats to top.gg!");
  }
 }

 if (process.env.DISCORDBOTSGG) {
  client.debugger("info", `Posting stats to discord.bots.gg (${servers} servers, shard ${shard.id + 1}/${shardCount})`);

  const req = await fetch(`https://discord.bots.gg/api/v1/bots/${client.user.id}/stats`, {
   method: "POST",
   headers: {
    Authorization: process.env.DISCORDBOTSGG,
    "Content-Type": "application/json",
   },
   body: JSON.stringify({
    guildCount: servers,
    shardId: shard.id,
    shardCount,
   }),
  });

  if (req.status === 200) {
   client.debugger("info", "✅ Successfully posted stats to discord.bots.gg!");
  } else {
   client.debugger("error", "❌ Failed to post stats to discord.bots.gg!");
  }
 }

 if (process.env.DISCORDBOTLIST) {
  client.debugger("info", `Posting stats to discordbotlist.com (${servers} servers, 0 voice connections, shard 1, ${users} users)`);

  const req = await fetch(`https://discordbotlist.com/api/v1/bots/${client.user.id}/stats`, {
   method: "POST",
   headers: {
    Authorization: process.env.DISCORDBOTLIST,
    "Content-Type": "application/json",
   },
   body: JSON.stringify({
    voice_connections: 0,
    shard_id: 1,
    guilds: servers,
    users: shard.id,
   }),
  });

  if (req.status === 200) {
   client.debugger("info", "✅ Successfully posted stats to discordbotlist.com!");
  } else {
   client.debugger("error", "❌ Failed to post stats to discordbotlist.com!");
  }
 }

 if (process.env.DISFORGE) {
  client.debugger("info", `Posting stats to disforge.com (${servers} servers)`);

  const req = await fetch(`https://disforge.com/api/botstats/${client.user.id}`, {
   method: "POST",
   headers: {
    Authorization: process.env.DISFORGE,
    "Content-Type": "application/json",
   },
   body: JSON.stringify({
    servers,
   }),
  });

  if (req.status === 200) {
   client.debugger("info", "✅ Successfully posted stats to disforge.com!");
  } else {
   client.debugger("error", "❌ Failed to post stats to disforge.com!");
  }
 }

 if (process.env.INFINITYBOTS) {
  client.debugger("info", `Posting stats to spider.infinitybots.gg (${servers} servers, ${shardCount} shards, ${users} users)`);

  const req = await fetch("https://spider.infinitybots.gg/bots/stats", {
   method: "POST",
   headers: {
    Authorization: process.env.INFINITYBOTS,
    "Content-Type": "application/json",
   },
   body: JSON.stringify({
    servers,
    shards: shardCount,
    users,
   }),
  });

  if (req.status === 200) {
   client.debugger("info", "✅ Successfully posted stats to spider.infinitybots.gg!");
  } else {
   client.debugger("error", "❌ Failed to post stats to spider.infinitybots.gg!");
  }
 }

 if (process.env.DISCORDS) {
  client.debugger("info", `Posting stats to discords.com (${servers} servers)`);

  const req = await fetch(`https://discords.com/bots/api/bot/${client.user.id}`, {
   method: "POST",
   headers: {
    Authorization: process.env.DISCORDS,
    "Content-Type": "application/json",
   },
   body: JSON.stringify({
    server_count: servers,
   }),
  });

  if (req.status === 200) {
   client.debugger("info", "✅ Successfully posted stats to discords.com!");
  } else {
   client.debugger("error", "❌ Failed to post stats to discords.com!");
  }
 }

 if (process.env.BOTLIST) {
  client.debugger("info", `Posting stats to api.botlist.me (${servers} servers)`);

  const req = await fetch(`https://api.botlist.me/api/v1/bots/${client.user.id}/stats`, {
   method: "POST",
   headers: {
    Authorization: process.env.BOTLIST,
    "Content-Type": "application/json",
   },
   body: JSON.stringify({
    server_count: servers,
   }),
  });

  if (req.status === 200) {
   client.debugger("info", "✅ Successfully posted stats to api.botlist.me!");
  } else {
   client.debugger("error", "❌ Failed to post stats to api.botlist.me!");
  }
 }

 if (process.env.VOIDBOTS) {
  client.debugger("info", `Posting stats to api.voidbots.net (${servers} servers, ${shardCount} shards)`);

  const req = await fetch(`https://api.voidbots.net/bot/stats/${client.user.id}`, {
   method: "POST",
   headers: {
    Authorization: process.env.VOIDBOTS,
    "Content-Type": "application/json",
   },
   body: JSON.stringify({
    server_count: servers,
    shard_count: shardCount,
   }),
  });

  if (req.status === 200) {
   client.debugger("info", "✅ Successfully posted stats to api.voidbots.net!");
  } else {
   client.debugger("error", "❌ Failed to post stats to api.voidbots.net!");
  }
 }

 client.user.setActivity(client.config.presence.activity.type === ActivityType.Custom ? client.config.presence.activity.state : client.config.presence.activity.name, {
  type: client.config.presence.activity.type,
 });

 client.user.setStatus(client.config.presence.status ?? PresenceUpdateStatus.Online);
}

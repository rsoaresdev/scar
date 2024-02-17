import { ActivityType, PresenceUpdateStatus } from "discord-api-types/v10";

const config = {};

config.ownerId = "880143303364980767";

config.presence = {
 status: PresenceUpdateStatus.Online, // PresenceUpdateStatus. Can be: "Online", "Idle", "DoNotDisturb", "Invisible" or "Offline" (Invisible and Offline are the same)
 activity: {
  // name: "?", // string. Activity name [not required when using custom type (4)
  state: "scarbot.com", // string. Activity state [required when using custom type (4)]
  type: ActivityType.Custom, // ActivityType. Activity type. Can be: "Playing", "Streaming", "Listening", "Watching", "Custom"

  /* Example: Using type 3 (Watching) with custom name
   name: "the world burn", // Note: Name is required when not using custom type (4)!
   type: ActivityType.Watching,
  */
 },
};

/*
  Donation links
 */
config.donate = {
 enabled: true, // boolean. Display donations command
 links: [
  {
   name: "PayPal",
   url: "https://paypal.me/sirramboia",
   icon: "🔗",
  },
 ],
};

/*
  Bot emojis
 */

config.jobs = ["Actor", "Architect", "Bricklayer", "Chef", "Dentist", "DJ", "Doctor", "Engineer", "Fireman", "Garbage Man", "Influencer", "Lawyer", "Machinist", "Mathematician", "Military", "Musician", "Nurse", "Pharmacist", "Photographer", "Police Officer", "Postman", "Programmer", "Soldier", "Teacher", "Video Editor", "Writer", "YouTuber"];

config.ore = ["Gold", "Silver", "Copper", "Iron", "Aluminum", "Lead", "Zinc", "Tin", "Nickel", "Uranium", "Platinum", "Mercury", "Coal", "Salt", "Diamond", "Ruby", "Sapphire", "Emerald", "Topaz", "Quartz", "Amethyst", "Opal", "Turquoise", "Garnet", "Jade", "Lapis Lazuli", "Malachite", "Agate", "Obsidian", "Halite", "Calcite", "Fluorite", "Graphite", "Talc", "Sulfur", "Magnetite", "Hematite", "Cinnabar", "Bauxite", "Kaolinite", "Gypsum"];

config.stocks = ["Adidas (ADS)", "Amazon (AMZN)", "Apple Inc. (AAPL)", "Bank of America (BAC)", "McDonald's (MCD)", "Meta Platforms Inc. (FB)", "Microsoft (MSFT)", "Netflix (NFLX)", "Nike (NKE)", "NVIDIA Corp. (NVDA)", "Samsung Electronics (KRX)", "Tesla Inc. (TSLA)", "Alphabet Inc. (GOOGL)", "Alibaba Group Holding Ltd (BABA)", "Boeing Co. (BA)", "Cisco Systems Inc. (CSCO)", "Coca-Cola Co. (KO)", "General Electric Co. (GE)", "Johnson & Johnson (JNJ)", "JPMorgan Chase & Co. (JPM)", "Pfizer Inc. (PFE)", "Procter & Gamble Co. (PG)", "Sony Group Corporation (SONY)", "Twitter Inc. (TWTR)", "Visa Inc. (V)", "Walt Disney Co. (DIS)", "Zoom Video Communications Inc. (ZM)", "3M Co. (MMM)", "Abbott Laboratories (ABT)", "Accenture plc (ACN)", "Adobe Inc. (ADBE)", "AIG (AIG)", "Altria Group Inc. (MO)", "American Express Co. (AXP)", "AT&T Inc. (T)", "Berkshire Hathaway Inc. (BRK.B)", "BMW AG (BMWYY)", "Chevron Corporation (CVX)", "Colgate-Palmolive Co. (CL)", "Comcast Corporation (CMCSA)", "Delta Air Lines Inc. (DAL)", "eBay Inc. (EBAY)", "Exxon Mobil Corporation (XOM)", "Ford Motor Co. (F)", "General Motors Company (GM)", "Goldman Sachs Group Inc. (GS)", "IBM (IBM)", "Intel Corporation (INTC)", "JPMorgan Chase & Co. (JPM)", "Morgan Stanley (MS)", "Oracle Corporation (ORCL)", "PepsiCo Inc. (PEP)", "Philip Morris International Inc. (PM)", "Qualcomm Inc. (QCOM)", "Salesforce.com Inc. (CRM)", "Starbucks Corporation (SBUX)", "T-Mobile US Inc. (TMUS)", "Toyota Motor Corporation (TM)", "Uber Technologies Inc. (UBER)", "Verizon Communications Inc. (VZ)", "Walmart Inc. (WMT)", "Xerox Holdings Corporation (XRX)", "Yum! Brands Inc. (YUM)"];

config.emojis = {
 success: "<:tickYes:1006201222329548810>",
 error: "<:tickNo:1006201302700806204>",
 member: "<:members:926660532294004767>",
 role: "<:role:1183523328560992368>",
 stage_channel: "<:stage:915618419246780517>",
 discord_badges: "<a:discordbadges:1183523503387975700>",
 status_online: "<:online:915585399097810964>",
 status_idle: "<:idle:917918573459021877>",
 status_dnd: "<:dnd:915585399131361280>",
 discord_partner: "<:partner:1183523919953670174>",
 owner_crown: "<:owner:915618420349886524>",
 bot_badge_part_1: "<:botbadge1:1183524302453227590>",
 bot_badge_part_2: "<:botbadge2:1183524321784770671>",
 hypesquad: "<:hypesquadevents:1183524796248633414>",
 hypesquad_balance: "<:hypesquadbalance:1183524817043996692>",
 hypesquad_bravery: "<:hypesquadbravery:1183524814774882414>",
 hypesquad_brilliance: "<:hypesquadbrilliance:1183524813264928808>",
 verified_bot_developer: "<:dev:915619735096426577> ",
 early_supporter: "<:earlysupporter:1183525375586877631>",
 bug_hunter_1: "<:bughunterbadge1:1183525433820577872>",
 bug_hunter_2: "<:bugbusterbadge2:1183525657683177512>",
 discord_employee: "<:discordstaff:1183525974780944525>",
 mention: "<:mention:1183525976282517572>",

 // Categories emoji
 categories: [
  {
   name: "general",
   emoji: "🧱",
  },
  {
   name: "moderation",
   emoji: "🛠️",
  },
  {
   name: "fun",
   emoji: "😆",
  },
  {
   name: "utility",
   emoji: "🔧",
  },
  {
   name: "levels",
   emoji: "📈",
  },
  {
   name: "reputation",
   emoji: "👍",
  },
  {
   name: "image",
   emoji: "🖼️",
  },
  {
   name: "giveaway",
   emoji: "🎉",
  },
  {
   name: "ticket",
   emoji: "🎫",
  },
  {
   name: "reaction",
   emoji: "🎭",
  },
  {
   name: "economy",
   emoji: "💵",
  },
  {
   name: "reaction role",
   emoji: "🍂",
  },
  {
   name: "tickets",
   emoji: "🎫",
  },
 ],

 // Log types
 logs: [
  {
   type: "profanity",
   emoji: "🤬",
  },
  {
   type: "embed_color",
   emoji: "🎨",
  },
  {
   type: "command_change",
   emoji: "<:slash_commands:963333541565968384>",
  },
  {
   type: "category_change",
   emoji: "📂",
  },
  {
   type: "public_dashboard",
   emoji: "🔗",
  },
  {
   type: "vanity",
   emoji: "🔗",
  },
 ],

 // Utility emojis
 sparkles: "✨",
 edit: "📝",
 giveaway: "🎉",
 flag_gb: ":flag_gb:",
 flag_jp: ":flag_jp:",
 book: "📚",
 counting: "🔢",
 star2: "🌟",
 calendar_spillar: "🗓️",
 star: "⭐",
 barchart: "📊",
 link: "🔗",
 cat: "🐱",
 stopwatch: "⏱️",
 question: "❔",
 screw_that: "🔩",
 lock: "🔐",
 arrows_clockwise: "🔃",
 color: "🎨",

 gift: "https://i.imgur.com/DJuTuxs.png",
 gamble: "https://i.pinimg.com/originals/9a/f1/4e/9af14e0ae92487516894faa9ea2c35dd.gif",
};

export const botConfig = config;

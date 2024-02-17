/* eslint-disable complexity */

import { globalConfig } from "@scar/config";
import prismaClient from "@scar/database";
import { getGuildMember, getServer } from "@scar/util/functions/guild";
import { ChannelType } from "discord-api-types/v10";
import { getSession } from "lib/session";
import { redirect, notFound } from "next/navigation";
import { Block } from "@/components/Block";
import { Tickets } from "@/components/client/settings/automod/Tickets";
import { Header1, Header5 } from "@/components/Headers";
import "tippy.js/dist/backdrop.css";
import "tippy.js/animations/shift-away.css";
import "tippy.js/dist/tippy.css";
import { Icons, iconVariants } from "@/components/Icons";

export const metadata = {
 title: "Tickets",
 description: "Configure the ticket system.",
};

async function syncTicketsSystem(guildId) {
 const createdRule = await prismaClient.tickets.findFirst({
  where: {
   guildId: guildId,
  },
 });

 return createdRule;
}

export default async function ServerTickets({ params }) {
 const session = await getSession();
 if (!session || !session.access_token) redirect("/auth/login");
 const { server } = params;
 const serverDownload = await getServer(server);
 if (!serverDownload || serverDownload.code === 10004 || !serverDownload.bot) return notFound();
 const serverMember = await getGuildMember(serverDownload.id, session.access_token);
 if (
  // prettier
  !serverMember ||
  !serverMember.permissions_names ||
  !serverMember.permissions_names.includes("ManageGuild") ||
  !serverMember.permissions_names.includes("Administrator")
 )
  return notFound();

 await prismaClient.guild.upsert({
  where: {
   guildId: serverDownload.id,
  },
  update: {},
  create: {
   guildId: serverDownload.id,
  },
  include: {
   autoMod: {
    where: {
     guildId: serverDownload.id,
    },
   },
  },
 });

 const syncTicketsSystemRetrieve = (await syncTicketsSystem(serverDownload.id)) || false;
 var ticketsSystemEnabled = syncTicketsSystemRetrieve && syncTicketsSystemRetrieve.firstMessage && syncTicketsSystemRetrieve.firstMessage !== "";

 const allCategoriesFetch = await fetch(`https://discord.com/api/v${globalConfig.apiVersion}/guilds/${serverDownload.id}/channels`, {
  method: "GET",
  headers: {
   Authorization: `Bot ${process.env.TOKEN}`,
  },
 }).then((res) => res.json());

 const allCategories = allCategoriesFetch
  .map((channel) => {
   if (channel.type !== ChannelType.GuildCategory) return null;

   return {
    id: channel.id,
    name: channel.name,
   };
  })
  .filter(Boolean);

 return (
  <>
   <Header1 className="mb-1 flex items-center justify-start gap-2 text-left text-2xl font-bold">
    <Icons.ticket className={iconVariants({ variant: "large" })} />
    Tickets
   </Header1>
   <Header5 className="mb-4 mt-2 !justify-start !text-left">
    <span>Implement and customize the ticketing system for your server to efficiently provide support to the members of your community.</span>
   </Header5>
   <Block className="mb-4">
    {Boolean(ticketsSystemEnabled) ? ( // prettier
     <Tickets serverId={serverDownload.id} enabled={Boolean(ticketsSystemEnabled)} allCategories={allCategories} firstMessage={syncTicketsSystemRetrieve.firstMessage || ""} ctOpen={syncTicketsSystemRetrieve.openCategory || null} ctClose={syncTicketsSystemRetrieve.closeCategory || null} />
    ) : (
     <Tickets serverId={serverDownload.id} enabled={false} allCategories={allCategories} firstMessage="" ctOpen={null} ctClose={null} />
    )}
   </Block>
  </>
 );
}

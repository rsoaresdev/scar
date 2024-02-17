"use client";

import clsx from "clsx";
import { useState } from "react";
import { toast } from "sonner";
import { Block } from "@/components/Block";
import { ButtonPrimary } from "@/components/Buttons";
import Switch from "@/components/client/shared/Switch";
import { SingleCategorySelect } from "@/components/client/shared/SingleCategorySelect";
import { Tooltip } from "@/components/client/shared/Tooltip";
import { Input } from "@/components/Input";
import { Header2 } from "@/components/Headers";
import { Icons, iconVariants } from "@/components/Icons";

export function Tickets({ serverId, enabled, allCategories, firstMessage, ctOpen, ctClose }) {
 const [isEnabled, setIsEnabled] = useState(enabled ?? false);
 const [loading, setLoading] = useState(false);
 const [message, setMessage] = useState(firstMessage || "");
 const [categoryOpen, setCategoryOpen] = useState(ctOpen || "");
 const [categoryClose, setCategoryClose] = useState(ctClose || "");

 const save = async (change = true) => {
  setLoading(true);
  if (change) {
   setIsEnabled(!isEnabled);
   // Checks if the switch is disabled and sets message, categoryOpen and categoryClose to an empty string
   setMessage("");
   setCategoryOpen("");
   setCategoryClose("");
  }

  const loading = toast.loading(`Turning ${!isEnabled ? "on" : "off"} tickets...`);

  const res = await fetch("/api/settings/automod/tickets", {
   method: "POST",
   headers: {
    "Content-Type": "application/json",
   },
   body: JSON.stringify({
    id: serverId,
    enabled: change ? !isEnabled : isEnabled,
    firstMessage: message,
    categoryOpen: categoryOpen,
    categoryClose: categoryClose,
   }),
  });

  setLoading(false);

  if (!res.ok) {
   if (change) setIsEnabled(isEnabled);
   try {
    const json = await res.json();
    return toast.error(json.error ?? "Something went wrong", {
     id: loading,
    });
   } catch (e) {
    return toast.error("Something went wrong", {
     id: loading,
    });
   }
  }

  const json = await res.json();

  if (json.code === 200) {
   return toast.success(json.message ?? "Tickets enabled!", {
    id: loading,
   });
  } else {
   change && setIsEnabled(isEnabled);
   return toast.error(json.error ?? "Something went wrong", {
    id: loading,
   });
  }
 };

 return (
  <>
   <Header2>
    <Icons.ticket className={iconVariants({ variant: "large", className: "!stroke-2" })} />
    Tickets <Switch enabled={Boolean(isEnabled)} onChange={save} disabled={loading} />
   </Header2>

   <div
    className={clsx(
     {
      "max-h-0 opacity-0": isEnabled,
      "max-h-[500px] opacity-100 ": !isEnabled,
     },
     "transition-all duration-200 ease-in-out"
    )}
   >
    <div className="border-accent-primary bg-accent-primary/10 my-4 flex flex-row flex-wrap items-start whitespace-nowrap rounded-md border p-4">
     <span className="mr-1 flex flex-row items-center whitespace-nowrap font-bold">
      <Icons.info className={iconVariants({ variant: "normal", className: "stroke-accent-primary mr-1" })} />
      Note:
     </span>
     <span className="whitespace-normal">You have to enable this rule to change its settings!</span>
    </div>
   </div>

   <div
    className={clsx({
     "pointer-events-none cursor-not-allowed opacity-50": !isEnabled && !loading,
     "pointer-events-none opacity-50": loading,
     "cursor-default opacity-100": isEnabled,
    })}
   >
    <Block className="mb-4 !py-3">
     <div className="flex  flex-row flex-wrap items-center gap-2 text-center">
      <Tooltip content="First message of the ticket channel, after opening, automatically sent by the bot">
       <span className="flex cursor-help items-center gap-2 font-bold">
        <Icons.messageSquareMore className={iconVariants({ variant: "normal", className: "stroke-accent-primary" })} />
        First message:
       </span>
      </Tooltip>
      <Input type="text" max_length={250} value={message || ""} onChange={(e) => setMessage(e.target.value)} className="w-full" />
     </div>
     <div className="mb-2 ml-4 mt-2 text-left">
      <span className="text-left">Use the following placeholders to personalize your message:</span>
      <ul className="mb-4 ml-4 list-inside list-disc text-left">
       <li>
        <span className="font-mono text-gray-300">{"{userId}"}</span>: User ID.
       </li>
       <li>
        <span className="font-mono text-gray-300">{"{userMention}"}:</span> User mention.
       </li>
       <li>
        <span className="font-mono text-gray-300">{"{guildName}"}</span>: Server name.
       </li>
       <li>
        <span className="font-mono text-gray-300">{"{guildMemberCount}"}</span>: Total member count in the server
       </li>
      </ul>
     </div>
     <div className="mt-4 flex flex-row flex-wrap items-center gap-2 text-center">
      <Tooltip content="Category on which the open tickets should be saved">
       <span className="flex cursor-help items-center gap-2 font-bold">
        <Icons.folderPlus className={iconVariants({ variant: "normal", className: "stroke-accent-primary" })} />
        Open Tickets Category:
       </span>
      </Tooltip>
      <SingleCategorySelect allCategories={allCategories} categories={categoryOpen} setCategory={setCategoryOpen} multiple={false} />
     </div>
     <div className="mt-4 flex flex-row flex-wrap items-center gap-2 text-center">
      <Tooltip content="Category on which the close tickets should be saved">
       <span className="flex cursor-help items-center gap-2 font-bold">
        <Icons.folderMinus className={iconVariants({ variant: "normal", className: "stroke-accent-primary" })} />
        Close Tickets Category:
       </span>
      </Tooltip>
      <SingleCategorySelect allCategories={allCategories} categories={categoryClose} setCategory={setCategoryClose} multiple={false} />
     </div>
    </Block>

    <ButtonPrimary className="mt-4" onClick={() => save(false)} disabled={!isEnabled || loading}>
     {loading ? (
      <>
       <Icons.refresh className={iconVariants({ variant: "button", className: "animate-spin" })} />
       Saving...
      </>
     ) : (
      <>
       <Icons.check className={iconVariants({ variant: "button" })} />
       Save
      </>
     )}
    </ButtonPrimary>
   </div>
  </>
 );
}

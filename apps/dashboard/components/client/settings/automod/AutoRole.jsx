"use client";

import clsx from "clsx";
import { useState } from "react";
import { toast } from "sonner";
import { Block } from "@/components/Block";
import { ButtonPrimary } from "@/components/Buttons";
import { SingleRoleSelect } from "@/components/client/shared/SingleRoleSelect";
import Switch from "@/components/client/shared/Switch";
import { Tooltip } from "@/components/client/shared/Tooltip";
import { Header2 } from "@/components/Headers";
import { Icons, iconVariants } from "@/components/Icons";

export function AutoRole({ serverId, enabled, allRoles }) {
 const [isEnabled, setIsEnabled] = useState(enabled ?? false);
 const [loading, setLoading] = useState(false);
 const [selectedRole, setSelectedRole] = useState("");

 const save = async (change = true) => {
  setLoading(true);
  if (change) {
   setIsEnabled(!isEnabled);
   // Checks if the switch is disabled and sets selectedRole to an empty string
   setSelectedRole("");
  }

  const loading = toast.loading(`Turning ${!isEnabled ? "on" : "off"} auto-role...`);

  const res = await fetch("/api/settings/automod/auto-role", {
   method: "POST",
   headers: {
    "Content-Type": "application/json",
   },
   body: JSON.stringify({
    id: serverId,
    enabled: change ? !isEnabled : isEnabled,
    selectedRole: selectedRole,
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
   return toast.success(json.message ?? "Auto-role enabled!", {
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
    <Icons.briefcase className={iconVariants({ variant: "large", className: "!stroke-2" })} />
    Auto-Role <Switch enabled={isEnabled} onChange={save} disabled={loading} />
   </Header2>
   <p className="mb-4 text-left">
    <span>Automatically give a role when a member join the server.</span>
   </p>

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
     <div className="flex w-fit flex-row flex-wrap items-center gap-2 text-center font-bold">
      <Tooltip content="Give a specific role when a member join the server.">
       <span className="flex cursor-help items-center gap-2">
        <Icons.users className={iconVariants({ variant: "normal", className: "stroke-accent-primary" })} />
        Role to Attribute:
       </span>
      </Tooltip>
      <SingleRoleSelect // prettier
       allRoles={allRoles}
       selectedRole={selectedRole}
       setSelectedRole={setSelectedRole}
      />
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

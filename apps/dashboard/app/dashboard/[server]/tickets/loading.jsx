/* eslint-disable complexity */

import { Block } from "@/components/Block";
import { ButtonPrimary } from "@/components/Buttons";
import { Header1, Header2, Header5 } from "@/components/Headers";
import { InputSkeleton } from "@/components/Skeletons";
import "tippy.js/dist/backdrop.css";
import "tippy.js/animations/shift-away.css";
import "tippy.js/dist/tippy.css";
import { Icons, iconVariants } from "@/components/Icons";

export const metadata = {
 title: "Tickets",
 description: "Configure the ticket system.",
};

export default async function Loading() {
 return (
  <>
   <Header1 className="mb-1 flex items-center justify-start gap-2 text-left text-2xl font-bold">
    <Icons.ticket className={iconVariants({ variant: "large", className: "!stroke-2" })} />
    Tickets <Icons.refresh className={iconVariants({ variant: "normal", className: "stroke-accent-primary animate-spin" })} />
   </Header1>
   <Header5 className="mb-4 mt-2 !justify-start !text-left">
    <span>Implement and customize the ticketing system for your server to efficiently provide support to the members of your community.</span>
   </Header5>

   <Block className="mb-4">
    <Header2>
     <Icons.ticket className={iconVariants({ variant: "large", className: "!stroke-2" })} />
     Tickets <Icons.refresh className={iconVariants({ variant: "normal", className: "stroke-accent-primary animate-spin" })} />
    </Header2>

    <Block className="mb-4 mt-3 !py-3">
     <div className="flex flex-row flex-wrap gap-2">
      <span className="flex w-fit items-center gap-2 font-bold">
       <Icons.messageSquareMore className={iconVariants({ variant: "large", className: "stroke-accent-primary" })} />
       Message:
      </span>
      <InputSkeleton className="!h-[37.6px] !w-40" />
     </div>
     <div className="mt-4 flex flex-row flex-wrap items-center gap-2 text-center">
      <span className="flex w-fit items-center gap-2 font-bold">
       <Icons.folderPlus className={iconVariants({ variant: "large", className: "stroke-accent-primary" })} />
       Open Tickets Category:
      </span>
      <InputSkeleton className="!h-[37.6px] !w-40" />
     </div>
     <div className="mt-4 flex flex-row flex-wrap items-center gap-2 text-center">
      <span className="flex w-fit items-center gap-2 font-bold">
       <Icons.folderMinus className={iconVariants({ variant: "large", className: "stroke-accent-primary" })} />
       Close Tickets Category:
      </span>
      <InputSkeleton className="!h-[37.6px] !w-40" />
     </div>
    </Block>

    <ButtonPrimary className="mt-4" disabled={true}>
     <>
      <Icons.check className={iconVariants({ variant: "button" })} />
      Save
     </>
    </ButtonPrimary>
   </Block>
  </>
 );
}

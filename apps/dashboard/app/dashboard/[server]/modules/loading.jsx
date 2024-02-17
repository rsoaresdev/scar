import { rangeRandomizer } from "@scar/util/functions/util";
import { Block } from "@/components/Block";
import { Header1, Header2 } from "@/components/Headers";
import { Icons, iconVariants } from "@/components/Icons";
import { InputSkeleton, TextSkeleton } from "@/components/Skeletons";

export default async function Loading() {
 return (
  <>
   <Header1>
    <Icons.packagePlus className={iconVariants({ variant: "extraLarge" })} />
    Modules
   </Header1>
   <Block className="mt-4">
    <Header2>
     <Icons.blocks className={iconVariants({ variant: "large", className: "!stroke-2" })} />
     Categories
    </Header2>
    <p className="mb-4 mt-2 text-left">Enable or disable categories of commands.</p>

    <div className="flex flex-wrap items-stretch justify-start gap-8">
     {Array.from({ length: 8 }).map((_, i) => (
      <TextSkeleton
       key={i}
       style={{
        width: `${rangeRandomizer(200, 500)}px !important`,
       }}
       className="!h-44 !min-w-[400px] !max-w-none"
      />
     ))}
    </div>
   </Block>

   <Block className="mt-4">
    <Header2>
     <Icons.slash className={iconVariants({ variant: "large", className: "!stroke-2" })} />
     Commands
    </Header2>
    <p className="mb-4 mt-2 text-left">Enable or disable commands.</p>

    <InputSkeleton className="mb-4 !w-1/2" />
    <div className="flex flex-wrap items-stretch justify-start gap-8">
     {Array.from({ length: 8 }).map((_, i) => (
      <TextSkeleton key={i} className="!h-44 !w-full" />
     ))}
    </div>
   </Block>
  </>
 );
}

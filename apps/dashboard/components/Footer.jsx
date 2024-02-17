"use client";

import { dashboardConfig } from "@scar/config";
import clsx from "clsx";
import Link from "next/link";
import { useSelectedLayoutSegment, usePathname } from "next/navigation";
import { Icons } from "./Icons";
import Image from "@/components/client/shared/Image";

export function Footer() {
 const segment = useSelectedLayoutSegment();
 const pathname = usePathname();

 return (
  <footer
   className={clsx(
    {
     "!w-full md:!pl-[17.5rem]": segment === "dashboard" && pathname !== "/dashboard",
     "w-full xl:w-4/5": segment !== "dashboard" || pathname === "/dashboard",
    },
    "mx-auto px-4 py-10 md:px-8 lg:px-16"
   )}
  >
   <div className="mx-auto pt-10">
    <div className="grid grid-cols-2 gap-9 md:grid-cols-5">
     <div className="col-span-3 flex flex-col justify-center">
      <div className="flex items-center space-x-5">
       <Link href="/">
        <p className="flex cursor-pointer items-center text-2xl font-semibold">
         <Image className="mr-2 h-9 min-h-9 w-9 min-w-9 rounded-full" src={dashboardConfig.logo} alt={`${dashboardConfig.title} logo`} width={36} height={36} />
         {dashboardConfig.title}
        </p>
       </Link>
      </div>

      <div className="mt-3 text-xs text-zinc-400">
       <p>
        This dashboard is an <b>improved</b> and <b>completely reworked</b> public instance of Majo.exe, a free and open-source project.
        <br />
        You can support its development by{" "}
        <Link href="https://github.com/IgorKowalczyk/majo.exe" className="font-normal text-neutral-200 hover:underline" target="_blank">
         clicking here
        </Link>
        .
       </p>
      </div>
     </div>

     <div className="col-span-1 text-neutral-300">
      <p className="mt-3 font-semibold text-white sm:mb-3 sm:mt-0 ">Useful links</p>
      <div>
       <Link href={`${dashboardConfig.url}/discord`} className="mt-2 block duration-100 hover:text-gray-300 hover:underline motion-reduce:transition-none">
        Discord Server
       </Link>
       <Link href={`${dashboardConfig.url}/status`} className="mt-2 block duration-100 hover:text-gray-300 hover:underline motion-reduce:transition-none">
        Status Page
       </Link>
      </div>
     </div>

     <div className="col-span-1 text-neutral-300">
      <p className="mt-3 font-semibold text-white sm:mb-3 sm:mt-0 ">Legal</p>
      <div>
       <Link href={`/legal/terms-of-service`} className="mt-2 block duration-100 hover:text-gray-300 hover:underline motion-reduce:transition-none">
        Terms of Service
       </Link>
       <Link href={`/legal/privacy-policy`} className="mt-2 block duration-100 hover:text-gray-300 hover:underline motion-reduce:transition-none">
        Privacy Policy
       </Link>
      </div>
     </div>
    </div>
    <div className="mt-4 flex text-center text-neutral-300">
     <p className="text-sm font-semibold opacity-80">
      Copyright &copy; 2021 - {new Date().getFullYear()}{" "}
      <Link className="hover:opacity-80" href="https://github.com/sirramboia">
       SirRamboia
      </Link>
      , All rights reserved.
     </p>
    </div>
   </div>
  </footer>
 );
}

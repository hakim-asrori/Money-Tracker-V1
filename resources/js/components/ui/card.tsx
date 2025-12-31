import * as React from "react"

import { cn, formatNumber } from "@/lib/utils"
import { Label } from "./label"
import { format } from "date-fns"
import { Wallet2Icon } from "lucide-react"
import { WalletInterface } from "@/types"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-4 rounded-xl border py-4",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-4", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-4", className)}
      {...props}
    />
  )
}

function CardWallet({wallet, className = "bg-lprimary text-white", ...props}: { wallet: WalletInterface, className?: string } & React.ComponentProps<"div">) {
    return (
        <Card
            className={cn(
                'relative overflow-hidden shadow-none',
                className
            )}
            {...props}
        >
            <div className="absolute -top-36 -right-20 z-20 flex size-72 items-center justify-center rounded-full bg-black/5">
                <div className="size-56 rounded-full bg-black/10" />
            </div>
            <CardHeader className="z-50">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-lg">
                        {wallet.name}
                    </CardTitle>
                    <Wallet2Icon />
                </div>
            </CardHeader>
            <CardContent className="z-50">
                <h1 className="text-sm">Balance</h1>
                <CardTitle className="line-clamp-1 text-2xl font-bold">
                    Rp {formatNumber(wallet.balance)}
                </CardTitle>
            </CardContent>
            <CardFooter className="z-50 justify-between">
                <div>
                    <h1 className="text-sm">Category</h1>
                    <Label className="font-bold">
                        {wallet.category.name}
                    </Label>
                </div>
                <div className="text-end">
                    <h1 className="text-sm">Created At</h1>
                    <Label className="font-bold">
                        {format(wallet.created_at, 'dd MMM yyyy')}
                    </Label>
                </div>
            </CardFooter>
        </Card>
    )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardWallet }

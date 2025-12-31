import InputError from '@/components/input-error';
import { HeaderSection } from '@/components/mobiles/header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn, formatNumber } from '@/lib/utils';
import walletTransfer from '@/routes/wallet-transfer';
import { WalletInterface } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';

export default function WalletTransferCreate({
    wallets,
    walletOrigin,
}: {
    wallets: WalletInterface[];
    walletOrigin: WalletInterface;
}) {
    const [amount, setAmount] = useState<number>(0);
    const [fee, setFee] = useState<number>(0);

    return (
        <Form {...walletTransfer.store.form()} disableWhileProcessing>
            {({ processing, errors }) => {
                return (
                    <div className="relative min-h-svh space-y-3 bg-secondary">
                        <input
                            type="hidden"
                            name="wallet_origin"
                            value={walletOrigin.id}
                        />
                        <Head title="Create Transfer" />
                        <HeaderSection
                            title="Transfer"
                            path={walletTransfer.index().url}
                            className={cn(
                                'space-y-5 bg-lsecondary px-4 py-3',
                                processing && '[&_a]:pointer-events-none',
                            )}
                        />
                        <Card className="-mt-3 rounded-none border-0">
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Source of Funding
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-10">
                                        <AvatarFallback className="text-lprimary">
                                            {walletOrigin.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h1 className="line-clamp-1 font-bold">
                                            {walletOrigin.name}
                                        </h1>
                                        <p className="text-sm">
                                            Rp{' '}
                                            {formatNumber(walletOrigin.balance)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-none border-0">
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Choose Wallet Target
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select
                                    name="wallet_target"
                                    disabled={processing}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Wallet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {wallets.map((wallet) => (
                                            <SelectItem
                                                key={wallet.id}
                                                value={wallet.id.toString()}
                                            >
                                                {wallet.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.wallet_target} />
                            </CardContent>
                        </Card>
                        <Card className="rounded-none border-0">
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Amount
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <InputGroup>
                                        <InputGroupInput
                                            name="amount"
                                            type="number"
                                            max={walletOrigin.balance}
                                            placeholder="real amount (ex. 100000)"
                                            className="placeholder:text-sm"
                                            disabled={processing}
                                            onChange={(e) => {
                                                if (
                                                    isNaN(
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                ) {
                                                    setAmount(0);
                                                    return;
                                                }
                                                setAmount(
                                                    parseInt(e.target.value),
                                                );
                                            }}
                                        />
                                        <InputGroupAddon>Rp</InputGroupAddon>
                                    </InputGroup>
                                    <InputError message={errors.amount} />
                                </div>
                                <div>
                                    <InputGroup>
                                        <InputGroupInput
                                            name="fee"
                                            type="number"
                                            max={walletOrigin.balance}
                                            placeholder="fee amount (ex. 1000)"
                                            className="placeholder:text-sm"
                                            disabled={processing}
                                            onChange={(e) => {
                                                if (
                                                    isNaN(
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                ) {
                                                    setFee(0);
                                                    return;
                                                }

                                                setFee(
                                                    parseInt(e.target.value),
                                                );
                                            }}
                                        />
                                        <InputGroupAddon>Rp</InputGroupAddon>
                                    </InputGroup>
                                    <InputError message={errors.fee} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-none border-0">
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Published At
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    type="datetime-local"
                                    name="published_at"
                                    disabled={processing}
                                />
                                <InputError message={errors.published_at} />
                            </CardContent>
                        </Card>
                        <div className="px-4">
                            <Button
                                variant={'lsecondary'}
                                className="w-full"
                                disabled={processing || amount + fee < 1}
                            >
                                Transfer
                            </Button>
                        </div>
                    </div>
                );
            }}
        </Form>
    );
}

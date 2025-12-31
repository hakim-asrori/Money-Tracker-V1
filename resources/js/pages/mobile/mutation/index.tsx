import { EmptyData } from '@/components/mobiles/empty';
import { HeaderSection } from '@/components/mobiles/header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { cn, formatNumber, getModelNamePretty, limitString } from '@/lib/utils';
import { dashboard } from '@/routes';
import { MetaPagination, MutationInterface } from '@/types';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { useState } from 'react';

export default function Mutation({
    mutations,
}: {
    mutations: MetaPagination<MutationInterface>;
}) {
    const [mutationSelected, setMutationSelected] =
        useState<MutationInterface>();

    return (
        <AppMobileDetailLayout className="relative space-y-4">
            <Head title="Mutations" />
            <HeaderSection
                title="Mutations"
                path={dashboard().url}
            ></HeaderSection>

            <div className="space-y-3 px-4 pt-5">
                {mutations.data.length < 1
                    ? EmptyData({ title: 'No history mutations' })
                    : mutations.data.map((mutation) => (
                          <div
                              className={cn(
                                  'mb-3 flex items-start justify-between gap-4 border-b pb-3',
                              )}
                              key={mutation.id}
                              onClick={() => setMutationSelected(mutation)}
                          >
                              <div className="flex items-center gap-3">
                                  <Avatar>
                                      {mutation.type === 'cr' ? (
                                          <AvatarFallback className="bg-green-200 text-green-700">
                                              <ArrowDownIcon size={20} />
                                          </AvatarFallback>
                                      ) : (
                                          <AvatarFallback className="bg-red-200 text-red-700">
                                              <ArrowUpIcon size={20} />
                                          </AvatarFallback>
                                      )}
                                  </Avatar>
                                  <div>
                                      <h1 className="text-sm font-bold">
                                          {limitString(
                                              mutation.description,
                                              25,
                                          )}
                                      </h1>
                                      <h1 className="text-xs">
                                          {format(
                                              mutation.created_at,
                                              'dd MMM yyyy, HH:mm a',
                                          )}
                                      </h1>
                                  </div>
                              </div>
                              <h1 className="text-lg font-bold">
                                  Rp {formatNumber(mutation.amount)}
                              </h1>
                          </div>
                      ))}
            </div>

            <Dialog
                open={Boolean(mutationSelected)}
                onOpenChange={(e) => setMutationSelected(undefined)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detail</DialogTitle>
                    </DialogHeader>
                    {mutationSelected && (
                        <>
                            <div className="flex flex-col items-center justify-center gap-3">
                                <Avatar className="size-16">
                                    {mutationSelected!.type === 'cr' ? (
                                        <AvatarFallback className="bg-green-200 text-green-700">
                                            <ArrowDownIcon />
                                        </AvatarFallback>
                                    ) : (
                                        <AvatarFallback className="bg-red-200 text-red-700">
                                            <ArrowUpIcon />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <h1
                                    className={cn(
                                        'text-xl font-bold',
                                        mutationSelected!.type === 'cr'
                                            ? 'text-green-700'
                                            : 'text-red-700',
                                    )}
                                >
                                    Rp {formatNumber(mutationSelected!.amount)}
                                </h1>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm">Created at</p>
                                    <h1 className="font-medium">
                                        {format(
                                            mutationSelected!.created_at,
                                            'dd MMM yyyy, HH:mm a',
                                        )}
                                    </h1>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm">Type</p>
                                    <h1 className="font-medium">
                                        {getModelNamePretty(
                                            mutationSelected!.mutable_type,
                                        )}
                                    </h1>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm">Description</p>
                                <h1 className="font-medium">
                                    {mutationSelected!.description}
                                </h1>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppMobileDetailLayout>
    );
}

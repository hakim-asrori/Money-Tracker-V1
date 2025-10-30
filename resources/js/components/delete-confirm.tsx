import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@inertiajs/react';
import { TrashIcon } from 'lucide-react';
import { Spinner } from './ui/spinner';

export function DeleteConfirm({
    form,
    show,
    onClose,
}: {
    form: any;
    show: boolean;
    onClose?: () => void;
}) {
    return (
        <Dialog open={show} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <Form {...form} className="mb-0">
                    {({ processing, wasSuccessful }) => {
                        if (wasSuccessful) {
                            onClose?.();
                        }

                        return (
                            <div className="space-y-5">
                                <DialogHeader>
                                    <DialogTitle>
                                        Are you sure absolutely sure?
                                    </DialogTitle>
                                    <DialogDescription>
                                        This action cannot be undone. Are you
                                        sure you want to permanently delete this
                                        file from our servers?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        variant={'destructive'}
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Spinner />
                                        ) : (
                                            <TrashIcon />
                                        )}
                                        Confirm
                                    </Button>
                                </DialogFooter>
                            </div>
                        );
                    }}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

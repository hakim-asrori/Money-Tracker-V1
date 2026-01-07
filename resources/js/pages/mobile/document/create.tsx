import { HeaderSection } from '@/components/mobiles/header';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLoading } from '@/contexts/loading-context';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import {
    extractDate,
    extractDiscount,
    extractProducts,
    extractTotal,
    normalizeText,
    runOCR,
    splitLines,
} from '@/lib/ocr';
import { cn, formatNumber, showToast } from '@/lib/utils';
import { dashboard } from '@/routes';
import documentRouter from '@/routes/document';
import {
    CategoryInterface,
    DocumentSourceInterface,
    SharedData,
    WalletInterface,
} from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ScanTextIcon, UserPlusIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Types
interface Target {
    id: string;
    user_id?: number;
    name: string;
    amount: number;
}

interface CreateProps {
    source: DocumentSourceInterface;
    categories: CategoryInterface[];
    wallets: WalletInterface[];
}

interface SectionProps extends CreateProps {
    setIsMatching: (isMatch: boolean) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}

// Main Component
export default function Create({ source, wallets, categories }: CreateProps) {
    const page = usePage().props as any as SharedData;
    const [isMatch, setIsMatch] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (page.flash.error || page.flash.warning) {
            showToast(page.flash);
        }
    }, [page.flash]);

    return (
        <AppMobileDetailLayout className="relative min-h-svh space-y-4">
            <Head title="Document" />

            <HeaderSection
                title={!isMatch ? 'Document' : 'Preview'}
                path={dashboard().url}
                rightNode={
                    isMatch && (
                        <div
                            className="flex justify-end"
                            onClick={() => setOpen(true)}
                        >
                            <UserPlusIcon size={20} />
                        </div>
                    )
                }
            >
                <span>&nbsp;</span>
            </HeaderSection>

            <Section
                source={source}
                categories={categories}
                wallets={wallets}
                setIsMatching={setIsMatch}
                open={open}
                setOpen={setOpen}
            />
        </AppMobileDetailLayout>
    );
}

// Section Component
function Section({
    source,
    categories,
    wallets,
    setIsMatching,
    open,
    setOpen,
}: SectionProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { setIsLoading } = useLoading();

    const [document, setDocument] = useState<File | null>(null);
    const [isMatch, setIsMatch] = useState(false);
    const [total, setTotal] = useState(0);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [rawText, setRawText] = useState('');
    const [errors, setErrors] = useState<any>({});
    const [targets, setTargets] = useState<Target[]>([]);

    // Camera initialization and cleanup
    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({
                video: {
                    facingMode: {
                        exact: 'environment',
                    },
                },
            })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            })
            .catch((error) => {
                navigator.mediaDevices
                    .getUserMedia({ video: true })
                    .then((stream) => {
                        if (videoRef.current) {
                            videoRef.current.srcObject = stream;
                            videoRef.current.play();
                        }
                    })
                    .catch((err) => {
                        console.error('Gagal mengakses kamera:', err);
                        router.visit(dashboard().url);
                    });
            });

        return () => {
            const tracks = (
                videoRef.current?.srcObject as MediaStream
            )?.getTracks();
            tracks?.forEach((track) => track.stop());
        };
    }, []);

    // OCR trigger
    useEffect(() => {
        if (document && source) {
            handleOCR();
        }
    }, [document, source]);

    // Handlers
    const canvasToFile = (
        canvas: HTMLCanvasElement,
        filename = 'capture.png',
        type = 'image/png',
        quality = 0.92,
    ): Promise<File> => {
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) return;
                    const file = new File([blob], filename, { type });
                    resolve(file);
                },
                type,
                quality,
            );
        });
    };

    const handleCapture = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, 320, 240);
                const converter = await canvasToFile(canvas);
                setDocument(converter);
            }
        }
    };

    const handleUpload = (file: File) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(img.src);
        };

        img.src = URL.createObjectURL(file);
        setDocument(file);
    };

    const handleOCR = async () => {
        setIsLoading(true);

        const regex = new RegExp(source.name.toLowerCase(), 'i');

        try {
            const result = await runOCR(document!);
            const normalized = normalizeText(result);

            if (normalized.toLowerCase().search(regex) === -1) {
                return showToast({
                    warning: "Document doesn't match",
                });
            }

            const lines = splitLines(normalized);

            const products = extractProducts(lines, source.name)
                .map((p: any) => `${p.name} (${p.qty} x ${p.price})`)
                .join(', ');

            const discount = formatNumber(
                extractDiscount(normalized, source.name),
            );

            setDescription(`${products}\n\nDis: ${discount}`.toLowerCase());
            setDate(extractDate(normalized));
            setTotal(extractTotal(normalized, source.name));
            setTitle(`Purchase Receipt (${source.name})`);
            setRawText(normalized);
            setIsMatch(true);
            setIsMatching(true);
        } catch (error) {
            setIsMatch(false);
            setIsMatching(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTarget = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const amount = Number(formData.get('amount'));

        if (amount < 1) {
            toast.error('Amount must be greater than 0');
            return;
        }

        setTargets((prev) => {
            const existingTarget = prev.find(
                (t) => t.name.toLowerCase() === name.toLowerCase(),
            );

            if (existingTarget) {
                return prev.map((target) =>
                    target.name.toLowerCase() === name.toLowerCase()
                        ? { ...target, amount }
                        : target,
                );
            }

            return [
                ...prev,
                {
                    id: window.crypto.randomUUID(),
                    name,
                    amount,
                },
            ];
        });

        setOpen(false);
        e.currentTarget.reset();
    };

    const handleRemoveTarget = (targetId: string) => {
        setTargets(targets.filter((t) => t.id !== targetId));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.append('image', document!);
        formData.append('raw_text', rawText);
        formData.append('source', source.id.toString());

        router.post(documentRouter.store(), formData, {
            onSuccess: () => {
                e.currentTarget.reset();
            },
            onError: (e) => {
                setErrors(e);
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    return isMatch ? (
        <PreviewMode
            total={total}
            title={title}
            date={date}
            description={description}
            targets={targets}
            wallets={wallets}
            categories={categories}
            errors={errors}
            open={open}
            setOpen={setOpen}
            handleSubmit={handleSubmit}
            handleAddTarget={handleAddTarget}
            handleRemoveTarget={handleRemoveTarget}
        />
    ) : (
        <CameraMode
            videoRef={videoRef}
            canvasRef={canvasRef}
            handleCapture={handleCapture}
            handleUpload={handleUpload}
        />
    );
}

// Preview Mode Component
function PreviewMode({
    total,
    title,
    date,
    description,
    targets,
    wallets,
    categories,
    errors,
    open,
    setOpen,
    handleSubmit,
    handleAddTarget,
    handleRemoveTarget,
}: {
    total: number;
    title: string;
    date: string;
    description: string;
    targets: Target[];
    wallets: WalletInterface[];
    categories: CategoryInterface[];
    errors: any;
    open: boolean;
    setOpen: (open: boolean) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleAddTarget: (e: React.FormEvent<HTMLFormElement>) => void;
    handleRemoveTarget: (targetId: string) => void;
}) {
    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className={cn(
                    'space-y-4',
                    targets.length < 1 ? 'pb-14' : 'pb-20',
                )}
            >
                <input type="hidden" name="amount" value={total} />
                <input type="hidden" name="fee" value={0} />

                <FormFieldsCard
                    wallets={wallets}
                    categories={categories}
                    title={title}
                    date={date}
                    description={description}
                    errors={errors}
                />

                {targets.length > 0 && (
                    <SplitBillCard
                        targets={targets}
                        handleRemoveTarget={handleRemoveTarget}
                    />
                )}

                <TotalCard total={total} />
            </form>

            <AddTargetDialog
                open={open}
                setOpen={setOpen}
                handleAddTarget={handleAddTarget}
            />
        </div>
    );
}

// Form Fields Card Component
function FormFieldsCard({
    wallets,
    categories,
    title,
    date,
    description,
    errors,
}: {
    wallets: WalletInterface[];
    categories: CategoryInterface[];
    title: string;
    date: string;
    description: string;
    errors: any;
}) {
    return (
        <Card className="rounded-none border-0">
            <CardContent>
                <FieldGroup className="gap-3">
                    <Field>
                        <FieldLabel htmlFor="wallet">Wallet</FieldLabel>
                        <Select name="wallet">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="" />
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
                        <FieldError>{errors.wallet}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="category">Category</FieldLabel>
                        <Select name="category">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id.toString()}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError>{errors.category}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>Title</FieldLabel>
                        <Input name="title" defaultValue={title} />
                        <FieldError>{errors.title}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>Published At</FieldLabel>
                        <Input
                            type="datetime-local"
                            name="published_at"
                            max={format(new Date(), 'yyyy-MM-dd 23:59')}
                            defaultValue={date || ''}
                        />
                        <FieldError>{errors.published_at}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>Description</FieldLabel>
                        <Textarea
                            name="description"
                            defaultValue={description}
                        />
                        <FieldError>{errors.description}</FieldError>
                    </Field>
                </FieldGroup>
            </CardContent>
        </Card>
    );
}

// Split Bill Card Component
function SplitBillCard({
    targets,
    handleRemoveTarget,
}: {
    targets: Target[];
    handleRemoveTarget: (targetId: string) => void;
}) {
    return (
        <Card className="rounded-none border-0">
            <input type="hidden" name="is_debt" value="1" />
            <CardHeader>
                <CardTitle className="text-sm">
                    Split Bill ({targets.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-decimal space-y-2 pl-6">
                    {targets.map((target, index) => (
                        <li key={target.id} className="text-sm capitalize">
                            <input
                                type="hidden"
                                name={`targets[${index}][name]`}
                                value={target.name}
                            />
                            <input
                                type="hidden"
                                name={`targets[${index}][amount]`}
                                value={target.amount}
                            />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p>{target.name}</p>
                                    <h1 className="font-bold">
                                        Rp {formatNumber(target.amount)}
                                    </h1>
                                </div>
                                <XIcon
                                    size={16}
                                    className="text-destructive"
                                    onClick={() =>
                                        handleRemoveTarget(target.id)
                                    }
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

// Total Card Component
function TotalCard({ total }: { total: number }) {
    return (
        <Card className="fixed bottom-0 w-full rounded-none">
            <CardHeader>
                <h1 className="text-sm">
                    Total:{' '}
                    <span className="text-base font-bold">
                        Rp {formatNumber(total)}
                    </span>
                </h1>
            </CardHeader>
            <CardContent>
                <Button className="w-full" variant={'lprimary'}>
                    Create Transaction
                </Button>
            </CardContent>
        </Card>
    );
}

// Add Target Dialog Component
function AddTargetDialog({
    open,
    setOpen,
    handleAddTarget,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    handleAddTarget: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Add Target for Split Bill</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleAddTarget} className="space-y-4">
                    <FieldGroup className="gap-3">
                        <Field>
                            <FieldLabel htmlFor="name">Name</FieldLabel>
                            <Input name="name" required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="amount">Amount</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    type="number"
                                    inputMode="numeric"
                                    name="amount"
                                    defaultValue={0}
                                    required
                                    min={1}
                                />
                                <InputGroupAddon>Rp</InputGroupAddon>
                            </InputGroup>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <Button variant={'lprimary'}>Add Target</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Camera Mode Component
function CameraMode({
    videoRef,
    canvasRef,
    handleCapture,
    handleUpload,
}: {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    handleCapture: () => void;
    handleUpload: (file: File) => void;
}) {
    return (
        <div>
            <div className="relative">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 z-20 h-[70vh] w-full object-cover"
                />
            </div>

            <canvas
                ref={canvasRef}
                width="320"
                height="240"
                className="hidden"
            />

            <div className="absolute bottom-0 w-full px-4 py-6">
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        onClick={handleCapture}
                        variant={'lprimary'}
                        size={'lg'}
                    >
                        <ScanTextIcon /> Take Photo
                    </Button>

                    <Label
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'lg' }),
                        )}
                    >
                        <ScanTextIcon /> Upload Image
                        <input
                            type="file"
                            id="banner"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) {
                                    const file = e.target.files[0];
                                    if (file) {
                                        handleUpload(file);
                                    }
                                }
                            }}
                        />
                    </Label>
                </div>
            </div>
        </div>
    );
}

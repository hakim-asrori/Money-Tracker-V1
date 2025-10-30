export default function Heading({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="mb-5 flex items-center justify-between gap-2">
            <div className="space-y-0.5">
                <h2 className="text-xl font-semibold tracking-tight">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </div>
    );
}

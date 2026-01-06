import EmptyPng from '@/images/empty.png';

export function EmptyData({
    title = 'Data not found',
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <div className="flex flex-col items-center">
            <img src={EmptyPng} alt="" className="size-52" />
            <h1 className="font-bold">{title}</h1>
            {description && <p className="text-sm">{description}</p>}
        </div>
    );
}

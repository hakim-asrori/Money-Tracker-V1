import React, { useEffect } from 'react';

export default function LoaderScreen({ show = false }: { show?: boolean }) {
    const getLoader = async () => {
        const { infinity } = await import('ldrs');
        infinity.register();
    };

    useEffect(() => {
        getLoader();
    }, []);

    return (
        <div className="fixed top-0 left-0 z-[60] flex h-full w-full flex-col items-center justify-center gap-5 bg-black/80">
            {React.createElement('l-infinity', {
                size: 65,
                speed: 1.3,
                stroke: 5,
                strokeLength: 0.15,
                bgOpacity: 0.1,
                color: '#ffffff',
            })}
        </div>
    );
}

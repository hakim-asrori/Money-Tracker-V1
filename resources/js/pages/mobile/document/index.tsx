import { HeaderSection } from '@/components/mobiles/header';
import { Button } from '@/components/ui/button';
import AppMobileDetailLayout from '@/layouts/app/app-mobile-detail-layout';
import { dashboard } from '@/routes';
import { Head, router } from '@inertiajs/react';
import { ScanTextIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Index() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, 320, 240);
                // canvas.classList.remove('hidden');
                const imageData = canvas.toDataURL('image/png');
                console.log(imageData);
            }
        }
    };

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            })
            .catch((err) => {
                router.visit(dashboard().url);
                console.error('Gagal mengakses kamera:', err);
            });

        return () => {
            const tracks = (
                videoRef.current?.srcObject as MediaStream
            )?.getTracks();
            tracks?.forEach((track) => track.stop());
        };
    }, []);

    return (
        <AppMobileDetailLayout className="relative min-h-svh space-y-4">
            <Head title="Document" />
            <HeaderSection title="Document" path={dashboard().url}>
                <span>&nbsp;</span>
            </HeaderSection>

            <div className="relative">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 z-20 h-[80vh] w-full object-cover"
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
                    <Button
                        onClick={handleCapture}
                        variant={'outline'}
                        size={'lg'}
                    >
                        <ScanTextIcon /> Upload Image
                    </Button>
                </div>
            </div>
        </AppMobileDetailLayout>
    );
}

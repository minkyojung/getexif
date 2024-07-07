"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient, Session } from "@supabase/supabase-js";
import EXIF from "exif-js";
import ImgCard from '../components/ui/imgCard';
import { Button } from '../components/ui/button';
import InstagramPost from '../components/instagramUI';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Landing() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null>(null);
  const [exifData, setExifData] = useState<any>(null);
  const [styles, setStyles] = useState<{ titleStyle: string; textStyle: string } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    checkSession();
  }, [router, pathname]);

  const handleLogin = async () => {
    const redirectTo = new URL(process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL!);
    redirectTo.hash = ''; // 해시 제거
  
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.push('/');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result !== undefined) {
          setImageSrc(result);
          const img = new Image();
          img.onload = function() {
            EXIF.getData(img as any, function(this: any) {
              const allMetaData = EXIF.getAllTags(this);
              console.log(allMetaData);
              setExifData(allMetaData);
              console.log("EXIF data set");
            });
          };
          img.src = result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImageWithExif = () => {
    if (imageSrc && imgRef.current && styles) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = imgRef.current;
  
      // Calculate the scale factor to fit the image within the canvas
      const maxWidth = 800; // Maximum width for the image
      const maxHeight = 800; // Maximum height for the image
      let scale = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
  
      const imgWidth = img.naturalWidth * scale;
      const imgHeight = img.naturalHeight * scale;
      const padding = 100;
      const textHeight = 300;
      const textMargin = 100;
      const lineSpacing = 64;
  
      canvas.width = imgWidth + padding * 2;
      canvas.height = imgHeight + textHeight + padding * 2 + textMargin;
  
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
  
        ctx.drawImage(img, padding, padding, imgWidth, imgHeight);
  
        const make = exifData?.Make || "Unknown Make";
        const model = exifData?.Model || "Unknown Model";
        const focalLength = exifData?.FocalLength || "Unknown Focal Length";
        const fNumber = exifData?.FNumber || "Unknown F-Number";
        const exposureTime = exifData?.ExposureTime ? `1/${1 / Number(exifData.ExposureTime)}s` : "Unknown Exposure Time";
        const iso = exifData?.ISOSpeedRatings || "Unknown ISO";
  
        ctx.fillStyle = "black";
        ctx.font = "bold 128px Arial";
        ctx.textAlign = "center";
        const firstTextYPosition = imgHeight + padding + textMargin + lineSpacing + 35;
        ctx.fillText(`${make} ${model}`, canvas.width / 2, firstTextYPosition);
  
        const additionalLineSpacing = 100;
  
        ctx.fillStyle = "#4a4a4a";
        ctx.font = "70px Arial";
        ctx.fillText(`${focalLength} f/${fNumber} ${exposureTime} ISO ${iso}`, canvas.width / 2, imgHeight + padding + textMargin + lineSpacing * 2 + additionalLineSpacing);
  
        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataUrl);
        downloadAnchorNode.setAttribute("download", "image_with_exif.jpg");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
      {session ? (
        <div className="flex w-full h-screen">
          <div className="w-1/2 p-4 overflow-auto" style={{ maxHeight: "100%" }}>
            <h2 className="text-xl mb-4">Edit</h2>
            <input type="file" onChange={handleFileChange} className="mb-4" />
            <div className="fixed-image-container mb-4">
              {exifData && (
                <ImgCard
                  manufacturer={String(exifData.Make)}
                  model={String(exifData.Model)}
                  focalLength={String(exifData.FocalLength)}
                  aperture={`f/${String(exifData.FNumber)}`}
                  shutterSpeed={`1/${1 / Number(exifData.ExposureTime)}s`}
                  iso={String(exifData.ISOSpeedRatings)}
                  imageSrc={imageSrc as string}
                  imgRef={imgRef}
                  getStyles={setStyles}
                />
              )}
            </div>
            {imageSrc && <button onClick={downloadImageWithExif}>Download Image</button>}
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="w-1/2 p-4">
            <h2 className="text-xl mb-4">Preview on Instagram</h2>
            {imageSrc && (
              <InstagramPost
                username="username"
                imageUrl={imageSrc as string}
                caption="This is a caption"
                likes={123}
                comments={45}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
            Capture carefully, Ship fast
          </h1>
          <p className="text-xl mb-8">Simplyfy your workflow</p>
          <Button onClick={handleLogin} variant="default" size="lg">Get started now</Button>
        </div>
      )}
    </main>
  );
}

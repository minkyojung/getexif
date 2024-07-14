"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient, Session } from "@supabase/supabase-js";
import EXIF from "exif-js";
import ImgCard from '../components/ui/imgCard';
import { Button } from '../components/ui/button';

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
  const [showExif, setShowExif] = useState<boolean>(true);
  const [selectedExif, setSelectedExif] = useState<{ camera: boolean; settings: boolean }>({
    camera: true,
    settings: true,
  });
  const [padding, setPadding] = useState<number>(20);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const checkSession = async () => {
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
        // Mocking authentication
        setSession({
          access_token: 'mock-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: {
            id: 'mock-user-id',
            aud: 'authenticated',
            role: 'authenticated',
            email: 'test@example.com',
            phone: '',
            confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: { full_name: 'Test User' },
            identities: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      }
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
    console.log("downloadImageWithExif 함수 호출됨");
    console.log("imageSrc:", imageSrc);
    console.log("imgRef.current:", imgRef.current);
    console.log("styles:", styles);

    if (imageSrc && imgRef.current && styles) {
      console.log("조건 만족: imageSrc, imgRef.current, styles 존재");
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = imgRef.current;

      const scale = 0.5;
      const imgWidth = img.naturalWidth * scale;
      const imgHeight = img.naturalHeight * scale;
      const textHeight = 300;
      const textMargin = 100;
      const lineSpacing = 64;

      canvas.width = imgWidth + padding * 2;
      canvas.height = imgHeight + textHeight + padding * 2 + textMargin;

      if (ctx) {
        console.log("캔버스 컨텍스트 존재");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, padding, padding, imgWidth, imgHeight);
        console.log("이미지 그리기 완료");

        if (showExif) {
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
          if (selectedExif.camera) {
            ctx.fillText(`${make} ${model}`, canvas.width / 2, firstTextYPosition);
            console.log("카메라 정보 텍스트 그리기 완료");
          }

          const additionalLineSpacing = 100;

          ctx.fillStyle = "#4a4a4a";
          ctx.font = "70px Arial";
          if (selectedExif.settings) {
            ctx.fillText(`${focalLength} f/${fNumber} ${exposureTime} ISO ${iso}`, canvas.width / 2, imgHeight + padding + textMargin + lineSpacing * 2 + additionalLineSpacing);
            console.log("설정 정보 텍스트 그리기 완료");
          }
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
        console.log("dataUrl 생성 완료:", dataUrl);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataUrl);
        downloadAnchorNode.setAttribute("download", "image_with_exif.jpg");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        console.log("이미지 다운로드 완료");
      } else {
        console.error("캔버스 컨텍스트를 가져올 수 없습니다.");
      }
    } else {
      console.error("조건 불충족: imageSrc, imgRef.current, styles 중 하나 이상이 존재하지 않습니다.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white overflow-auto">
      {session ? (
        <div className="flex w-full h-screen">
          <div className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-lg mr-2.5 max-h-screen">
            <h2 className="text-xl mb-4">Edit</h2>
            <input type="file" onChange={handleFileChange} className="mb-4" />
            <div className="mb-4">
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
                  setShowExif={setShowExif}
                  setSelectedExif={setSelectedExif}
                  setPadding={setPadding}
                  showExif={showExif}
                  selectedExif={selectedExif}
                  padding={padding}
                />
              )}
            </div>
            {imageSrc && <button onClick={downloadImageWithExif}>Download Image</button>}
            <button onClick={handleLogout}>Logout</button>
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
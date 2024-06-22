"use client";

import { useState, useRef } from "react";
import EXIF from "exif-js";
import ImgCard from './component/imgCard';

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null>(null);
  const [exifData, setExifData] = useState<any>(null);
  const [styles, setStyles] = useState<{ titleStyle: string; textStyle: string } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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
              console.log(allMetaData); // EXIF 데이터 확인
              setExifData(allMetaData);
              console.log("EXIF data set"); // EXIF 데이터 설정 확인
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

      const scale = 0.5; // 이미지 크기를 50%로 조정
      const imgWidth = img.naturalWidth * scale;
      const imgHeight = img.naturalHeight * scale;
      const padding = 100; // Padding around the image
      const textHeight = 300; // Space for text below the image
      const textMargin = 100; // Margin between image and text
      const lineSpacing = 64; // Line spacing between text lines

      canvas.width = imgWidth + padding * 2;
      canvas.height = imgHeight + textHeight + padding * 2 + textMargin;

      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, padding, padding, imgWidth, imgHeight);

        // Safeguard against missing EXIF data
        const make = exifData?.Make || "Unknown Make";
        const model = exifData?.Model || "Unknown Model";
        const focalLength = exifData?.FocalLength || "Unknown Focal Length";
        const fNumber = exifData?.FNumber || "Unknown F-Number";
        const exposureTime = exifData?.ExposureTime ? `1/${1 / Number(exifData.ExposureTime)}s` : "Unknown Exposure Time";
        const iso = exifData?.ISOSpeedRatings || "Unknown ISO";

        // Apply styles for camera manufacturer/model
        ctx.fillStyle = "black";
        ctx.font = "bold 128px Arial"; // Adjusted font size for camera details
        ctx.textAlign = "center";
        const firstTextYPosition = imgHeight + padding + textMargin + lineSpacing + 35; // Added 50px margin above the text
        ctx.fillText(`${make} ${model}`, canvas.width / 2, firstTextYPosition);

        const additionalLineSpacing = 100; // Additional spacing between the two text blocks

        // Apply styles for EXIF data
        ctx.fillStyle = "#4a4a4a"; // Changed to a darker gray
        ctx.font = "70px Arial"; // Adjusted font size for additional EXIF data
        ctx.fillText(`${focalLength} f/${fNumber} ${exposureTime} ISO ${iso}`, canvas.width / 2, imgHeight + padding + textMargin + lineSpacing * 2 + additionalLineSpacing);

        const dataUrl = canvas.toDataURL('image/jpeg', 1.0); // Set quality to 1.0 for high quality
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataUrl);
        downloadAnchorNode.setAttribute("download", "image_with_exif.jpg");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }
    }
  };

  if (exifData) {
    console.log("Rendering EXIF data:", exifData); // EXIF 데이터 렌더링 확인
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <input type="file" onChange={handleFileChange} />
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
      {imageSrc && <button onClick={downloadImageWithExif}>Download Image</button>}
    </main>
  );
}

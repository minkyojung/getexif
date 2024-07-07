import React, { useEffect } from 'react';

interface ImgCardProps {
  manufacturer: string;
  model: string;
  focalLength: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  imageSrc: string;
  imgRef: React.RefObject<HTMLImageElement>;
  getStyles?: (styles: { titleStyle: string; textStyle: string }) => void;
}

const ImgCard: React.FC<ImgCardProps> = ({ manufacturer, model, focalLength, aperture, shutterSpeed, iso, imageSrc, imgRef, getStyles }) => {
  const titleStyle = "text-2xl font-bold text-black";
  const textStyle = "text-gray-600 mt-2 text-sm";

  useEffect(() => {
    if (getStyles) {
      getStyles({ titleStyle, textStyle });
    }
  }, [getStyles]);

  return (
    <div className="max-w-2xl mx-auto p-4 max-h-screen overflow-auto">
      <div className="bg-white border border-gray-200 p-4">
        <img ref={imgRef} src={imageSrc} alt="Uploaded" className="w-full h-auto" />
        <div className="text-center mt-4">
          <h1 className={titleStyle}>{manufacturer} {model}</h1>
          <div className={textStyle}>
            <p>{focalLength}mm {aperture} {shutterSpeed} ISO {iso}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImgCard;
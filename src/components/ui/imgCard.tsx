import React, { useState, useEffect, useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface ImgCardProps {
  manufacturer: string;
  model: string;
  focalLength: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  imageSrc: string;
  imgRef: React.RefObject<HTMLImageElement>;
  getStyles: React.Dispatch<React.SetStateAction<{ titleStyle: string; textStyle: string } | null>>;
  setShowExif: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedExif: React.Dispatch<React.SetStateAction<SelectedExif>>;
  setPadding: React.Dispatch<React.SetStateAction<number>>;
  showExif: boolean;
  selectedExif: SelectedExif;
  padding: number;
}

interface ExifField {
  key: 'camera' | 'settings';
  label: string;
  value: string;
}

interface SelectedExif {
  camera: boolean;
  settings: boolean;
}

const ImgCard: React.FC<ImgCardProps> = ({
  manufacturer,
  model,
  focalLength,
  aperture,
  shutterSpeed,
  iso,
  imageSrc,
  imgRef,
  getStyles,
  setShowExif,
  setSelectedExif,
  setPadding,
  showExif,
  selectedExif,
  padding,
}) => {
  useEffect(() => {
    // 스타일 설정
    getStyles({
      titleStyle: 'bold 128px Arial',
      textStyle: '70px Arial',
    });
  }, [getStyles]);

  const exifFields: ExifField[] = [
    { key: 'camera', label: 'Camera', value: `${manufacturer} ${model}` },
    { key: 'settings', label: 'Settings', value: `${focalLength} f/${aperture} ${shutterSpeed} ISO ${iso}` },
  ];

  const handleExifToggle = (field: 'camera' | 'settings'): void => {
    setSelectedExif((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 max-w-4xl mx-auto">
      <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative" style={{ padding: `${padding}px` }}>
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Uploaded"
            className="w-full h-auto object-contain"
          />
        </div>
        {showExif && (
          <div className="bg-white text-black p-4 text-center">
            {exifFields.map(
              (field) =>
                selectedExif[field.key] && (
                  <p
                    key={field.key}
                    className={`${
                      field.key === 'camera' ? 'text-2xl font-bold mb-1' : 'text-sm font-medium'
                    } ${field.key === 'camera' ? 'text-black' : 'text-gray-500'}`}
                  >
                    {field.value}
                  </p>
                )
            )}
          </div>
        )}
      </div>
      <div className="w-full md:w-64 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Your Preset</h3>
          <Switch
            checked={showExif}
            onCheckedChange={() => setShowExif(!showExif)}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">EXIF Data to Show</h3>
          {exifFields.map((field) => (
            <Switch
              key={field.key}
              checked={selectedExif[field.key]}
              onCheckedChange={() => handleExifToggle(field.key)}
            />
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Padding</h3>
          <Slider
            min={0}
            max={100}
            value={[padding]}
            onValueChange={(value: number[]) => setPadding(value[0])}
          />
        </div>
      </div>
    </div>
  );
};

export default ImgCard;
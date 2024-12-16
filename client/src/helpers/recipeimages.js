import React from 'react';

const RecipeImages = ({ images }) => {
  const parseImages = (imagesData) => {
    if (Array.isArray(imagesData)) return imagesData;

    if (typeof imagesData === 'string') {
      try {
        const sanitizedData = imagesData
          .replace(/'/g, '"')
          .replace(/\s/g, '');

        if (sanitizedData.startsWith('[') && sanitizedData.endsWith(']')) {
          return JSON.parse(sanitizedData);
        }
      } catch (e) {
        console.error('Failed to parse images JSON:', e);
      }

      return imagesData
        .slice(1, -1)
        .split(',')
        .map(item => item.trim().replace(/['"`]/g, ''));
    }

    return [];
  };

  const parsedImages = parseImages(images);

  if (!parsedImages.length) {
    return <p className="text-gray-500">No images available</p>;
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div style={{display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
        {parsedImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Style ${index + 1}`}
            // className="max-w-[300px] max-h-[300px] object-cover rounded-lg shadow-md"
            style={{maxWidth: 300, maxHeight: 300, objectFit: "cover", marginRight: 20, marginTop:20 }}
          />
        ))}
      </div>
    </div>
  );
};

export default RecipeImages;

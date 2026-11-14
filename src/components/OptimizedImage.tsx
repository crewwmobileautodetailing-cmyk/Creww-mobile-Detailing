import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

/**
 * Serves modern WebP format via <picture> when a .webp counterpart exists
 * under /assets/, while preserving the original .jpg/.png fallback path.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  ...imgProps
}) => {
  const isOptimizableAsset =
    src.startsWith('/assets/') && (src.endsWith('.jpg') || src.endsWith('.png'));
  const webpSrc = isOptimizableAsset
    ? src.replace(/\.(jpg|png)$/i, '.webp')
    : null;

  if (!webpSrc) {
    return <img src={src} alt={alt} className={className} {...imgProps} />;
  }

  return (
    <picture className="contents">
      <source srcSet={webpSrc} type="image/webp" />
      <img src={src} alt={alt} className={className} {...imgProps} />
    </picture>
  );
};

/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number;
  }
  export const X: FC<IconProps>;
  export const ExternalLink: FC<IconProps>;
  export const Calendar: FC<IconProps>;
  export const Tag: FC<IconProps>;
  export const Shield: FC<IconProps>;
  export const ArrowLeftRight: FC<IconProps>;
  export const Link2: FC<IconProps>;
}

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
  export const Plus: FC<IconProps>;
  export const Trash2: FC<IconProps>;
  export const Copy: FC<IconProps>;
  export const Settings2: FC<IconProps>;
  export const Check: FC<IconProps>;
  export const Eye: FC<IconProps>;
  export const EyeOff: FC<IconProps>;
  export const Palette: FC<IconProps>;
  export const Filter: FC<IconProps>;
  export const ChevronDown: FC<IconProps>;
  export const ChevronUp: FC<IconProps>;
  export const GitCompare: FC<IconProps>;
  export const Minus: FC<IconProps>;
  export const Search: FC<IconProps>;
  export const BarChart3: FC<IconProps>;
  export const Maximize2: FC<IconProps>;
  export const Minimize2: FC<IconProps>;
  export const Columns: FC<IconProps>;
  export const Rows: FC<IconProps>;
  export const Link: FC<IconProps>;
  export const Unlink: FC<IconProps>;
  export const MoreHorizontal: FC<IconProps>;
  export const GripVertical: FC<IconProps>;
  export const Layers: FC<IconProps>;
  export const Layout: FC<IconProps>;
  export const Sliders: FC<IconProps>;
  export const Download: FC<IconProps>;
  export const Upload: FC<IconProps>;
  export const RefreshCw: FC<IconProps>;
  export const Info: FC<IconProps>;
  export const AlertCircle: FC<IconProps>;
  export const CheckCircle: FC<IconProps>;
}

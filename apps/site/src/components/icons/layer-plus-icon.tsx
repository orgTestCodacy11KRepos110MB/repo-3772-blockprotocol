import { SvgIcon, SvgIconProps } from "@mui/material";
import { FunctionComponent } from "react";

export const LayerPlusIcon: FunctionComponent<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} width="512" height="512" viewBox="0 0 512 512">
      <path
        stroke="currentColor"
        d="M448 64H488C496.8 64 504 71.16 504 80C504 88.84 496.8 96 488 96H448V136C448 144.8 440.8 152 432 152C423.2 152 416 144.8 416 136V96H376C367.2 96 360 88.84 360 80C360 71.16 367.2 64 376 64H416V24C416 15.16 423.2 8 432 8C440.8 8 448 15.16 448 24V64zM277.8 132.7L495.2 230.1C505.4 234.7 512 244.8 512 256C512 267.2 505.4 277.3 495.2 281.9L277.8 379.3C270.1 382.4 263.5 384 256 384C248.5 384 241 382.4 234.2 379.3L16.76 281.9C6.561 277.3 .0003 267.2 .0003 256C.0003 244.8 6.561 234.7 16.76 230.1L234.2 132.7C241 129.6 248.5 128 256 128C263.5 128 270.1 129.6 277.8 132.7V132.7zM37.27 256L247.2 350.1C249.1 351.4 252.1 352 256 352C259 352 262 351.4 264.8 350.1L474.7 256L264.8 161.9C262 160.6 259 160 256 160C252.1 160 249.1 160.6 247.2 161.9L37.27 256zM37.27 384L247.2 478.1C249.1 479.4 252.1 480 256 480C259 480 262 479.4 264.8 478.1L474.7 384L441.5 369.1C433.4 365.5 429.8 356 433.4 347.9C437 339.9 446.5 336.3 454.5 339.9L495.2 358.1C505.4 362.7 512 372.8 512 384C512 395.2 505.4 405.3 495.2 409.9L277.8 507.3C270.1 510.4 263.5 512 256 512C248.5 512 241 510.4 234.2 507.3L16.76 409.9C6.561 405.3 0 395.2 0 384C0 372.8 6.561 362.7 16.76 358.1L57.46 339.9C65.52 336.3 74.99 339.9 78.6 347.9C82.21 356 78.61 365.5 70.54 369.1L37.27 384z"
      />
    </SvgIcon>
  );
};

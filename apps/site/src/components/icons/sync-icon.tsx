import { SvgIcon, SvgIconProps } from "@mui/material";
import { FunctionComponent } from "react";

export const SyncIcon: FunctionComponent<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} width="44" height="44" viewBox="0 0 44 44" fill="none">
      <path
        d="M31.6661 11.3922C28.9639 8.86204 25.4572 7.47509 21.737 7.47837C15.0418 7.48425 9.26184 12.0749 7.66597 18.4428C7.5498 18.9064 7.1368 19.2337 6.6589 19.2337H1.70585C1.05775 19.2337 0.565408 18.6453 0.685295 18.0084C2.55551 8.07685 11.2752 0.563477 21.7501 0.563477C27.4936 0.563477 32.7095 2.82257 36.5579 6.50034L39.645 3.41328C40.9518 2.10645 43.1863 3.03201 43.1863 4.88019V16.4677C43.1863 17.6134 42.2576 18.5422 41.1118 18.5422H29.5243C27.6761 18.5422 26.7506 16.3077 28.0574 15.0008L31.6661 11.3922V11.3922ZM2.38843 25.4571H13.976C15.8242 25.4571 16.7497 27.6916 15.4429 28.9985L11.8342 32.6072C14.5363 35.1374 18.0433 36.5244 21.7636 36.521C28.4553 36.515 34.2377 31.9274 35.8343 25.5567C35.9505 25.0931 36.3635 24.7658 36.8414 24.7658H41.7945C42.4426 24.7658 42.9349 25.3541 42.8151 25.9911C40.9448 35.9224 32.2251 43.4358 21.7501 43.4358C16.0066 43.4358 10.7908 41.1767 6.94232 37.4989L3.85526 40.586C2.54843 41.8928 0.313965 40.9673 0.313965 39.1191V27.5316C0.313965 26.3858 1.24272 25.4571 2.38843 25.4571Z"
        fill="currentColor"
      />
    </SvgIcon>
  );
};
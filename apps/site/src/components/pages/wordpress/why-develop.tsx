import { Box, Grid, Typography } from "@mui/material";
import { ReactNode } from "react";
import { AtomSimpleIcon, CityIcon, WandMagicSparklesIcon } from "../../icons";
import { IconSection } from "./icon-section";

export const WhyDevelop = () => {
  return (
    <Box
      sx={{
        fontFamily: "Inter",
        position: "relative",
        zIndex: 1,
        pb: 15,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: "60%",
          maxWidth: 660,
          height: 75,
          top: "-11rem",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#0500FF",
          opacity: 0.5,
          filter: "blur(100px)",
        }}
      />

      <Box
        sx={{
          maxWidth: "1100px",
          background:
            "linear-gradient(181.4deg, rgba(255, 255, 255, 0.65) 50%, #FDFCFE 94.38%)",
          border: "2px solid white",
          borderRadius: "8px",
          boxShadow:
            "0px 2.8px 2.2px rgba(166, 142, 187, 0.15), 0px 6.7px 5.3px rgba(166, 142, 187, 0.08), 0px 12.5px 10px rgba(166, 142, 187, 0.05), 0px 22.3px 17.9px rgba(166, 142, 187, 0.09), 0px 41.8px 33.4px rgba(166, 142, 187, 0.1), 0px 100px 80px rgba(166, 142, 187, 0.1)",
          pt: { xs: 3, md: 8.25 },
          px: { xs: 2, md: 10 },
          pb: 10,
          margin: { xs: "-11rem 1rem 0", lg: "-11rem auto 0" },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={({ breakpoints }) => ({
            pb: 4.5,
            [breakpoints.down("lg")]: {
              textAlign: "center",
            },
          })}
        >
          <Typography
            variant="bpLargeText"
            sx={{ fontSize: "2rem", lineHeight: 1, fontWeight: 900, mb: 1 }}
          >
            Why develop Block Protocol blocks?
          </Typography>
          <Typography
            sx={{
              fontSize: "2rem",
              lineHeight: 1,
              color: ({ palette }) => palette.gray[50],
            }}
          >
            Developing <strong>Þ</strong> blocks has a number of benefits...
          </Typography>
        </Box>

        <Grid
          container
          sx={({ breakpoints }) => ({
            width: "100% !important",
            pt: 7.25,
            [breakpoints.down("lg")]: {
              pt: 3,
              maxWidth: 500,
              margin: "auto",
            },
          })}
          spacing={{ xs: 3, lg: 5.5 }}
        >
          <IconSection
            xs={12}
            lg={4}
            color="#5F46EF"
            icon={<CityIcon sx={{ fontSize: 32, mb: 1.5 }} />}
            title="Build blocks once and use them anywhere"
            description="Use your block within any Þ app with no extra work on your part"
          />

          <IconSection
            xs={12}
            lg={4}
            color="#6F59EC"
            icon={<AtomSimpleIcon sx={{ fontSize: 32, mb: 1.5 }} />}
            title="Types, tools and APIs to build great blocks"
            description="Build more complex, capable blocks with a rich suite of utilities"
          />

          <IconSection
            xs={12}
            lg={4}
            color="#CC84FF"
            icon={<WandMagicSparklesIcon sx={{ fontSize: 32, mb: 1.5 }} />}
            title="An easy developer experience"
            description="Bring your preferred tech and leave the PHP at home"
          />
        </Grid>
      </Box>
    </Box>
  );
};

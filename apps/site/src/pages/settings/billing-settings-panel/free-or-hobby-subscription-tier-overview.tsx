import { faCaretRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { Box, Grid, styled, Typography } from "@mui/material";
import { FunctionComponent } from "react";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FontAwesomeIcon,
} from "../../../components/icons";
import { AbstractAiIcon } from "../../../components/icons/abstract-ai-icon";
import { BoltRegularIcon } from "../../../components/icons/bolt-regular-icon";
import { CheckDoubleIcon } from "../../../components/icons/check-double-icon";
import { CoinsIcon } from "../../../components/icons/coins-icon";
import { FlaskVialIcon } from "../../../components/icons/flask-vial-icon";
import { HandIcon } from "../../../components/icons/hand-icon";
import { JetFighterUpIcon } from "../../../components/icons/jet-fighter-up-icon";
import { LocationArrowIcon } from "../../../components/icons/location-arrow-icon";
import { LocationIcon } from "../../../components/icons/location-icon";
import { LockIcon } from "../../../components/icons/lock-icon";
import { MapLocationDotIcon } from "../../../components/icons/map-location-dot-icon";
import { MapboxLogoIcon } from "../../../components/icons/mapbox-logo-icon";
import { MicrophoneLogoIcon } from "../../../components/icons/microphone-icon";
import { PeopleArrowsIcon } from "../../../components/icons/people-arrows-icon";
import { RocketRegularIcon } from "../../../components/icons/rocket-regular-icon";
import { TagIcon } from "../../../components/icons/tag-icon";
import { TrophyIcon } from "../../../components/icons/trophy-icon";
import { TrophyStarIcon } from "../../../components/icons/trophy-star-icon";
import { Link } from "../../../components/link";
import { LinkButton } from "../../../components/link-button";
import { PaidSubscriptionTier } from "../../shared/subscription-utils";
import {
  SubscriptionFeature,
  SubscriptionFeatureListItem,
} from "./subscription-feature-list-item";

type PaidSubscription = {
  coreFeatures: SubscriptionFeature[];
  additionalFeatures: SubscriptionFeature[];
};

const paidSubscriptions: Record<PaidSubscriptionTier, PaidSubscription> = {
  hobby: {
    coreFeatures: [
      {
        icon: <AbstractAiIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            <strong>150k</strong> AI-generated words (powered by GPT-3)
          </>
        ),
      },
      {
        icon: <AbstractAiIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            <strong>50</strong> AI-generated images (powered by DALL-E)
          </>
        ),
      },
      {
        icon: <MapboxLogoIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            <strong>20</strong> Mapbox Address Autofills
          </>
        ),
      },
    ],
    additionalFeatures: [
      {
        icon: <TrophyIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            Unique <strong>“Early Supporter”</strong> badge
          </>
        ),
      },
      {
        icon: <PeopleArrowsIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            Access to <strong>additional APIs</strong>
          </>
        ),
        planned: true,
      },
      {
        icon: <CoinsIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            <strong>Usage-based billing</strong> for additional credits/tokens
          </>
        ),
      },
      {
        icon: <HandIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            Ability to <strong>prevent or cap</strong> overage charges{" "}
            <Box
              component="span"
              sx={{ color: ({ palette }) => palette.purple[50] }}
            >
              (optional)
            </Box>
          </>
        ),
      },
    ],
  },
  pro: {
    coreFeatures: [
      {
        icon: <CheckDoubleIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            <strong>Double allowance</strong> of all hobby limits
            <br />
            <Box
              component="span"
              sx={{ color: ({ palette }) => palette.gray[60] }}
            >
              300k+ words, 100 images, 40 address fills
            </Box>
          </>
        ),
      },
      {
        icon: <LocationIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            <strong>500</strong> Mapbox Isochrone API calls
          </>
        ),
      },
      {
        icon: <LocationArrowIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            <strong>500</strong> Mapbox Directions API calls
          </>
        ),
      },
      {
        icon: <MapLocationDotIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            <strong>500</strong> Mapbox Temporary Geocoding API calls
          </>
        ),
      },
      {
        icon: <MicrophoneLogoIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            <strong>60 mins</strong> OpenAI Whisper audio transcription Mapbox
          </>
        ),
        planned: true,
      },
      {
        icon: <FlaskVialIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            <strong>Early-access</strong> to new APIs
          </>
        ),
      },
    ],
    additionalFeatures: [
      {
        icon: <TrophyStarIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            Additional <strong>“Founder Member”</strong> badge
          </>
        ),
      },
      {
        icon: <TagIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            <strong>Discounted access</strong> to additional API calls beyond
            those already included
          </>
        ),
      },
      {
        icon: <LockIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            <strong>Private blocks</strong> and types
          </>
        ),
        planned: true,
      },
      {
        icon: <JetFighterUpIcon sx={{ fontSize: 18 }} />,
        title: (
          <>
            <strong>Bonus</strong> features, updates and special event invites
          </>
        ),
        planned: true,
      },
    ],
  },
};

const CustomLinkButton = styled(LinkButton)(({ theme }) => ({
  "& .MuiTypography-root": {
    color: theme.palette.common.white,
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.gray[10],
    color: theme.palette.gray[50],
    borderColor: theme.palette.gray[30],
    borderStyle: "solid",
    borderWidth: 1,
    "& .MuiTypography-root": {
      color: theme.palette.gray[50],
    },
  },
}));

export const FreeOrHobbySubscriptionTierOverview: FunctionComponent<{
  currentSubscriptionTier: "free" | "hobby";
}> = ({ currentSubscriptionTier }) => {
  return (
    <Grid container>
      <Grid
        item
        md={6}
        sm={12}
        sx={{ display: "flex", flexDirection: "column" }}
      >
        {currentSubscriptionTier === "hobby" ? (
          <Box display="flex" alignItems="center">
            <Box
              sx={({ spacing }) => ({
                fontSize: `calc(${spacing(4)} - 5px)`,
                marginRight: "5px",
                height: 2,
                background:
                  "linear-gradient(270deg, #C6B7FA 0%, rgba(198, 183, 250, 0) 97.67%)",
              })}
            />
            <Typography
              sx={{
                textTransform: "uppercase",
                display: { sx: "none", md: "block" },
                color: ({ palette }) => palette.purple["40"],
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              Current Plan
            </Typography>
          </Box>
        ) : null}
        <Box
          sx={{
            padding: 4,
            backgroundColor: "#FBF7FF",
            borderBottomStyle: "solid",
            borderBottomfontSize: 1,
            borderBottomColor: ({ palette }) => palette.purple[20],
            borderTopLeftRadius: 14,
            borderTopRightRadius: {
              xs: 14,
              md: 0,
            },
          }}
        >
          <Box display="flex" alignItems="center">
            <Typography sx={{ fontSize: 28 }}>
              <strong>$2</strong>/month
            </Typography>
            <Typography sx={{ marginLeft: 3, fontSize: 14, fontWeight: 600 }}>
              HOBBY
            </Typography>
          </Box>
          <Typography
            component="p"
            variant="bpSmallCopy"
            gutterBottom
            sx={{
              color: ({ palette }) => palette.purple[50],
              fontWeight: 400,
            }}
          >
            For casual users of blocks
          </Typography>
          <CustomLinkButton
            href={{ pathname: "/upgrade", query: { tier: "hobby" } }}
            variant="primary"
            endIcon={
              currentSubscriptionTier === "free" ? (
                <ArrowRightIcon />
              ) : undefined
            }
            disabled={currentSubscriptionTier === "hobby"}
            size="small"
          >
            {currentSubscriptionTier === "hobby"
              ? "Your current plan"
              : "Continue"}
          </CustomLinkButton>
        </Box>
        <Box
          sx={({ spacing }) => ({
            padding: spacing(2, 4),
            backgroundColor: "#FBF7FF",
            flexGrow: 1,
          })}
        >
          <Typography
            gutterBottom
            component="p"
            variant="bpSmallCopy"
            sx={({ palette }) => ({ color: palette.purple[80] })}
          >
            <strong>Includes the following each month:</strong>
          </Typography>
          <Box component="ul">
            {paidSubscriptions.hobby.coreFeatures.map((feature, index) => (
              <SubscriptionFeatureListItem
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                feature={feature}
              />
            ))}
          </Box>
          <Link href="/pricing">
            <Typography
              component="p"
              variant="bpSmallCopy"
              sx={({ palette, transitions }) => ({
                color: palette.purple[80],
                textTransform: "uppercase",
                transition: transitions.create("opacity"),
                "&:hover": {
                  opacity: 0.8,
                  "& svg": {
                    marginLeft: 1,
                  },
                },
              })}
            >
              <strong>View full plan details</strong>
              <FontAwesomeIcon
                icon={faCaretRight}
                sx={{
                  position: "relative",
                  top: -1,
                  marginLeft: 0.5,
                  transition: ({ transitions }) =>
                    transitions.create("margin-left"),
                }}
              />
            </Typography>
          </Link>
        </Box>
        <Box
          sx={{
            padding: 4,
            borderStyle: "solid",
            borderfontSize: 1,
            borderColor: ({ palette }) => palette.gray[20],
            borderRightfontSize: {
              xs: 1,
              md: 0,
            },
            borderBottomLeftRadius: {
              xs: 0,
              md: 14,
            },
          }}
        >
          <Typography gutterBottom component="p" variant="bpSmallCopy">
            <strong>As well as:</strong>
          </Typography>
          <Box component="ul" marginBottom={4}>
            {paidSubscriptions.hobby.additionalFeatures.map(
              (feature, index) => (
                <SubscriptionFeatureListItem
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  feature={feature}
                />
              ),
            )}
          </Box>
          <Box display="flex" alignItems="center" flexDirection="column">
            <CustomLinkButton
              href={{ pathname: "/upgrade", query: { tier: "hobby" } }}
              size="small"
              endIcon={
                currentSubscriptionTier === "hobby" ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : (
                  <RocketRegularIcon />
                )
              }
              disabled={currentSubscriptionTier === "hobby"}
            >
              <Typography variant="bpSmallCopy">
                {currentSubscriptionTier === "hobby" ? (
                  <>Your current level of access</>
                ) : (
                  <>
                    Get started with <strong>HOBBY</strong>
                  </>
                )}
              </Typography>
            </CustomLinkButton>
          </Box>
        </Box>
      </Grid>
      <Grid item md={6} sm={12}>
        {currentSubscriptionTier === "hobby" ? (
          <Box display="flex" alignItems="center">
            <Box
              sx={({ spacing }) => ({
                fontSize: `calc(${spacing(4)} - 5px)`,
                marginRight: "5px",
                height: 2,
                background:
                  "linear-gradient(270deg, #8D68F8 0%, rgba(141, 104, 248, 0) 97.67%)",
              })}
            />
            <Typography
              sx={{
                textTransform: "uppercase",
                display: { sx: "none", md: "block" },
                color: ({ palette }) => palette.purple["60"],
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              Recommended
            </Typography>
          </Box>
        ) : null}
        <Box
          sx={({ palette }) => ({
            padding: 4,
            backgroundColor: palette.purple[20],
            borderBottomStyle: "solid",
            borderBottomfontSize: 1,
            borderBottomColor: palette.purple[30],
            borderTopRightRadius: {
              xs: 0,
              md: 14,
            },
          })}
        >
          <Box display="flex" alignItems="center">
            <Typography sx={{ fontSize: 28 }}>
              <strong>$8</strong>/month
            </Typography>
            <Typography sx={{ marginLeft: 3, fontSize: 14, fontWeight: 600 }}>
              PRO
            </Typography>
          </Box>
          <Typography
            component="p"
            variant="bpSmallCopy"
            gutterBottom
            sx={{
              color: ({ palette }) => palette.purple[60],
              fontWeight: 400,
            }}
          >
            Best for embedders, devs and power-users
          </Typography>
          <LinkButton
            href={{ pathname: "/upgrade", query: { tier: "pro" } }}
            size="small"
            endIcon={
              <ArrowRightIcon
                sx={{ position: "relative", transform: "rotate(-45deg)" }}
              />
            }
          >
            Upgrade
          </LinkButton>
        </Box>
        <Box
          sx={({ palette, spacing }) => ({
            padding: spacing(2, 4),
            backgroundColor: palette.purple[20],
          })}
        >
          <Typography component="p" variant="bpSmallCopy">
            <ArrowLeftIcon sx={{ fontSize: 18, marginRight: 1 }} />
            <strong>
              Includes everything in{" "}
              <Box
                component="i"
                sx={{ color: ({ palette }) => palette.purple[90] }}
              >
                Hobby
              </Box>
              , plus...
            </strong>
          </Typography>
          <Box component="ul">
            {paidSubscriptions.pro.coreFeatures.map((feature, index) => (
              <SubscriptionFeatureListItem
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                feature={feature}
              />
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            padding: 4,
            backgroundColor: "#FBF7FF",
            borderStyle: "solid",
            borderfontSize: 1,
            borderColor: ({ palette }) => palette.gray[20],
            borderBottomRightRadius: 14,
            borderBottomLeftRadius: {
              xs: 14,
              md: 0,
            },
          }}
        >
          <Typography gutterBottom component="p" variant="bpSmallCopy">
            <strong>Plus you receive:</strong>
          </Typography>
          <Box component="ul" marginBottom={4}>
            {paidSubscriptions.pro.additionalFeatures.map((feature, index) => (
              <SubscriptionFeatureListItem
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                feature={feature}
              />
            ))}
          </Box>
          <LinkButton
            href={{ pathname: "/upgrade", query: { tier: "pro" } }}
            size="small"
            endIcon={<BoltRegularIcon />}
          >
            <Typography
              variant="bpSmallCopy"
              sx={{ color: ({ palette }) => palette.common.white }}
            >
              {currentSubscriptionTier === "hobby" ? (
                <>
                  Upgrade to unlock <strong>PRO</strong>
                </>
              ) : (
                <>
                  Get started with <strong>PRO</strong>
                </>
              )}
            </Typography>
          </LinkButton>
        </Box>
      </Grid>
    </Grid>
  );
};

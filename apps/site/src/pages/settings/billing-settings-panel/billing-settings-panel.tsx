import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Box, Card, Grid, Typography } from "@mui/material";
import { FunctionComponent, useMemo } from "react";

import { FontAwesomeIcon } from "../../../components/icons";
import { MapboxIcon } from "../../../components/icons/mapbox-icon";
import { OpenAiIcon } from "../../../components/icons/open-ai-icon";
import { Link } from "../../../components/link";
import { useUser } from "../../../context/user-context";
import {
  isPaidSubscriptionTier,
  subscriptionTierToHumanReadable,
} from "../../shared/subscription-utils";
import { FreeOrHobbySubscriptionTierOverview } from "./free-or-hobby-subscription-tier-overview";
import { ProSubscriptionTierOverview } from "./pro-subscription-tier-overview";

export const BillingSettingsPanel: FunctionComponent = () => {
  const { user } = useUser();

  /**
   * @todo: uncomment this when subscription object is required on the billing page.
   */
  // const [subscription, setSubscription] = useState<Stripe.Subscription>();
  // const [loadingSubscription, setLoadingSubscription] = useState<boolean>(true);

  // const fetchSubscription = async () => {
  //   setLoadingSubscription(true);
  //   const { data } = await internalApi.getSubscription({});

  //   setSubscription(data.subscription);
  //   setLoadingSubscription(false);
  // };

  // useEffect(() => {
  //   void fetchSubscription();
  // }, []);

  const currentSubscriptionTier = useMemo(() => {
    if (!user || user === "loading") {
      throw new Error("User is undefined");
    }

    return user.stripeSubscriptionStatus === "active"
      ? user.stripeSubscriptionTier ?? "free"
      : "free";
  }, [user]);

  const currentSubscriptionTierIsPaid = isPaidSubscriptionTier(
    currentSubscriptionTier,
  );

  return (
    <>
      <Typography
        variant="bpHeading2"
        sx={{ fontSize: 28, fontWeight: 400, marginBottom: 3 }}
      >
        Billing
      </Typography>
      <Grid container spacing={4} sx={{ marginBottom: 6 }}>
        <Grid item md={6} sm={12}>
          <Card
            elevation={0}
            sx={{
              padding: ({ spacing }) => spacing(2, 4),
              backgroundColor: ({ palette }) => palette.gray[10],
            }}
          >
            <Typography
              variant="bpBodyCopy"
              sx={{ color: ({ palette }) => palette.gray[80] }}
            >
              <strong>
                Currently on the{" "}
                <Box
                  component="span"
                  sx={{ color: ({ palette }) => palette.common.black }}
                >
                  {subscriptionTierToHumanReadable(currentSubscriptionTier)}
                </Box>{" "}
                plan
              </strong>
            </Typography>
            <Typography
              component="p"
              variant="bpSmallCopy"
              sx={{
                fontWeight: 400,
              }}
            >
              {currentSubscriptionTier === "free"
                ? "Unlimited use of free blocks, types and APIs via the Þ Hub"
                : currentSubscriptionTier === "hobby"
                ? "Includes basic access to premium APIs from providers such as OpenAI and Mapbox"
                : "Generous included access to premium APIs from providers including OpenAI and Mapbox, plus discounted access to additional calls"}
            </Typography>
          </Card>
        </Grid>
        <Grid item md={6} sm={12} sx={{ position: "relative" }}>
          <Link
            href={
              currentSubscriptionTierIsPaid
                ? "/settings/billing/change-payment-method"
                : "/upgrade"
            }
          >
            <Card
              elevation={0}
              sx={({ spacing, palette }) => ({
                padding: spacing(2, 4),
                backgroundColor: palette.gray[10],
                height: "100%",
                "&:hover": {
                  backgroundColor: "#FBF7FF",
                  "& .MuiTypography-bpBodyCopy": {
                    color: palette.purple[80],
                  },
                  "& svg": {
                    marginLeft: 2,
                    color: palette.purple[80],
                  },
                },
              })}
            >
              <Box display="flex" alignItems="center">
                <Typography variant="bpBodyCopy">
                  <strong>
                    {currentSubscriptionTierIsPaid
                      ? "Change payment method"
                      : "Upgrade to get more"}
                  </strong>
                </Typography>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  sx={(theme) => ({
                    marginLeft: 1,
                    fontSize: 14,
                    transition: theme.transitions.create("margin-left"),
                  })}
                />
              </Box>
              <Typography
                variant="bpSmallCopy"
                component="p"
                sx={{
                  fontWeight: 400,
                }}
              >
                {/* @todo: implement "change payment" settings panel @see https://app.asana.com/0/0/1203781148500075/f */}
                {currentSubscriptionTierIsPaid
                  ? "TODO - change payment method"
                  : "Unlock access to OpenAI, Mapbox and more powerful blocks"}
              </Typography>
            </Card>
          </Link>
        </Grid>
      </Grid>
      <Typography variant="bpHeading2" sx={{ fontSize: 28, fontWeight: 400 }}>
        {currentSubscriptionTier === "pro" ? "Plan details" : "Plans"}
      </Typography>
      <Typography
        component="p"
        variant="bpSmallCopy"
        sx={{ fontWeight: 400, marginBottom: 2 }}
      >
        Plans provide access to advanced third-party functionality within
        blocks, including{" "}
        <Box component="span">
          <OpenAiIcon sx={{ width: 75, position: "relative", top: -1 }} />
        </Box>{" "}
        and{" "}
        <Box component="span">
          <MapboxIcon sx={{ width: 90 }} />
        </Box>
      </Typography>
      <Box marginBottom={6}>
        {currentSubscriptionTier === "pro" ? (
          <ProSubscriptionTierOverview />
        ) : (
          <FreeOrHobbySubscriptionTierOverview
            currentSubscriptionTier={currentSubscriptionTier}
          />
        )}
      </Box>
      <Typography
        variant="bpHeading2"
        sx={{ fontSize: 28, fontWeight: 400, marginBottom: 3 }}
      >
        Usage Limits
      </Typography>
      {/* @todo: implement "usage limits" input @see https://app.asana.com/0/0/1203781148500077/f */}
      <Typography
        variant="bpHeading2"
        sx={{ fontSize: 28, fontWeight: 400, marginBottom: 3 }}
      >
        Payment History
      </Typography>
      {/* @todo: implement "payment history" section of billing panel @see https://app.asana.com/0/1203543021352041/1203781148500078/f */}
    </>
  );
};

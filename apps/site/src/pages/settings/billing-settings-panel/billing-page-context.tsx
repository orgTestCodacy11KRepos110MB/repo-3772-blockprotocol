import { SubscriptionTierPrices } from "@local/internal-api-client";
import { createContext, useContext } from "react";
import Stripe from "stripe";

export type BillingPageContextValue = {
  paymentMethods?: Stripe.PaymentMethod[];
  refetchPaymentMethods?: () => Promise<void>;
  subscription?: Stripe.Subscription;
  refetchSubscription?: () => Promise<void>;
  subscriptionTierPrices?: SubscriptionTierPrices;
};

export const BillingPageContext = createContext<BillingPageContextValue>({});

export const useBillingPageContext = () => useContext(BillingPageContext);

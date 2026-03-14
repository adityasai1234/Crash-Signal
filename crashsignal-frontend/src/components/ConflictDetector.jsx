const GROUPS = {
  VOLATILITY: ["vix","vvix"],
  CREDIT:     ["credit_spread_hy", "credit_spread_ig","ted_spread"],
  MACRO:      ["unemployment_claims", "consumer_sentiment", "manufacturing_pmi"],
  LIQUIDITY:  ["financial_conditions", "bank_stress","real_rates"],
  MARKET:     ["sp500","dollar_index", "gold_ratio"]
};

export default function ConflictDetector({
  indicators = []
}) {
  return null;
}

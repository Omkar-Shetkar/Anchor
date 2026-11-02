import type {
  BrowsingSession,
  WeeklyReflectionStory,
  DomainSummary,
  CoachingSuggestion
} from "./types";

export function synthesizeWeeklyStory(
  weekIdentifier: string,
  sessions: BrowsingSession[]
): WeeklyReflectionStory {
  let totalDwellSeconds = 0;
  let totalBounces = 0;

  let nourishingCount = 0;
  let neutralCount = 0;
  let drainingCount = 0;
  let unratedCount = 0;

  let lateNightCount = 0;
  let lateNightDrainingCount = 0;

  const domainMap = new Map<string, {
    totalSeconds: number;
    count: number;
    nourishing: number;
    neutral: number;
    draining: number;
    lateNightDraining: number;
  }>();

  for (const session of sessions) {
    if (session.isBounce) {
      totalBounces++;
      continue;
    }

    totalDwellSeconds += session.activeDwellSeconds;

    // Sentiment tally
    switch (session.rating) {
      case "nourishing":
        nourishingCount++;
        break;
      case "neutral":
        neutralCount++;
        break;
      case "draining":
        drainingCount++;
        break;
      default:
        unratedCount++;
        break;
    }

    // Late-night tally
    if (session.isLateNight) {
      lateNightCount++;
      if (session.rating === "draining") {
        lateNightDrainingCount++;
      }
    }

    // Domain tally
    const domain = session.domain || "unknown";
    const existing = domainMap.get(domain) || {
      totalSeconds: 0,
      count: 0,
      nourishing: 0,
      neutral: 0,
      draining: 0,
      lateNightDraining: 0
    };

    existing.totalSeconds += session.activeDwellSeconds;
    existing.count++;

    if (session.rating === "nourishing") existing.nourishing++;
    if (session.rating === "neutral") existing.neutral++;
    if (session.rating === "draining") {
      existing.draining++;
      if (session.isLateNight) existing.lateNightDraining++;
    }

    domainMap.set(domain, existing);
  }

  const ratedTotal = nourishingCount + neutralCount + drainingCount + unratedCount;

  const nourishingPercent = ratedTotal > 0 ? Math.round((nourishingCount / ratedTotal) * 100) : 0;
  const neutralPercent = ratedTotal > 0 ? Math.round((neutralCount / ratedTotal) * 100) : 0;
  const drainingPercent = ratedTotal > 0 ? Math.round((drainingCount / ratedTotal) * 100) : 0;
  const unratedPercent = ratedTotal > 0 ? Math.round((unratedCount / ratedTotal) * 100) : 0;

  const lateNightDrainingPercent = lateNightCount > 0 ? Math.round((lateNightDrainingCount / lateNightCount) * 100) : 0;

  // Domain summaries sorted by total active time
  const topDomains: DomainSummary[] = Array.from(domainMap.entries())
    .map(([domain, data]) => ({
      domain,
      totalActiveSeconds: data.totalSeconds,
      sessionCount: data.count,
      nourishingPercentage: data.count > 0 ? Math.round((data.nourishing / data.count) * 100) : 0,
      neutralPercentage: data.count > 0 ? Math.round((data.neutral / data.count) * 100) : 0,
      drainingPercentage: data.count > 0 ? Math.round((data.draining / data.count) * 100) : 0
    }))
    .sort((a, b) => b.totalActiveSeconds - a.totalActiveSeconds);

  // Formulate supportive, non-punitive coaching suggestions
  const coachingSuggestions: CoachingSuggestion[] = [];

  // Heuristic 1: Late-night fatigue pattern
  if (lateNightCount >= 2 && lateNightDrainingPercent >= 50) {
    // Find the domain with most late-night draining time
    let worstDomain = topDomains[0]?.domain || "social sites";
    let maxLateDraining = 0;
    for (const [dom, stats] of domainMap.entries()) {
      if (stats.lateNightDraining > maxLateDraining) {
        maxLateDraining = stats.lateNightDraining;
        worstDomain = dom;
      }
    }

    const domainHours = (domainMap.get(worstDomain)?.totalSeconds || 0) / 3600;
    const hoursFormatted = domainHours >= 1 ? `${domainHours.toFixed(1)} hours` : `${Math.round(domainHours * 60)} minutes`;

    coachingSuggestions.push({
      id: "suggestion-late-night",
      type: "late_night_soft_cap",
      headline: "Late-Night Reflection",
      message: `You spent ${hoursFormatted} on ${worstDomain} this week. ${lateNightDrainingPercent}% of it felt draining, mostly occurring during late-night hours. Would you like to set a soft cap for after 9 PM?`,
      actionableDomain: worstDomain,
      proposedCapHour: 21
    });
  }

  // Heuristic 2: Positive reinforcement
  if (nourishingPercent >= 40) {
    coachingSuggestions.push({
      id: "suggestion-positive",
      type: "positive_reinforcement",
      headline: "Conscious Alignment",
      message: `${nourishingPercent}% of your time on mindful sites felt nourishing and productive. You're dropping anchor with real clarity.`
    });
  }

  // Fallback gentle encouragement if no specific pattern triggered
  if (coachingSuggestions.length === 0) {
    coachingSuggestions.push({
      id: "suggestion-gentle-awareness",
      type: "positive_reinforcement",
      headline: "Mindful Pacing",
      message: "Every pause creates a moment of choice. Continue listening to how your browsing feels."
    });
  }

  const now = new Date();
  const startDate = new Date(now.getTime() - 7 * 86400000).toISOString();
  const endDate = now.toISOString();

  return {
    weekIdentifier,
    startDate,
    endDate,
    totalDwellSeconds,
    totalSessions: sessions.length,
    totalBounces,
    sentimentBreakdown: {
      nourishingCount,
      nourishingPercent,
      neutralCount,
      neutralPercent,
      drainingCount,
      drainingPercent,
      unratedCount,
      unratedPercent
    },
    topDomains,
    lateNightDrainingPercent,
    coachingSuggestions
  };
}

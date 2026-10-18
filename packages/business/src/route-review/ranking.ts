interface ScoredAssessment {
	score: number;
}

interface RankableRouteCandidate {
	eligibility: { eligible: boolean };
	risk: ScoredAssessment[];
	durationS: number;
}

export function peakRiskAssessment<Assessment extends ScoredAssessment>(
	risk: Assessment[],
): Assessment | undefined {
	return risk.reduce<Assessment | undefined>(
		(peak, assessment) =>
			peak && peak.score >= assessment.score ? peak : assessment,
		undefined,
	);
}

export function compareRouteCandidates(
	first: RankableRouteCandidate,
	second: RankableRouteCandidate,
) {
	return (
		Number(second.eligibility.eligible) - Number(first.eligibility.eligible) ||
		(peakRiskAssessment(first.risk)?.score ?? 0) -
			(peakRiskAssessment(second.risk)?.score ?? 0) ||
		first.durationS - second.durationS
	);
}

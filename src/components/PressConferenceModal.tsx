import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mic,
  Newspaper,
  RefreshCw,
  Send,
  SkipForward,
  X,
} from 'lucide-react';
import {
  PressConferenceQuestion,
  PressConferenceQuestionResult,
  PressConferenceSummary,
} from '../types/game';

interface PressConferenceModalProps {
  currentMonth: number;
  presidentName: string;
  onFetchQuestions: () => Promise<PressConferenceQuestion[]>;
  onAnswerQuestion: (
    question: PressConferenceQuestion,
    answer: string
  ) => Promise<PressConferenceQuestionResult>;
  onFinishSession: (summary: PressConferenceSummary | null) => void;
}

function formatSigned(val: number, suffix = '%'): string {
  const rounded = Number(val.toFixed(1));
  return `${rounded > 0 ? '+' : ''}${rounded}${suffix}`;
}

export const PressConferenceModal: React.FC<PressConferenceModalProps> = ({
  currentMonth,
  presidentName,
  onFetchQuestions,
  onAnswerQuestion,
  onFinishSession,
}) => {
  const [questions, setQuestions] = useState<PressConferenceQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentResult, setCurrentResult] =
    useState<PressConferenceQuestionResult | null>(null);
  const [completedResults, setCompletedResults] = useState<
    PressConferenceQuestionResult[]
  >([]);
  const [showFinalSummary, setShowFinalSummary] = useState(false);

  const loadFreshQuestions = async () => {
    setErrorMsg(null);
    setIsLoadingQuestions(true);
    try {
      const qs = await onFetchQuestions();
      setQuestions(qs);
      setCurrentIdx(0);
      setCurrentResult(null);
      setAnswerText('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to convene the White House Press Corps right now.'
      );
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    void loadFreshQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeQuestion = questions[currentIdx];

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion || !answerText.trim() || isSubmittingAnswer) return;
    setErrorMsg(null);
    setIsSubmittingAnswer(true);
    try {
      const result = await onAnswerQuestion(activeQuestion, answerText.trim());
      setCurrentResult(result);
      setCompletedResults((prev) => [...prev, result]);
      setAnswerText('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to evaluate your press conference response.'
      );
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const buildSummary = (
    results: PressConferenceQuestionResult[]
  ): PressConferenceSummary | null => {
    if (results.length === 0) return null;
    const netApprovalDelta = Number(
      results.reduce((acc, r) => acc + r.approvalDelta, 0).toFixed(1)
    );
    const netCongressDelta = Number(
      results.reduce((acc, r) => acc + r.congressDelta, 0).toFixed(1)
    );
    const netDiplomaticDelta = Number(
      results.reduce((acc, r) => acc + r.diplomaticDelta, 0).toFixed(1)
    );
    return {
      month: currentMonth,
      questionsAnswered: results.length,
      netApprovalDelta,
      netCongressDelta,
      netDiplomaticDelta,
      results,
    };
  };

  const handleAdvanceOrFinish = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setCurrentResult(null);
      setAnswerText('');
      setErrorMsg(null);
    } else {
      setShowFinalSummary(true);
    }
  };

  const handleSkipQuestion = () => {
    if (isSubmittingAnswer) return;
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setCurrentResult(null);
      setAnswerText('');
      setErrorMsg(null);
    } else if (completedResults.length > 0) {
      setShowFinalSummary(true);
    } else {
      onFinishSession(null);
    }
  };

  const handleCloseModal = () => {
    onFinishSession(buildSummary(completedResults));
  };

  const cumulativeSummary = buildSummary(completedResults);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="press-conference-modal-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 bg-[#132238] px-6 py-4 text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Mic className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span>
                James S. Brady Press Briefing Room · Month{' '}
                <span className="font-mono-num">{currentMonth}</span>
              </span>
              {!isLoadingQuestions && questions.length > 0 && !showFinalSummary && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num text-stone-200">
                    Question {currentIdx + 1} / {questions.length}
                  </span>
                </>
              )}
            </div>
            <h3
              id="press-conference-modal-title"
              className="font-display text-xl font-bold text-white"
            >
              Presidential Press Conference
            </h3>
            <p className="text-xs text-stone-300">
              President {presidentName} fielding live questions from the White House Press Corps
            </p>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            aria-label="Close press conference"
            className="rounded-lg p-1.5 text-stone-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Session Tally Bar */}
        {cumulativeSummary && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-6 py-2.5 text-xs">
            <span className="font-medium text-stone-600">
              Session Impact (<span className="font-mono-num">{cumulativeSummary.questionsAnswered}</span>{' '}
              {cumulativeSummary.questionsAnswered === 1 ? 'answer' : 'answers'})
            </span>
            <div className="flex flex-wrap items-center gap-3 font-mono-num font-semibold">
              <span
                className={
                  cumulativeSummary.netApprovalDelta >= 0
                    ? 'text-emerald-700'
                    : 'text-red-700'
                }
              >
                Approval {formatSigned(cumulativeSummary.netApprovalDelta)}
              </span>
              {Math.abs(cumulativeSummary.netCongressDelta) >= 0.1 && (
                <span
                  className={
                    cumulativeSummary.netCongressDelta >= 0
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }
                >
                  Congress {formatSigned(cumulativeSummary.netCongressDelta)}
                </span>
              )}
              {Math.abs(cumulativeSummary.netDiplomaticDelta) >= 0.1 && (
                <span
                  className={
                    cumulativeSummary.netDiplomaticDelta >= 0
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }
                >
                  Diplomacy {formatSigned(cumulativeSummary.netDiplomaticDelta, '')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-900"
            >
              <p>{errorMsg}</p>
              {!isLoadingQuestions && questions.length === 0 && (
                <button
                  type="button"
                  onClick={loadFreshQuestions}
                  className="shrink-0 rounded-md border border-red-300 bg-white px-2.5 py-1 font-semibold text-red-800 hover:bg-red-100"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {isLoadingQuestions && (
            <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-5">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-stone-800">
                <Loader2
                  className="h-4 w-4 animate-spin text-[#132238]"
                  aria-hidden="true"
                />
                <span>Calling on White House Press Corps correspondents...</span>
              </div>
              <p className="text-xs text-stone-500">
                Reporters are preparing pointed questions about your recent policies, economic indicators, and breaking headlines.
              </p>
              <div className="space-y-2 pt-1">
                <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200" />
                <div className="h-14 w-full animate-pulse rounded bg-stone-200" />
              </div>
            </div>
          )}

          {!isLoadingQuestions &&
            !showFinalSummary &&
            activeQuestion && (
              <div className="space-y-4">
                {/* Active Journalist Question */}
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
                    <div>
                      <span className="font-semibold text-stone-900">
                        {activeQuestion.reporterName}
                      </span>{' '}
                      <span aria-hidden="true">·</span>{' '}
                      <span>{activeQuestion.outlet}</span>{' '}
                      <span aria-hidden="true">·</span>{' '}
                      <span className="capitalize">{activeQuestion.beat} Beat</span>
                    </div>
                    {!currentResult && completedResults.length === 0 && (
                      <button
                        type="button"
                        onClick={loadFreshQuestions}
                        className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-700 hover:bg-stone-100"
                      >
                        <RefreshCw className="h-3 w-3" aria-hidden="true" />
                        <span>New Questions</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] font-medium text-stone-500">
                    Context: {activeQuestion.contextRef}
                  </p>

                  <blockquote className="font-display text-lg font-semibold leading-snug text-stone-900">
                    “{activeQuestion.question}”
                  </blockquote>
                </div>

                {/* Answer Form (before submitting this question) */}
                {!currentResult && (
                  <form onSubmit={handleAnswerSubmit} className="space-y-3">
                    <div>
                      <label
                        htmlFor="press-conference-answer"
                        className="block text-xs font-semibold text-stone-800"
                      >
                        Your Podium Response
                      </label>
                      <textarea
                        id="press-conference-answer"
                        rows={4}
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        disabled={isSubmittingAnswer}
                        placeholder="Respond directly from the podium—offer specifics, reassure markets or allies, push back on critics, or pivot..."
                        className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white p-3.5 text-sm leading-relaxed text-stone-900 focus:border-[#132238] focus:outline-none disabled:bg-stone-50"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        disabled={isSubmittingAnswer}
                        onClick={handleSkipQuestion}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50"
                      >
                        <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {currentIdx + 1 < questions.length
                            ? 'Pass to Next Reporter'
                            : 'Conclude Briefing'}
                        </span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmittingAnswer || !answerText.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E3557] disabled:opacity-50"
                      >
                        {isSubmittingAnswer ? (
                          <>
                            <Loader2
                              className="h-3.5 w-3.5 animate-spin"
                              aria-hidden="true"
                            />
                            <span>Filing Press &amp; Poll Reactions...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Deliver Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Immediate Q&A Impact & Headlines */}
                {currentResult && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-stone-200 bg-white p-3.5 text-xs text-stone-700">
                      <span className="font-semibold text-stone-500">
                        Your Spoken Reply:
                      </span>{' '}
                      “{currentResult.playerAnswer}”
                    </div>

                    <div
                      className={`rounded-xl border p-5 space-y-3 ${
                        currentResult.approvalDelta > 0.2
                          ? 'border-emerald-200 bg-emerald-50/70'
                          : currentResult.approvalDelta < -0.2
                          ? 'border-red-200 bg-red-50/75'
                          : 'border-stone-200 bg-stone-50'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-stone-600">
                            Briefing Room Assessment · {currentResult.verdictLabel}
                          </p>
                          <h4 className="font-display text-lg font-bold text-stone-900">
                            {currentResult.leadHeadline}
                          </h4>
                        </div>
                        <span
                          className={`rounded-md border bg-white px-2.5 py-1 font-mono-num text-xs font-bold ${
                            currentResult.approvalDelta >= 0
                              ? 'border-emerald-200 text-emerald-800'
                              : 'border-red-200 text-red-800'
                          }`}
                        >
                          Approval {formatSigned(currentResult.approvalDelta)}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed text-stone-800">
                        {currentResult.mediaSummary}
                      </p>

                      <p className="text-xs italic text-stone-600">
                        {currentResult.reporterFollowUp}
                      </p>

                      <div className="flex flex-wrap gap-2 font-mono-num text-[11px]">
                        {Math.abs(currentResult.congressDelta) >= 0.1 && (
                          <span className="rounded border border-stone-200 bg-white px-2 py-0.5 font-semibold text-stone-800">
                            Congress {formatSigned(currentResult.congressDelta)}
                          </span>
                        )}
                        {Math.abs(currentResult.diplomaticDelta) >= 0.1 && (
                          <span className="rounded border border-stone-200 bg-white px-2 py-0.5 font-semibold text-stone-800">
                            Diplomacy{' '}
                            {formatSigned(currentResult.diplomaticDelta, '')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Generated Wire Headlines */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                        <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Headlines Added to News Wire</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {currentResult.mediaReactions.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg border border-stone-200 bg-white p-3 space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500">
                              <span className="font-semibold text-stone-700">
                                {item.outlet}
                              </span>
                              <span
                                className={`font-semibold capitalize ${
                                  item.tone === 'positive'
                                    ? 'text-emerald-700'
                                    : item.tone === 'critical'
                                    ? 'text-red-700'
                                    : 'text-stone-600'
                                }`}
                              >
                                {item.tone === 'positive'
                                  ? 'Favorable'
                                  : item.tone === 'critical'
                                  ? 'Critical'
                                  : 'Neutral'}
                              </span>
                            </div>
                            <p className="font-display text-sm font-bold leading-snug text-stone-900">
                              {item.headline}
                            </p>
                            <p className="text-[11px] leading-relaxed text-stone-600">
                              {item.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Final Conference Wrap-Up */}
          {showFinalSummary && cumulativeSummary && (
            <div className="space-y-4">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      cumulativeSummary.netApprovalDelta >= 0
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <h4 className="font-display text-lg font-bold text-stone-900">
                      Press Conference Concluded
                    </h4>
                    <p className="text-xs text-stone-600">
                      You fielded{' '}
                      <span className="font-mono-num font-semibold">
                        {cumulativeSummary.questionsAnswered}
                      </span>{' '}
                      {cumulativeSummary.questionsAnswered === 1
                        ? 'question'
                        : 'questions'}{' '}
                      from the White House Press Corps.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 font-mono-num text-xs">
                  <span
                    className={`rounded-md border bg-white px-3 py-1 font-bold ${
                      cumulativeSummary.netApprovalDelta >= 0
                        ? 'border-emerald-200 text-emerald-800'
                        : 'border-red-200 text-red-800'
                    }`}
                  >
                    Net Approval {formatSigned(cumulativeSummary.netApprovalDelta)}
                  </span>
                  <span className="rounded-md border border-stone-200 bg-white px-3 py-1 font-semibold text-stone-800">
                    Net Congress {formatSigned(cumulativeSummary.netCongressDelta)}
                  </span>
                  <span className="rounded-md border border-stone-200 bg-white px-3 py-1 font-semibold text-stone-800">
                    Net Diplomacy{' '}
                    {formatSigned(cumulativeSummary.netDiplomaticDelta, '')}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {cumulativeSummary.results.map((r, i) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-stone-200 bg-white p-3.5 space-y-1 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-stone-700">
                        Q{i + 1} · {r.reporterName} ({r.outlet}) · {r.verdictLabel}
                      </span>
                      <span
                        className={`font-mono-num font-bold ${
                          r.approvalDelta >= 0
                            ? 'text-emerald-700'
                            : 'text-red-700'
                        }`}
                      >
                        {formatSigned(r.approvalDelta)} Approval
                      </span>
                    </div>
                    <p className="font-display text-sm font-bold text-stone-900">
                      {r.leadHeadline}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-6 py-3.5">
          {!showFinalSummary ? (
            <>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmittingAnswer}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50"
              >
                {completedResults.length > 0 ? 'End Briefing Early' : 'Cancel'}
              </button>

              {currentResult && (
                <button
                  type="button"
                  onClick={handleAdvanceOrFinish}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557]"
                >
                  <span>
                    {currentIdx + 1 < questions.length
                      ? 'Next Journalist Question'
                      : 'View Briefing Summary'}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={handleCloseModal}
              className="ml-auto rounded-lg bg-[#132238] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1E3557]"
            >
              Return to Desk
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

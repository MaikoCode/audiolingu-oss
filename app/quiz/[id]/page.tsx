"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
};

export default function PublicQuizPage() {
  const params = useParams<{ id: string }>();
  const publicId = params?.id as string;
  const quiz = useQuery(api.quizzes.getQuizByPublicId, { id: publicId });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const questions: QuizQuestion[] = useMemo(
    () => (quiz?.questions as QuizQuestion[]) ?? [],
    [quiz]
  );

  const current = questions[currentIndex];

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    const isCorrect = selectedIndex === current.correctIndex;
    if (isCorrect) setScore((s) => s + 1);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setSelectedIndex(null);
    setShowFeedback(false);
    setCurrentIndex((i) => i + 1);
  };

  if (quiz === undefined) {
    return (
      <div className="mx-auto max-w-2xl p-6 md:p-8">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-6 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="mx-auto max-w-2xl p-6 md:p-8">
        <h1 className="text-2xl font-semibold">Quiz not found</h1>
        <p className="text-muted-foreground mt-2">
          This quiz link may be invalid or has been removed.
        </p>
      </div>
    );
  }

  const isDone = currentIndex >= questions.length;

  return (
    <main className="mx-auto max-w-2xl p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{quiz.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Question {Math.min(currentIndex + 1, questions.length)} of{" "}
          {questions.length}
        </p>
      </header>

      {isDone ? (
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-medium">All done!</h2>
          <p className="mt-2 text-muted-foreground">
            Your score: {score} / {questions.length}
          </p>
        </div>
      ) : (
        <section className="space-y-4">
          <div className="text-base leading-relaxed">{current.prompt}</div>
          <div className="grid gap-2">
            {current.choices.map((choice, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrect = idx === current.correctIndex;
              const showState = showFeedback;
              const stateClass = showState
                ? isCorrect
                  ? "border-green-500 bg-green-500/10"
                  : isSelected
                    ? "border-destructive bg-destructive/10"
                    : "border-muted"
                : isSelected
                  ? "border-primary bg-primary/5"
                  : "border-muted";

              return (
                <button
                  key={idx}
                  type="button"
                  className={
                    "w-full rounded-md border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring" +
                    " " +
                    stateClass
                  }
                  aria-label={`Answer ${idx + 1}`}
                  onClick={() => {
                    if (showFeedback) return;
                    setSelectedIndex(idx);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-xs font-semibold text-muted-foreground">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div>{choice}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {!showFeedback ? (
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={selectedIndex === null}
                aria-label="Submit answer"
              >
                Submit
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className={
                  selectedIndex === current.correctIndex
                    ? "text-green-600"
                    : "text-destructive"
                }
                role="status"
                aria-live="polite"
              >
                {selectedIndex === current.correctIndex
                  ? "Correct!"
                  : "Incorrect."}
              </div>
              {current.explanation ? (
                <p className="text-sm text-muted-foreground">
                  {current.explanation}
                </p>
              ) : null}
              <div className="flex justify-end">
                <Button onClick={handleNext} aria-label="Next question">
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

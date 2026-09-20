"use client";

import { useActionState, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { Messages } from "@/i18n/messages";
import { createCase, type CreateCaseState } from "@/server/actions/orders";
import { formatEgp } from "@/lib/utils";

type Category = { id: string; name: string; priceEgp: number };
type University = { id: string; name: string };

const initial: CreateCaseState = {};

export function CaseForm({
  locale,
  messages,
  universities,
  categories,
  instapayHandle,
}: {
  locale: "en" | "ar";
  messages: Messages;
  universities: University[];
  categories: Category[];
  instapayHandle: string;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [state, action, pending] = useActionState(
    async (prev: CreateCaseState, formData: FormData) => {
      const result = await createCase(prev, formData);
      if (result.code) {
        router.push(`/track/${result.code}?new=1`);
      }
      return result;
    },
    initial,
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [shade, setShade] = useState("");
  const [toothNotes, setToothNotes] = useState("");
  const [extraNotes, setExtraNotes] = useState("");

  const selected = useMemo(
    () => categories.find((item) => item.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const titles = [messages.formYou, messages.formCase, messages.formPay];

  function canContinue() {
    if (step === 0) return Boolean(name && phone && studentNumber && universityId);
    if (step === 1) return Boolean(categoryId);
    return true;
  }

  return (
    <form action={action} className="w-full max-w-xl">
      <p className="text-sm text-muted">
        {titles.slice(0, step + 1).join("  /  ")}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{titles[step]}</h2>

      <motion.div
        key={step}
        initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="mt-8 space-y-5"
      >
        {step === 0 ? (
          <>
            <Field label={messages.fullName}>
              <input
                className="ui-input"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </Field>
            <Field label={messages.phone}>
              <input
                className="ui-input"
                name="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="tel"
                autoComplete="tel"
                required
              />
            </Field>
            <Field label={messages.studentNumber}>
              <input
                className="ui-input"
                name="studentNumber"
                value={studentNumber}
                onChange={(event) => setStudentNumber(event.target.value)}
                required
              />
            </Field>
            <Field label={messages.university}>
              <select
                className="ui-input"
                name="universityId"
                value={universityId}
                onChange={(event) => setUniversityId(event.target.value)}
                required
              >
                <option value="">{messages.universityPlaceholder}</option>
                {universities.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
          </>
        ) : null}

        {step === 1 ? (
          <>
            {categories.length === 0 ? (
              <p className="max-w-[45ch] text-sm text-muted">{messages.emptyCatalog}</p>
            ) : (
              <fieldset className="space-y-2">
                <legend className="mb-3 text-sm font-medium">{messages.category}</legend>
                {categories.map((item) => (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-center justify-between gap-4 border-b border-border py-3 last:border-b-0 ${
                      categoryId === item.id ? "text-accent" : ""
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="categoryId"
                        value={item.id}
                        checked={categoryId === item.id}
                        onChange={() => setCategoryId(item.id)}
                      />
                      <span className="font-medium text-foreground">{item.name}</span>
                    </span>
                    <span className="font-mono text-sm text-foreground">
                      {formatEgp(item.priceEgp, locale)}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
            <Field label={messages.shade}>
              <input
                className="ui-input"
                name="shade"
                value={shade}
                onChange={(event) => setShade(event.target.value)}
              />
            </Field>
            <Field label={messages.toothNotes}>
              <textarea
                className="ui-input min-h-24"
                name="toothNotes"
                value={toothNotes}
                onChange={(event) => setToothNotes(event.target.value)}
              />
            </Field>
            <Field label={messages.extraNotes}>
              <textarea
                className="ui-input min-h-24"
                name="extraNotes"
                value={extraNotes}
                onChange={(event) => setExtraNotes(event.target.value)}
              />
            </Field>
          </>
        ) : null}

        {step === 2 && selected ? (
          <>
            <div>
              <p className="text-sm text-muted">{messages.instapayTitle}</p>
              <p className="mt-2 font-mono text-4xl tracking-tight">
                {formatEgp(selected.priceEgp, locale)}
              </p>
              <p className="mt-6 text-sm text-muted">{messages.instapayHandle}</p>
              <p className="mt-1 font-mono text-xl">{instapayHandle}</p>
              <p className="mt-3 max-w-[45ch] text-sm text-muted">{messages.instapayHint}</p>
            </div>
            <div>
              <p className="font-medium">{messages.reviewTitle}</p>
              <dl className="mt-3 space-y-1 text-sm text-muted">
                <div>{name}</div>
                <div>{phone}</div>
                <div>{selected.name}</div>
                <div className="font-mono text-foreground">
                  {formatEgp(selected.priceEgp, locale)}
                </div>
              </dl>
            </div>
            <Field label={messages.screenshot}>
              <input
                className="ui-input"
                type="file"
                name="screenshot"
                accept="image/jpeg,image/png,image/webp"
                required
              />
            </Field>
            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="phone" value={phone} />
            <input type="hidden" name="studentNumber" value={studentNumber} />
            <input type="hidden" name="universityId" value={universityId} />
            <input type="hidden" name="categoryId" value={categoryId} />
            <input type="hidden" name="shade" value={shade} />
            <input type="hidden" name="toothNotes" value={toothNotes} />
            <input type="hidden" name="extraNotes" value={extraNotes} />
          </>
        ) : null}
      </motion.div>

      {state.error ? (
        <p className="mt-4 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-10 flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            className="ui-press inline-flex items-center gap-1 rounded-full border border-border px-5 py-2.5 text-sm font-medium"
            onClick={() => setStep((current) => current - 1)}
          >
            <CaretLeft size={16} weight="bold" />
            {messages.back}
          </button>
        ) : null}
        {step < 2 ? (
          <button
            type="button"
            disabled={!canContinue()}
            className="ui-press ms-auto inline-flex items-center gap-1 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            onClick={() => setStep((current) => current + 1)}
          >
            {messages.continue}
            <CaretRight size={16} weight="bold" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending || !selected}
            className="ui-press ms-auto rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? messages.submitting : messages.submitCase}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

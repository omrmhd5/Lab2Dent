"use client";

import { useActionState, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react";
import type { Messages } from "@/i18n/messages";
import { createCase, type CreateCaseState } from "@/server/actions/orders";
import { formatEgp } from "@/lib/utils";

type Category = { id: string; name: string; priceEgp: number };

const initial: CreateCaseState = {};

export function CaseForm({
  locale,
  messages,
  categories,
  instapayHandle,
}: {
  locale: "en" | "ar";
  messages: Messages;
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
  const [university, setUniversity] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [shade, setShade] = useState("");
  const [toothNotes, setToothNotes] = useState("");
  const [extraNotes, setExtraNotes] = useState("");

  const selected = useMemo(
    () => categories.find((item) => item.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const titles = [messages.formYou, messages.formCase, messages.formPay];
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const NextIcon = locale === "ar" ? ArrowLeft : ArrowRight;

  function canContinue() {
    if (step === 0) return Boolean(name && phone && university);
    if (step === 1) return Boolean(categoryId);
    return true;
  }

  return (
    <form action={action} className="w-full">
      <p className="text-sm font-bold text-brand">
        {messages.stepOf.replace("{current}", String(step + 1)).replace("{total}", "3")}
      </p>
      <ol className="mt-4 flex gap-2" aria-label={messages.stepOf.replace("{current}", String(step + 1)).replace("{total}", "3")}>
        {titles.map((title, index) => (
          <li key={title} className="flex-1">
            <span
              className={`block h-1.5 rounded-full ${index <= step ? "bg-accent" : "bg-border"}`}
            />
            <span className="mt-2 hidden text-xs font-bold text-muted sm:block">{title}</span>
          </li>
        ))}
      </ol>
      <h2 className="mt-6 text-3xl font-bold tracking-tight">{titles[step]}</h2>

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
            <Field label={messages.university}>
              <input
                className="ui-input"
                name="university"
                value={university}
                onChange={(event) => setUniversity(event.target.value)}
                placeholder={messages.universityPlaceholder}
                autoComplete="organization"
                required
              />
            </Field>
          </>
        ) : null}

        {step === 1 ? (
          <>
            {categories.length === 0 ? (
              <p className="max-w-[45ch] text-muted">{messages.emptyCatalog}</p>
            ) : (
              <fieldset>
                <legend className="mb-3 text-sm font-bold">{messages.category}</legend>
                <div className="grid gap-3">
                  {categories.map((item) => {
                    const active = categoryId === item.id;
                    return (
                      <label
                        key={item.id}
                        className={`ui-card ui-card-hover ui-press flex cursor-pointer items-center justify-between gap-4 p-4 ${
                          active ? "border-accent ring-2 ring-accent" : ""
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="categoryId"
                            value={item.id}
                            checked={active}
                            onChange={() => setCategoryId(item.id)}
                            className="sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={`grid size-6 place-items-center rounded-full border ${
                              active ? "border-accent bg-accent text-white" : "border-border"
                            }`}
                          >
                            {active ? <Check size={14} weight="bold" /> : null}
                          </span>
                          <span className="font-bold">{item.name}</span>
                        </span>
                        <span className="font-mono text-sm">{formatEgp(item.priceEgp, locale)}</span>
                      </label>
                    );
                  })}
                </div>
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
            <div className="ui-card space-y-6 bg-brand-soft">
              <div>
                <p className="text-sm font-bold text-muted">{messages.instapayTitle}</p>
                <p className="mt-2 font-mono text-4xl font-bold tracking-tight">
                  {formatEgp(selected.priceEgp, locale)}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-muted">{messages.instapayHandle}</p>
                <p className="mt-1 font-mono text-2xl">{instapayHandle}</p>
              </div>
              <p className="max-w-[45ch] text-sm text-muted">{messages.instapayHint}</p>
            </div>
            <div className="ui-card">
              <p className="font-bold">{messages.reviewTitle}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{messages.fullName}</dt>
                  <dd className="font-bold">{name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{messages.phone}</dt>
                  <dd className="font-bold">{phone}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{messages.university}</dt>
                  <dd className="font-bold">{university}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{messages.category}</dt>
                  <dd className="font-bold">{selected.name}</dd>
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
            <input type="hidden" name="university" value={university} />
            <input type="hidden" name="categoryId" value={categoryId} />
            <input type="hidden" name="shade" value={shade} />
            <input type="hidden" name="toothNotes" value={toothNotes} />
            <input type="hidden" name="extraNotes" value={extraNotes} />
          </>
        ) : null}
      </motion.div>

      {state.error ? (
        <p className="mt-4 text-sm font-bold text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        {step > 0 ? (
          <button
            type="button"
            className="ui-press ui-btn ui-btn-secondary"
            onClick={() => setStep((current) => current - 1)}
          >
            <BackIcon size={16} weight="bold" aria-hidden="true" />
            {messages.back}
          </button>
        ) : null}
        {step < 2 ? (
          <button
            type="button"
            disabled={!canContinue()}
            className="ui-press ui-btn ui-btn-primary ms-auto disabled:opacity-50"
            onClick={() => setStep((current) => current + 1)}
          >
            {messages.continue}
            <NextIcon size={16} weight="bold" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending || !selected}
            className="ui-press ui-btn ui-btn-primary ms-auto disabled:opacity-50"
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
      <span className="text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}

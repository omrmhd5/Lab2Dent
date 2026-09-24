"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowSquareOut } from "@phosphor-icons/react";
import type { Messages } from "@/i18n/messages";
import { createCase, type CreateCaseState } from "@/server/actions/orders";
import type { InstapayConfig } from "@/lib/instapay";
import { formatInstapayDisplay, instapayOpensInNewTab } from "@/lib/instapay";
import { SelectMenu } from "@/components/select-menu";
import { pickLocale } from "@/lib/bilingual";
import { flattenSelectableItems, type CategoryGroup } from "@/lib/categories";
import { Spinner } from "@/components/spinner";
import { toast } from "@/components/toast";
import { formatEgp } from "@/lib/utils";

type University = { id: string; name: string; nameAr: string | null };

const initial: CreateCaseState = {};

export function CaseForm({
  locale,
  messages,
  categoryGroups,
  universities,
  instapay,
}: {
  locale: "en" | "ar";
  messages: Messages;
  categoryGroups: CategoryGroup[];
  universities: University[];
  instapay: InstapayConfig;
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

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [universityId, setUniversityId] = useState(universities[0]?.id ?? "");
  const availableGroups = useMemo(
    () => categoryGroups.filter((group) => group.items.length > 0),
    [categoryGroups],
  );
  const [groupId, setGroupId] = useState(availableGroups[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(
    availableGroups[0]?.items[0]?.id ?? "",
  );
  const selectableItems = useMemo(
    () => flattenSelectableItems(categoryGroups),
    [categoryGroups],
  );
  const activeGroup = useMemo(
    () => availableGroups.find((group) => group.id === groupId) ?? null,
    [availableGroups, groupId],
  );
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [fileReady, setFileReady] = useState<Record<string, boolean>>({});

  const selected = useMemo(
    () => selectableItems.find((item) => item.id === categoryId) ?? null,
    [selectableItems, categoryId],
  );

  const selectedUniversity = useMemo(
    () => universities.find((item) => item.id === universityId) ?? null,
    [universities, universityId],
  );

  const titles = [messages.formYou, messages.formCase, messages.formPay];
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const NextIcon = locale === "ar" ? ArrowLeft : ArrowRight;

  function selectGroup(id: string) {
    setGroupId(id);
    const group = availableGroups.find((item) => item.id === id);
    setCategoryId(group?.items[0]?.id ?? "");
    setTextValues({});
    setFileReady({});
  }

  function selectCategory(id: string) {
    setCategoryId(id);
    setTextValues({});
    setFileReady({});
  }

  function canContinue() {
    if (step === 0) return Boolean(name && phone && universityId);
    if (step === 1) {
      if (!groupId || !categoryId || !selected) return false;
      return selected.fields.every((field) => {
        if (!field.required) return true;
        if (field.type === "text") return Boolean(textValues[field.id]?.trim());
        return Boolean(fileReady[field.id]);
      });
    }
    return true;
  }

  return (
    <form action={action} className="w-full">
      <p className="text-sm font-bold text-brand">
        {messages.stepOf
          .replace("{current}", String(step + 1))
          .replace("{total}", "3")}
      </p>
      <ol
        className="mt-4 flex gap-2"
        aria-label={messages.stepOf
          .replace("{current}", String(step + 1))
          .replace("{total}", "3")}>
        {titles.map((title, index) => (
          <li key={title} className="flex-1">
            <span className="block h-1.5 overflow-hidden rounded-full bg-border">
              <span
                className={`block h-full origin-left rounded-full bg-accent transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] rtl:origin-right ${
                  index <= step ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </span>
            <span className="mt-2 hidden text-xs font-bold text-muted sm:block">
              {title}
            </span>
          </li>
        ))}
      </ol>
      <h2 className="mt-6 text-3xl font-bold tracking-tight">{titles[step]}</h2>

      <motion.div
        key={step}
        initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="mt-8 space-y-5">
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
              {universities.length === 0 ? (
                <p className="max-w-[45ch] text-sm text-muted">
                  {messages.emptyUniversities}
                </p>
              ) : (
                <SelectMenu
                  name="universityId"
                  value={universityId}
                  onChange={setUniversityId}
                  options={universities.map((item) => ({
                    value: item.id,
                    label: pickLocale(locale, item.name, item.nameAr),
                  }))}
                  placeholder={messages.universityPlaceholder}
                  ariaLabel={messages.university}
                  emptyLabel={messages.emptyUniversities}
                />
              )}
            </Field>
          </>
        ) : null}

        {step === 1 ? (
          <>
            {availableGroups.length === 0 ? (
              <p className="max-w-[45ch] text-muted">{messages.emptyCatalog}</p>
            ) : (
              <div className="space-y-5">
                <Field label={messages.categoryGroup}>
                  <SelectMenu
                    value={groupId}
                    onChange={selectGroup}
                    options={availableGroups.map((group) => ({
                      value: group.id,
                      label: group.name,
                    }))}
                    placeholder={messages.categoryGroupPlaceholder}
                    ariaLabel={messages.categoryGroup}
                    emptyLabel={messages.emptyCatalog}
                  />
                </Field>
                {activeGroup ? (
                  <Field label={messages.category}>
                    <SelectMenu
                      name="categoryId"
                      value={categoryId}
                      onChange={selectCategory}
                      options={activeGroup.items.map((item) => ({
                        value: item.id,
                        label: `${item.name} — ${formatEgp(item.priceEgp, locale)}`,
                      }))}
                      placeholder={messages.categoryPlaceholder}
                      ariaLabel={messages.category}
                      emptyLabel={messages.emptyCatalog}
                    />
                  </Field>
                ) : null}
              </div>
            )}
          </>
        ) : null}

        {step === 2 && selected ? (
          <>
            <div className="ui-card space-y-6 bg-brand-soft">
              <div>
                <p className="text-sm font-bold text-muted">
                  {messages.instapayTitle}
                </p>
                <p className="mt-2 font-mono text-4xl font-bold tracking-tight">
                  {formatEgp(selected.priceEgp, locale)}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-muted">
                  {messages.instapayHandle}
                </p>
                <a
                  href={instapay.link}
                  aria-label={`${messages.instapayHandle}: ${formatInstapayDisplay(instapay.link)}`}
                  className="ui-press mt-2 inline-flex min-h-11 items-center gap-2 font-mono text-2xl font-bold text-brand underline-offset-4 hover:underline"
                  {...(instapayOpensInNewTab(instapay.link)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}>
                  {formatInstapayDisplay(instapay.link)}
                  <ArrowSquareOut size={22} weight="bold" aria-hidden="true" />
                </a>
              </div>
              <p className="max-w-[45ch] text-sm text-muted">
                {messages.instapayHint}
              </p>
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
                  <dd className="font-bold">
                    {selectedUniversity
                      ? pickLocale(
                          locale,
                          selectedUniversity.name,
                          selectedUniversity.nameAr,
                        )
                      : null}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{messages.category}</dt>
                  <dd className="font-bold">
                    {selected.groupName} — {selected.name}
                  </dd>
                </div>
                {selected.fields
                  .filter(
                    (field) =>
                      field.type === "text" && textValues[field.id]?.trim(),
                  )
                  .map((field) => (
                    <div key={field.id} className="flex justify-between gap-4">
                      <dt className="min-w-0 text-muted">{field.label}</dt>
                      <dd className="min-w-0 break-words text-end font-bold">
                        {textValues[field.id]}
                      </dd>
                    </div>
                  ))}
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
            <input type="hidden" name="universityId" value={universityId} />
            <input type="hidden" name="categoryId" value={categoryId} />
          </>
        ) : null}
      </motion.div>

      <div className={step === 1 ? "mt-5 space-y-5" : "hidden"}>
        {selected?.fields.map((field) => (
          <Field
            key={`${categoryId}-${field.id}`}
            label={field.required ? `${field.label} *` : field.label}>
            {field.type === "text" ? (
              <input
                className="ui-input"
                name={`field_${field.id}`}
                value={textValues[field.id] ?? ""}
                onChange={(event) =>
                  setTextValues((current) => ({
                    ...current,
                    [field.id]: event.target.value,
                  }))
                }
              />
            ) : (
              <input
                className="ui-input"
                type="file"
                name={`field_${field.id}`}
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setFileReady((current) => ({
                    ...current,
                    [field.id]: Boolean(file && file.size > 0),
                  }));
                }}
              />
            )}
          </Field>
        ))}
      </div>

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
            onClick={() => setStep((current) => current - 1)}>
            <BackIcon size={16} weight="bold" aria-hidden="true" />
            {messages.back}
          </button>
        ) : null}
        {step < 2 ? (
          <button
            type="button"
            disabled={!canContinue()}
            className="ui-press ui-btn ui-btn-primary ms-auto disabled:opacity-50"
            onClick={() => setStep((current) => current + 1)}>
            {messages.continue}
            <NextIcon size={16} weight="bold" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending || !selected}
            className="ui-press ui-btn ui-btn-primary ms-auto disabled:opacity-50">
            {pending ? <Spinner /> : null}
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

"use client";

import { useEffect, useId, useState } from "react";
import type { Review } from "@/lib/types";
import { summarize } from "@/lib/data/reviews";
import { appendLocal, localId, readLocal } from "@/lib/local-store";
import { formatDate } from "@/lib/format";
import { track } from "@/lib/analytics";
import { RatingStars } from "@/components/reviews/RatingStars";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { Badge } from "@/components/ui/Badge";
import { IconCheck, IconStar } from "@/components/ui/Icon";

const criteriaLabels = {
  equipmentCondition: "Estado del equipo",
  punctuality: "Puntualidad",
  communication: "Comunicación",
  compliance: "Cumplimiento",
} as const;

type CriteriaKey = keyof typeof criteriaLabels;

/**
 * SISTEMA DE RESEÑAS
 * ---------------------------------------------------------------------------
 * La interfaz está completa: promedio, desglose por criterio, listado,
 * distintivo de alquiler verificado, respuesta del propietario y formulario.
 *
 * Lo que NO hace: inventar reseñas. `reviews` llega vacío desde la capa de
 * datos y, mientras lo esté, la sección muestra el estado vacío honesto.
 *
 * El formulario funciona de verdad —valida y guarda— pero deja claro que la
 * reseña queda en este navegador. Publicar una reseña visible para todos
 * exige backend con autenticación: sin identificar a quien escribe, un
 * sistema de reputación abierto se llena de reseñas falsas en semanas, que es
 * justo el problema que MaquiFly quiere resolver.
 */
export function ReviewsSection({
  reviews,
  machineId,
  machineName,
  isDemo,
}: {
  reviews: Review[];
  machineId: string;
  machineName: string;
  isDemo: boolean;
}) {
  const id = useId();
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    const stored = readLocal<Review[]>(`reviews:${machineId}`, []);
    setLocalReviews(stored);
  }, [machineId]);

  const summary = summarize(reviews);

  return (
    <section aria-labelledby={`${id}-title`} className="scroll-mt-24" id="resenas">
      <div className="flex flex-col gap-4 border-b border-steel-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id={`${id}-title`} className="text-xl font-extrabold text-ink-900">
            Reseñas y reputación
          </h2>
          <div className="mt-2">
            <RatingStars
              rating={summary.rating}
              count={summary.count}
              size="lg"
              emptyLabel="Aún no hay reseñas para esta maquinaria."
            />
          </div>
        </div>
        {!formOpen && (
          <Button variant="secondary" onClick={() => setFormOpen(true)}>
            <IconStar size={17} />
            Escribir una reseña
          </Button>
        )}
      </div>

      {summary.count === 0 && (
        <div className="mt-5 rounded-2xl border-2 border-dashed border-steel-300 bg-steel-50 p-6 text-center">
          <p className="text-base font-bold text-ink-900">
            Aún no hay reseñas. Sé el primero en calificar este alquiler.
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-steel-600">
            MaquiFly no muestra calificaciones de relleno. Cuando alguien
            alquile {isDemo ? "una máquina real" : `el ${machineName}`} y deje su
            opinión, aparecerá aquí con su calificación de estado del equipo,
            puntualidad, comunicación y cumplimiento.
          </p>
        </div>
      )}

      {summary.count > 0 && (
        <ul className="mt-5 flex flex-col gap-4">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </ul>
      )}

      {localReviews.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <Badge tone="warn">Solo visible para ti</Badge>
            <p className="text-sm text-steel-500">
              Guardada en este navegador, sin publicar.
            </p>
          </div>
          <ul className="flex flex-col gap-4">
            {localReviews.map((review) => (
              <ReviewItem key={review.id} review={review} local />
            ))}
          </ul>
        </div>
      )}

      {formOpen && (
        <ReviewForm
          machineId={machineId}
          onCancel={() => setFormOpen(false)}
          onSaved={(review) => {
            setLocalReviews((prev) => [...prev, review]);
            setFormOpen(false);
          }}
        />
      )}
    </section>
  );
}

function ReviewItem({ review, local = false }: { review: Review; local?: boolean }) {
  return (
    <li
      className={`rounded-2xl border p-5 ${
        local ? "border-warn-500/40 bg-warn-50" : "border-steel-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-ink-900 text-sm font-bold text-volt-400">
            {review.reviewerName.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-bold text-ink-900">{review.reviewerName}</p>
            <p className="text-xs text-steel-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {review.verifiedRental && (
            <Badge tone="ok" size="sm">
              <IconCheck size={12} />
              Alquiler verificado
            </Badge>
          )}
          <RatingStars rating={review.rating} count={1} showCount={false} size="sm" />
        </div>
      </div>

      <p className="mt-3 text-[0.95rem] leading-relaxed text-steel-700">
        {review.comment}
      </p>

      {review.criteria && (
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-steel-100 pt-3 sm:grid-cols-4">
          {(Object.keys(criteriaLabels) as CriteriaKey[]).map((key) => {
            const value = review.criteria?.[key];
            if (typeof value !== "number") return null;
            return (
              <div key={key}>
                <dt className="text-xs text-steel-500">{criteriaLabels[key]}</dt>
                <dd className="text-sm font-bold text-ink-900">{value}/5</dd>
              </div>
            );
          })}
        </dl>
      )}

      {review.ownerReply && (
        <div className="mt-4 rounded-xl border-l-4 border-brand-400 bg-brand-50 p-3.5">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-800">
            Respuesta del propietario
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-steel-700">
            {review.ownerReply.comment}
          </p>
        </div>
      )}
    </li>
  );
}

function ReviewForm({
  machineId,
  onCancel,
  onSaved,
}: {
  machineId: string;
  onCancel: () => void;
  onSaved: (review: Review) => void;
}) {
  const id = useId();
  const [rating, setRating] = useState(0);
  const [criteria, setCriteria] = useState<Record<CriteriaKey, number>>({
    equipmentCondition: 0,
    punctuality: 0,
    communication: 0,
    compliance: 0,
  });
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (rating === 0) next.rating = "Selecciona una calificación general.";
    if (name.trim().length < 2) next.name = "Escribe tu nombre.";
    if (comment.trim().length < 20)
      next.comment = "Cuenta tu experiencia con algo más de detalle (mínimo 20 caracteres).";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const review: Review = {
      id: localId("rev"),
      machineId,
      ownerId: "",
      reviewerId: "local",
      reviewerName: name.trim(),
      rating,
      comment: comment.trim(),
      criteria: Object.fromEntries(
        Object.entries(criteria).filter(([, v]) => v > 0),
      ) as Review["criteria"],
      // Nunca se marca como verificado: MaquiFly no registró ningún alquiler.
      verifiedRental: false,
      createdAt: new Date().toISOString(),
      ownerReply: null,
    };

    appendLocal(`reviews:${machineId}`, review);
    track({ name: "review_submit", machineId });
    onSaved(review);
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="mt-6 rounded-2xl border border-steel-200 bg-white p-5"
    >
      <h3 className="text-lg font-bold text-ink-900">Escribe tu reseña</h3>

      <Callout tone="warn" className="mt-3">
        <strong>Estado real de esta función:</strong> el formulario valida y
        guarda tu reseña en este navegador, pero no la publica. Las reseñas
        públicas requieren cuenta verificada y backend; sin eso, un sistema de
        reputación abierto se llena de reseñas falsas.
      </Callout>

      <div className="mt-5 flex flex-col gap-4">
        <fieldset>
          <legend className="text-sm font-semibold text-ink-900">
            Calificación general <span className="text-danger-500">*</span>
          </legend>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} de 5 estrellas`}
                aria-pressed={rating === value}
                className="rounded p-0.5 transition-transform hover:scale-110"
              >
                <IconStar
                  size={30}
                  filled={value <= rating}
                  className={value <= rating ? "text-warn-500" : "text-steel-300"}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm font-bold text-ink-900">{rating}/5</span>
            )}
          </div>
          {errors.rating && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-danger-700">
              {errors.rating}
            </p>
          )}
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-ink-900">
            Detalle por criterio{" "}
            <span className="font-normal text-steel-500">(opcional)</span>
          </legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {(Object.keys(criteriaLabels) as CriteriaKey[]).map((key) => (
              <label
                key={key}
                className="flex items-center justify-between gap-3 rounded-lg border border-steel-200 px-3 py-2"
              >
                <span className="text-sm text-steel-700">{criteriaLabels[key]}</span>
                <select
                  value={criteria[key]}
                  onChange={(e) =>
                    setCriteria((prev) => ({
                      ...prev,
                      [key]: Number(e.target.value),
                    }))
                  }
                  className="h-8 rounded-md border border-steel-300 bg-white px-2 text-sm"
                >
                  <option value={0}>—</option>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Tu nombre" htmlFor={`${id}-name`} required error={errors.name}>
          <Input
            id={`${id}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            invalid={Boolean(errors.name)}
            maxLength={60}
            autoComplete="name"
          />
        </Field>

        <Field
          label="Tu experiencia"
          htmlFor={`${id}-comment`}
          required
          error={errors.comment}
          hint="¿Cómo llegó la máquina? ¿Se cumplieron los horarios? ¿Cómo fue la comunicación?"
        >
          <Textarea
            id={`${id}-comment`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            invalid={Boolean(errors.comment)}
            maxLength={1000}
          />
        </Field>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="submit" variant="primary" fullWidth>
            Guardar reseña
          </Button>
          <Button type="button" variant="ghost" fullWidth onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  );
}

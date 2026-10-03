import { useId, useState } from 'react';
import { Bookmark, Cart as CartIcon, Trash } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Label } from '@/components/ui/label';
import { NumberField } from '@/components/ui/number-field';
import { TextField } from '@/components/ui/text-field';
import { undoToast } from '@/components/ui/undo-toast';
import { OrderSummary, computeTotals, formatMoney, withDots, type OrderLine, type OrderTotals } from './shared';

export interface CartLine extends OrderLine {
  /** Lines bought one at a time (a plan, a domain term) hide the quantity field. */
  quantityEditable?: boolean;
  maxQuantity?: number;
}

export type PromoResult = { discount: number } | { error: string };

export interface CartProps {
  lines: CartLine[];
  /** Items parked with "Save for later". */
  saved?: CartLine[];
  taxRate?: number;
  taxLabel?: string;
  currency?: string;
  /** Checks a promo code against the current subtotal. Demo default: WELCOME10 = 10% off. */
  validatePromo?: (code: string, subtotal: number) => PromoResult;
  onCheckout?: (lines: CartLine[], totals: OrderTotals) => void;
  /** Where "Browse plans" goes from an empty cart. */
  onBrowse?: () => void;
  className?: string;
}

const demoPromo = (code: string, subtotal: number): PromoResult =>
  code.trim().toUpperCase() === 'WELCOME10' ? { discount: Math.round(subtotal * 10) / 100 } : { error: `“${code.trim()}” isn't a valid code. Check the spelling, or the date it expires.` };

/**
 * The cart as a working list, not a dead end: quantities update the totals
 * instantly (0 removes the line, with undo), items can be parked with
 * "Save for later" and brought back, the promo field waits behind a link so
 * it doesn't send people off hunting for codes, and the full cost — tax
 * included — is visible before checkout.
 */
export function Cart({ lines: initialLines, saved: initialSaved = [], taxRate = 0, taxLabel = 'Tax', currency = 'USD', validatePromo = demoPromo, onCheckout, onBrowse, className }: CartProps) {
  const [lines, setLines] = useState(initialLines);
  const [saved, setSaved] = useState(initialSaved);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promo, setPromo] = useState<{ code: string; rate: number } | null>(null);
  const [promoError, setPromoError] = useState<string>();
  const promoId = useId();
  const headingId = useId();

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const discount = promo ? Math.round(subtotal * promo.rate * 100) / 100 : 0;
  const totals = computeTotals(lines, { taxRate, discount });

  const remove = (line: CartLine, index: number) => {
    setLines((ls) => ls.filter((l) => l.id !== line.id));
    undoToast({
      title: `${line.name} removed`,
      onUndo: () => setLines((ls) => [...ls.slice(0, index), line, ...ls.slice(index)]),
    });
  };
  const setQuantity = (line: CartLine, index: number, quantity: number) => {
    if (quantity <= 0) remove(line, index);
    else setLines((ls) => ls.map((l) => (l.id === line.id ? { ...l, quantity } : l)));
  };
  const saveForLater = (line: CartLine) => {
    setLines((ls) => ls.filter((l) => l.id !== line.id));
    setSaved((s) => [line, ...s]);
  };
  const moveToCart = (line: CartLine) => {
    setSaved((s) => s.filter((l) => l.id !== line.id));
    setLines((ls) => [...ls, line]);
  };
  const applyPromo = () => {
    if (!promoCode.trim()) {
      setPromoError('Enter a promo code.');
      return;
    }
    const result = validatePromo(promoCode, subtotal);
    if ('error' in result) {
      setPromoError(result.error);
      return;
    }
    setPromo({ code: promoCode.trim().toUpperCase(), rate: subtotal ? result.discount / subtotal : 0 });
    setPromoError(undefined);
    setPromoOpen(false);
  };

  if (!lines.length && !saved.length) {
    return (
      <EmptyState
        className={className}
        icon={<CartIcon />}
        title="Your cart is empty"
        description="Plans, domains and add-ons you pick show up here."
        action={
          onBrowse && (
            <Button appearance="filled" tone="primary" onClick={onBrowse}>
              Browse plans
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className={cn('grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start', className)}>
      <div className="flex min-w-0 flex-col gap-6">
        <section aria-labelledby={headingId} className="flex flex-col gap-3">
          <h2 id={headingId} className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">
            {`Cart (${lines.length})`}
          </h2>
          {lines.length ? (
            <ul className="flex flex-col">
              {lines.map((line, i) => (
                <CartRow key={line.id} line={line} currency={currency} first={i === 0}>
                  {line.quantityEditable && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${line.id}-qty`} className="text-body-s text-[var(--color-text-text-subtle)]">
                        Qty
                      </Label>
                      <NumberField
                        id={`${line.id}-qty`}
                        value={line.quantity}
                        min={0}
                        max={line.maxQuantity}
                        onValueChange={(q) => setQuantity(line, i, q)}
                        widthSize="full"
                        heightSize="sm"
                        className="w-28"
                        decrementLabel={`Fewer ${line.name}`}
                        incrementLabel={`More ${line.name}`}
                      />
                    </div>
                  )}
                  <Button appearance="ghost" tone="secondary" size="sm" leftIcon={<Bookmark />} onClick={() => saveForLater(line)} aria-label={`Save ${line.name} for later`}>
                    Save for later
                  </Button>
                  <Button appearance="ghost" tone="danger" size="sm" leftIcon={<Trash />} onClick={() => remove(line, i)} aria-label={`Remove ${line.name}`}>
                    Remove
                  </Button>
                </CartRow>
              ))}
            </ul>
          ) : (
            <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">Nothing in the cart right now. Move a saved item back to buy it.</p>
          )}
        </section>

        {saved.length > 0 && (
          <section aria-label="Saved for later" className="flex flex-col gap-3">
            <h2 className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{`Saved for later (${saved.length})`}</h2>
            <ul className="flex flex-col">
              {saved.map((line, i) => (
                <CartRow key={line.id} line={line} currency={currency} first={i === 0}>
                  <Button appearance="outlined" tone="secondary" size="sm" onClick={() => moveToCart(line)} aria-label={`Move ${line.name} to cart`}>
                    Move to cart
                  </Button>
                </CartRow>
              ))}
            </ul>
          </section>
        )}
      </div>

      <OrderSummary lines={lines} totals={totals} currency={currency} taxLabel={taxLabel} hideLines className="lg:sticky lg:top-6">
        <div className="flex flex-col gap-2">
          {promo ? (
            <p className="flex items-center justify-between gap-2 font-body text-body-s text-[var(--color-text-text-subtle)]">
              <span>
                Code <span className="font-mono text-[var(--color-text-text)]">{promo.code}</span> applied
              </span>
              <Button appearance="ghost" tone="secondary" size="sm" onClick={() => setPromo(null)}>
                Remove code
              </Button>
            </p>
          ) : promoOpen ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor={promoId}>Promo code</Label>
              <div className="flex items-start gap-2">
                <TextField
                  id={promoId}
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.currentTarget.value);
                    setPromoError(undefined);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyPromo();
                    }
                  }}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  error={promoError}
                  widthSize="full"
                  className="font-mono"
                />
                <Button appearance="outlined" tone="secondary" onClick={applyPromo}>
                  Apply
                </Button>
              </div>
            </div>
          ) : (
            // Behind a link: an open field invites people to leave and go
            // looking for a code they don't have.
            <button
              type="button"
              onClick={() => {
                setPromoOpen(true);
                requestAnimationFrame(() => document.getElementById(promoId)?.focus());
              }}
              // link-on-tonal: plain text-link is under 4.5:1 on the summary panel in dark.
              className="self-start rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-s font-medium text-[var(--color-text-text-link-on-tonal)] underline-offset-4 outline-none hover:underline focus-visible:focus-ring"
            >
              Have a promo code?
            </button>
          )}
        </div>
        <Button appearance="filled" tone="primary" size="xl" fullWidth disabled={!lines.length} onClick={() => onCheckout?.(lines, totals)}>
          Continue to checkout
        </Button>
        <p className="text-center font-body text-body-s text-[var(--color-text-text-subtler)]">You won't be charged until you review the order.</p>
      </OrderSummary>
    </div>
  );
}

function CartRow({ line, currency, first, children }: { line: CartLine; currency: string; first: boolean; children: React.ReactNode }) {
  return (
    <li className={cn('flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between', !first && 'border-t border-solid border-[var(--color-border-border-subtler)]')}>
      <div className="min-w-0">
        <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">{line.name}</p>
        {line.detail && <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{withDots(line.detail)}</p>}
        <p className="mt-1 font-body text-body-s tabular-nums text-[var(--color-text-text-subtle)]">
          {line.quantity > 1 ? withDots(`${formatMoney(line.unitPrice, currency)} each · ${formatMoney(line.unitPrice * line.quantity, currency)}`) : formatMoney(line.unitPrice, currency)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">{children}</div>
    </li>
  );
}

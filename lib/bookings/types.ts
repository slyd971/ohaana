export type RefundState =
  | { kind: 'refunded'; cents: number } // remboursement parti vers le voyageur
  | { kind: 'none' } // rien à rembourser (jamais payée, ou politique à 0 %)
  | { kind: 'pending' } // annulation enregistrée mais remboursement à relancer (visible côté admin)

export interface CancelResult {
  ok: boolean
  error?: string
  refund?: RefundState
}

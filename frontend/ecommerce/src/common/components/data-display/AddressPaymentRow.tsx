import { MapPin, CreditCard } from 'lucide-react'
import type { Address } from '@/types'
import AddressLines from './AddressLines'

interface Props {
  address: Address
  paymentMethod: string
  addressLabel: string
  paymentNote?: string
}

/** Side-by-side "shipped to" / "payment" recap used on order screens. */
export default function AddressPaymentRow({
  address,
  paymentMethod,
  addressLabel,
  paymentNote,
}: Props) {
  return (
    <div className="sz-ship-pay-row">
      <div className="sz-sp-block">
        <div className="sz-sp-label"><MapPin size={11} /> {addressLabel}</div>
        <div className="sz-sp-val"><AddressLines address={address} /></div>
      </div>
      <div className="sz-sp-block">
        <div className="sz-sp-label"><CreditCard size={11} /> Payment</div>
        <div className="sz-sp-val">{paymentMethod}</div>
        {paymentNote && <div className="sz-sp-note">{paymentNote}</div>}
      </div>
    </div>
  )
}

import type { Address } from '@/types'

interface Props {
  address: Address
}

/** Street / city-state-zip / country on three lines. */
export default function AddressLines({ address }: Props) {
  return (
    <>
      {address.street}<br />
      {address.city}, {address.state} {address.zipCode}<br />
      {address.country}
    </>
  )
}

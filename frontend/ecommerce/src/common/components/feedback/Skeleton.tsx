import type { CSSProperties } from 'react'

interface Props {
  style?: CSSProperties
}

/** Shimmering placeholder block. */
export default function Skeleton({ style }: Props) {
  return <div className="sz-skel" style={style} />
}

export interface TabItem<T extends string> {
  key: T
  label: string
  count: number
}

interface Props<T extends string> {
  tabs: TabItem<T>[]
  active: T
  onChange: (key: T) => void
}

/** Pill tab bar with a count badge on each tab. */
export default function Tabs<T extends string>({ tabs, active, onChange }: Props<T>) {
  return (
    <div className="sz-tabs">
      {tabs.map(({ key, label, count }) => (
        <button
          key={key}
          className={`sz-tab${active === key ? ' active' : ''}`}
          onClick={() => onChange(key)}
        >
          {label}
          <span className="count">{count}</span>
        </button>
      ))}
    </div>
  )
}

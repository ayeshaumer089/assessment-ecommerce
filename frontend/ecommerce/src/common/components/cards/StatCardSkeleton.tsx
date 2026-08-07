/** Loading placeholder matching {@link StatCard}'s footprint. */
export default function StatCardSkeleton() {
  return (
    <div className="sz-stat-card" style={{ animation: 'fade-in .3s ease' }}>
      <div className="sz-stat-top">
        <div style={{ height: 14, width: 100, background: '#ECE8F6', borderRadius: 6 }} />
        <div style={{ width: 38, height: 38, borderRadius: 11, background: '#ECE8F6' }} />
      </div>
      <div style={{ height: 28, width: 120, background: '#ECE8F6', borderRadius: 8 }} />
    </div>
  )
}

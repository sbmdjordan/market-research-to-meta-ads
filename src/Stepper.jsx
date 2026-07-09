export const STEPS = ['Setup', 'Sources', 'Segments', 'Offer', 'Headlines', 'Creatives']

// `maxStep` = furthest step the user has actually reached (data exists for it).
// Tabs up to and including it are clickable; later ones are inert previews.
export function Stepper({ index, maxStep = index, onClick }) {
  return (
    <ol className="stepper">
      {STEPS.map((label, i) => {
        const clickable = Boolean(onClick) && i <= maxStep
        return (
          <li
            key={label}
            data-tour={`stepper-${i}`}
            className={`stepper-item ${i === index ? 'current' : ''} ${
              i < index ? 'done' : ''
            } ${clickable ? 'clickable' : ''}`}
            onClick={clickable ? () => onClick(i) : undefined}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
          >
            <span className="stepper-dot">{i < index ? '✓' : i + 1}</span>
            <span className="stepper-label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

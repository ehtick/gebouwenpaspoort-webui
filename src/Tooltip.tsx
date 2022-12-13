import "./Tooltip.css";

export function HoverInfo({ feature, x, y }) {
  return (
    <div className="tooltip" style={{ left: x, top: y }}>
      {/* show all properties as key values */}
      {Object.keys(feature.properties).map((key) => (
        <div key={key}>
          <div className="tooltip__key">{key}</div>
          {feature.properties[key]}
        </div>
      ))}
    </div>
  );
}
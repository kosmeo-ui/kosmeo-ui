import { ColorSwatch, Row } from "@kosmeo-ui/react";

const SWATCHES = [
  "#17257d",
  "#2bb6c4",
  "#5ad89a",
  "#ffc107",
  "#dc3545",
  "#8e44ad",
];

export const ColorSwatches = () => (
  <Row wrap align="center">
    {SWATCHES.map((c) => (
      <ColorSwatch key={c} color={c} title={c} bordered />
    ))}
    <ColorSwatch color="#2bb6c4" size="sm" />
    <ColorSwatch color="#2bb6c4" size="lg" />
  </Row>
);

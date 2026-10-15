import { ColorPicker, ColorSwatch, FormGrid, Row } from "@kosmeo-ui/react";
import { useState } from "react";

export const ColorPickerExample = () => {
  const [color, setColor] = useState("#2bb6c4");
  const [optional, setOptional] = useState("");

  return (
    <FormGrid columns={2}>
      <Row align="end">
        <ColorPicker label="Brand color" value={color} onChange={setColor} />
        <ColorSwatch color={color} size="lg" bordered title={color} />
      </Row>
      <ColorPicker
        label="Optional color"
        value={optional}
        onChange={setOptional}
        allowEmpty
        placeholder="No color"
      />
    </FormGrid>
  );
};

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Row, type Variant } from "@kosmeo-ui/react";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useState } from "react";

const VARIANTS: Variant[] = [
  "primary",
  "secondary",
  "light",
  "success",
  "warning",
  "danger",
];

export const Badges = () => {
  const [labels, setLabels] = useState(["design", "frontend", "a11y"]);

  return (
    <>
      <Row wrap>
        {VARIANTS.map((v) => (
          <Badge key={v} variant={v}>
            {v}
          </Badge>
        ))}
      </Row>
      <Row wrap>
        {VARIANTS.map((v) => (
          <Badge key={v} variant={v} subtle>
            {v}
          </Badge>
        ))}
      </Row>
      <Row wrap align="center">
        <Badge size="sm" pill={false}>
          square sm
        </Badge>
        <Badge size="lg" startIcon={<FontAwesomeIcon icon={faStar} />}>
          with icon
        </Badge>
        <Badge variant="custom" color="#8e44ad">
          custom color
        </Badge>
        <Badge variant="secondary" onClick={() => toast("Badge clicked")}>
          clickable
        </Badge>
        {labels.map((l) => (
          <Badge
            key={l}
            variant="primary"
            subtle
            onRemove={() => setLabels((ls) => ls.filter((x) => x !== l))}
          >
            {l}
          </Badge>
        ))}
      </Row>
    </>
  );
};

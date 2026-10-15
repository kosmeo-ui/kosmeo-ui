import { Button, Dropdown, IconButton, Row, Tooltip } from "@kosmeo-ui/react";
import type { Size, Variant } from "@kosmeo-ui/react";
import { toast } from "react-toastify";
import {
  faDownload,
  faPen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const VARIANTS: Variant[] = [
  "primary",
  "secondary",
  "light",
  "success",
  "warning",
  "danger",
];
const SIZES: Size[] = ["sm", "md", "lg"];

export const Buttons = () => (
  <>
    <Row wrap>
      {VARIANTS.map((v) => (
        <Button key={v} variant={v}>
          {v}
        </Button>
      ))}
      <Button variant="link">link</Button>
    </Row>
    <Row wrap align="center">
      {SIZES.map((s) => (
        <Button key={s} size={s}>
          Size {s}
        </Button>
      ))}
      <Button isLoading>Saving</Button>
      <Button disabled>Disabled</Button>
      <Button shadow variant="light">
        With shadow
      </Button>
    </Row>
    <Row wrap align="center">
      <IconButton icon={faPlus}>New</IconButton>
      <IconButton icon={faDownload} variant="secondary">
        Export
      </IconButton>
      <Tooltip content="Edit">
        <IconButton icon={faPen} variant="light" aria-label="Edit" />
      </Tooltip>
      <Tooltip content="Delete" position="bottom">
        <IconButton icon={faTrash} variant="danger" aria-label="Delete" />
      </Tooltip>
      <Dropdown label="Actions" variant="secondary">
        <div className="demo-menu">
          <Button
            variant="light"
            fullWidth
            align="left"
            onClick={() => toast("Duplicated")}
          >
            Duplicate
          </Button>
          <Button
            variant="light"
            fullWidth
            align="left"
            onClick={() => toast("Archived")}
          >
            Archive
          </Button>
        </div>
      </Dropdown>
    </Row>
    <Button fullWidth variant="primary">
      Full-width button
    </Button>
  </>
);

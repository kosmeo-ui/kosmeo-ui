import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, StatCard, SummaryRow } from "@kosmeo-ui/react";
import { toast } from "react-toastify";
import {
  faBolt,
  faCartShopping,
  faTriangleExclamation,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

export const Stats = () => (
  <>
    <div className="demo-stat-grid">
      <StatCard
        label="Orders today"
        value="1,284"
        icon={<FontAwesomeIcon icon={faCartShopping} />}
        iconVariant="primary"
        trailing={
          <Badge size="sm" variant="success">
            +12%
          </Badge>
        }
      />
      <StatCard
        label="Clickable"
        value={42}
        icon={<FontAwesomeIcon icon={faUsers} />}
        iconVariant="success"
        onClick={() => toast("StatCard clicked")}
      />
      <StatCard
        label="Failed jobs"
        value={3}
        icon={<FontAwesomeIcon icon={faTriangleExclamation} />}
        iconVariant="danger"
      />
      <StatCard
        label="Compact"
        value="99.9%"
        icon={<FontAwesomeIcon icon={faBolt} />}
        iconVariant="warning"
        compact
      />
    </div>
    <SummaryRow
      items={[
        { label: "Revenue", value: "$48,210" },
        { label: "Refunds", value: "$1,032" },
        { label: "Net", value: "$47,178" },
        { label: "Margin", value: "38%" },
      ]}
    />
  </>
);

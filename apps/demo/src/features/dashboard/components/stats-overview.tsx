import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStats } from "../api/get-stats";
import { useNavigate } from "react-router";
import { currency } from "@/utils/format";
import { paths } from "@/config/paths";
import {
  faCircleCheck,
  faDollarSign,
  faHourglassHalf,
  faUserMinus,
} from "@fortawesome/free-solid-svg-icons";
import {
  Badge,
  Spinner,
  StatCard,
  SummaryRow,
  Tooltip,
} from "@kosmeo-ui/react";

export const StatsOverview = () => {
  const navigate = useNavigate();
  const { data: stats } = useStats();

  if (!stats) return <Spinner />;

  return (
    <>
      <div className="demo-stat-grid">
        <StatCard
          label="Monthly recurring revenue"
          value={currency(stats.mrr)}
          icon={<FontAwesomeIcon icon={faDollarSign} />}
          iconVariant="primary"
          trailing={
            <Badge size="sm" variant="success">
              +4.2%
            </Badge>
          }
        />
        <StatCard
          label="Active customers"
          value={stats.active}
          icon={<FontAwesomeIcon icon={faCircleCheck} />}
          iconVariant="success"
          onClick={() => navigate(paths.app.customers.getHref())}
        />
        <StatCard
          label="In trial"
          value={stats.trial}
          icon={<FontAwesomeIcon icon={faHourglassHalf} />}
          iconVariant="warning"
        />
        <StatCard
          label="Churned"
          value={stats.churned}
          icon={<FontAwesomeIcon icon={faUserMinus} />}
          iconVariant="danger"
        />
      </div>

      <SummaryRow
        items={[
          { label: "Customers", value: stats.total },
          { label: "Paid seats", value: stats.seats.toLocaleString() },
          {
            label: "Avg. revenue / customer",
            value: currency(stats.mrr / Math.max(stats.active, 1)),
          },
          {
            label: "Trial conversion",
            value: (
              <Tooltip content="Share of trials that became paying customers">
                <span className="demo-underline">62%</span>
              </Tooltip>
            ),
          },
        ]}
      />
    </>
  );
};

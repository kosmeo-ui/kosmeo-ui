import Card from "../../layout/card";
import "./styles.css";

interface ListCardProps {
  listTitle: string;
  items: { label: string; value: React.ReactNode }[];
  headerActions?: React.ReactNode;
  footerButtons?: React.ReactNode;
}

const ListCard = (props: ListCardProps) => {
  return (
    <Card>
      {props.headerActions ? (
        <div className="va-list-card-header">
          <h3>{props.listTitle}</h3>
          <div className="va-list-card-header-actions">
            {props.headerActions}
          </div>
        </div>
      ) : (
        <h3>{props.listTitle}</h3>
      )}
      <dl className="va-list-card">
        {props.items.map((item, index) => (
          <div key={index}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>

      {props.footerButtons && (
        <div className="va-list-card-actions">{props.footerButtons}</div>
      )}
    </Card>
  );
};

export default ListCard;

import Badge from "../../feedback/badge";
import Card from "../../layout/card";
import Col from "../../layout/col";
import "./styles.css";

interface TagCardProps {
  title: string;
  tags: string[];
  color?: "primary" | "secondary";
  emptyText?: string;
}

const TagCard = (props: TagCardProps) => {
  const { color = "primary" } = props;
  return (
    <Card>
      <Col size="sm">
        <h3>{props.title}</h3>
        {props.tags.length ? (
          <ul className="va-tag-card-list">
            {props.tags.map((t) => (
              <Badge key={t} variant={color} size="md" pill>
                {t}
              </Badge>
            ))}
          </ul>
        ) : (
          props.emptyText && (
            <p className="va-tag-card-empty-text">{props.emptyText}</p>
          )
        )}
      </Col>
    </Card>
  );
};

export default TagCard;

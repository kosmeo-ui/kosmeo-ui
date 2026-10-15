"use client";

import Badge from "../../feedback/badge/index.js";
import Card from "../../layout/card/index.js";
import Col from "../../layout/col/index.js";
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
          <ul className="k-tag-card-list">
            {props.tags.map((t) => (
              <li key={t}>
                <Badge variant={color} size="md" pill>
                  {t}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          props.emptyText && (
            <p className="k-tag-card-empty-text">{props.emptyText}</p>
          )
        )}
      </Col>
    </Card>
  );
};

export default TagCard;

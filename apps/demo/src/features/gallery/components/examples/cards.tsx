import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { Button, Card, Centered } from "@kosmeo-ui/react";
import { toast } from "react-toastify";

export const Cards = () => (
  <div className="demo-card-grid">
    <Card header={{ title: "Plain card" }}>Body content.</Card>
    <Card
      hoverable
      onClick={() => toast("Card clicked")}
      header={{
        title: "Hoverable",
        actions: <FontAwesomeIcon icon={faBell} />,
      }}
    >
      Click me.
    </Card>
    <Card
      variant="primary"
      header={{ title: "With footer" }}
      footer={<Button size="sm">Action</Button>}
    >
      Primary variant.
    </Card>
    <Card padding="large" align="center">
      <Centered>Centered, large padding</Centered>
    </Card>
  </div>
);

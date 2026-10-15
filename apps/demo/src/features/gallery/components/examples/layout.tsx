import { Card, Centered, Col, Page, Row, Spinner } from "@kosmeo-ui/react";

export const Layout = () => (
  <>
    <Row justify="between" wrap>
      <Card>Row</Card>
      <Card>justify="between"</Card>
      <Card>wrap</Card>
    </Row>
    <Row size="lg" align="center">
      <Col size="sm">
        <Card>Col</Card>
        <Card>size="sm"</Card>
      </Col>
      <Col size="lg" divider="solid-top">
        <Card>Col</Card>
        <Card>divider="solid-top"</Card>
      </Col>
    </Row>
    <div className="demo-frame">
      <Page padded gap="sm" maxWidth="narrow">
        <Card>Page padded, gap="sm", maxWidth="narrow"</Card>
        <Card>Children stack with a gap</Card>
      </Page>
    </div>
    {/* No fixed height: a loading Page sets its own 12rem minimum. */}
    <div className="demo-frame">
      <Page loading />
    </div>
    <div className="demo-frame demo-frame-short">
      <Centered>
        <Spinner />
      </Centered>
    </div>
  </>
);

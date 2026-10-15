import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { paths } from "@/config/paths";
import { toast } from "react-toastify";
import {
  Alert,
  BorderedSection,
  Button,
  Checkbox,
  Col,
  DateTimeInput,
  FileDropZone,
  FormActions,
  FormGrid,
  LanguageSelect,
  Page,
  Switch,
  TimeInput,
} from "@kosmeo-ui/react";

export const GeneralSettings = ({
  accountOwnerField,
}: {
  /** Composed in by the route, since the picker belongs to another feature. */
  accountOwnerField?: ReactNode;
}) => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<string | null>("en");
  const [digest, setDigest] = useState(true);
  const [digestTime, setDigestTime] = useState<string | null>("08:30");
  const [mentions, setMentions] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [maintenance, setMaintenance] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState<File[]>([]);

  return (
    <Page gap="md" maxWidth="none">
      <BorderedSection as="h2" title="Preferences">
        <FormGrid columns={2}>
          <LanguageSelect
            label="Interface language"
            value={language}
            onChange={setLanguage}
          />
          {accountOwnerField}
          <DateTimeInput
            label="Next maintenance window"
            value={maintenance}
            onChange={setMaintenance}
            helperText="Shown to customers in a banner"
          />
        </FormGrid>
      </BorderedSection>

      <BorderedSection as="h2" title="Notifications">
        {/* The gap keeps the checkboxes' targets from touching (WCAG 2.5.8). */}
        <Col size="sm">
          <Switch
            label="Daily digest"
            checked={digest}
            onChange={(e) => setDigest(e.target.checked)}
          />
          {digest && (
            <TimeInput
              label="Send at"
              value={digestTime}
              onChange={setDigestTime}
            />
          )}
          <Checkbox
            label="Email me when I'm mentioned"
            labelLocation="right"
            checked={mentions}
            onChange={(e) => setMentions(e.target.checked)}
          />
          <Checkbox
            label="Product news and tips"
            labelLocation="right"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
          />
        </Col>
      </BorderedSection>

      <BorderedSection as="h2" title="Import customers">
        <FileDropZone
          label="Drop CSV files here, or click to browse"
          accept=".csv"
          maxFiles={3}
          onFilesSelected={(files) => {
            setImporting(true);
            setTimeout(() => {
              setImported(files);
              setImporting(false);
              toast.success(`Queued ${files.length} file(s) for import`);
            }, 900);
          }}
          onError={(msg) => toast.error(msg)}
        />
        {importing && (
          <Alert variant="primary" size="sm">
            Uploading…
          </Alert>
        )}
        {imported.length > 0 && (
          <Alert variant="success" size="sm">
            Queued: {imported.map((f) => f.name).join(", ")}
          </Alert>
        )}
      </BorderedSection>

      <FormActions>
        <Button
          variant="secondary"
          onClick={() => navigate(paths.app.dashboard.getHref())}
        >
          Cancel
        </Button>
        <Button onClick={() => toast.success("Settings saved")}>
          Save changes
        </Button>
      </FormActions>
    </Page>
  );
};

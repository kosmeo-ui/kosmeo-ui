"use client";

import { ReactNode } from "react";
import "./styles.css";

export interface TabItem {
  key: string;
  label: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  /** Render strip only — caller controls content placement. Defaults to false (component renders both). */
  stripOnly?: boolean;
}

const Tabs = ({ tabs, active, onChange, stripOnly }: TabsProps) => {
  const activeTab = tabs.find((t) => t.key === active);
  return (
    <div className="k-tabs">
      <div className="k-tabs-strip" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === active}
            disabled={t.disabled}
            className={`k-tabs-button${t.key === active ? " k-tabs-button-active" : ""}`}
            onClick={() => onChange(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {!stripOnly && activeTab?.content && (
        <div className="k-tabs-content" role="tabpanel">
          {activeTab.content}
        </div>
      )}
    </div>
  );
};

export default Tabs;

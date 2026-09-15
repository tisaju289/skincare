import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "./admin.settings";

export const Route = createFileRoute("/admin/design")({
  component: () => <SettingsPage scope="design" />,
});

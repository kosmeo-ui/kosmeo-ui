import { GALLERY_CATEGORIES } from "@/features/gallery/utils/categories";
import { MainErrorFallback } from "@/components/errors/main";
import { paths } from "@/config/paths";
import { Outlet } from "react-router";
import {
  DashboardLayout,
  type NavGroup,
} from "@/components/layouts/dashboard-layout";

export const ErrorBoundary = () => <MainErrorFallback />;

// The shared layout can't import features, so the app hands it the gallery's
// categories as a sidebar group.
const navGroups: NavGroup[] = [
  {
    label: "Component library",
    links: GALLERY_CATEGORIES.map((c) => ({
      label: c.title,
      href: paths.app.gallery.getHref(c.slug),
      icon: c.icon,
    })),
  },
];

const AppRoot = () => (
  <DashboardLayout navGroups={navGroups}>
    <Outlet />
  </DashboardLayout>
);

export default AppRoot;

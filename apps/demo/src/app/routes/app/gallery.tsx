import { ComponentGallery } from "@/features/gallery/components/component-gallery";
import { Page, SectionHeader } from "@kosmeo-ui/react";
import { Navigate, useParams } from "react-router";
import { paths } from "@/config/paths";
import {
  GALLERY_CATEGORIES,
  findGalleryCategory,
} from "@/features/gallery/utils/categories";

const GalleryRoute = () => {
  const category = findGalleryCategory(useParams().category);

  // `/components`, or an unknown category, lands on the first category.
  if (!category) {
    return (
      <Navigate
        to={paths.app.gallery.getHref(GALLERY_CATEGORIES[0].slug)}
        replace
      />
    );
  }

  return (
    <Page padded gap="md" maxWidth="wide">
      <SectionHeader
        as="h1"
        preface="Component gallery"
        title={category.title}
        subtitle={`${category.examples.length} example${category.examples.length === 1 ? "" : "s"}`}
      />
      <ComponentGallery key={category.slug} category={category} />
    </Page>
  );
};

export default GalleryRoute;

export const paths = {
  auth: {
    signIn: {
      path: "/sign-in",
      getHref: () => "/sign-in",
    },
  },

  app: {
    root: {
      path: "/",
      getHref: () => "/",
    },
    dashboard: {
      path: "",
      getHref: () => "/",
    },
    customers: {
      path: "customers",
      getHref: () => "/customers",
    },
    newCustomer: {
      path: "customers/new",
      getHref: () => "/customers/new",
    },
    customer: {
      path: "customers/:customerId",
      getHref: (id: string) => `/customers/${id}`,
    },
    settings: {
      path: "settings",
      getHref: () => "/settings",
    },
    gallery: {
      path: "components/:category?",
      getHref: (category?: string) =>
        category ? `/components/${category}` : "/components",
    },
  },
} as const;

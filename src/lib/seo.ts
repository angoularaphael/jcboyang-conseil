/** Données structurées schema.org — SEO + référencement local Toulouse. */
export const SITE_URL = "https://www.jcbo-conseil.com";

export function getSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["ProfessionalService", "LocalBusiness"],
        "@id": `${SITE_URL}/#organization`,
        name: "JCBO Conseil",
        alternateName: "JCBO-CONSEIL®",
        description:
          "Fondateur de JCBO-CONSEIL®. Consultant en Business Development & Transformation des Organisations à Toulouse. Conseil, formations et coaching pour dirigeants et PME/TPE.",
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo.png`,
        image: `${SITE_URL}/images/2022/IMG-20240503-WA0065.jpg`,
        telephone: "+33-6-15-63-09-38",
        email: "contact@jcbo-conseil.com",
        priceRange: "$$",
        founder: {
          "@type": "Person",
          name: "Jean-Christophe Boyang-Tsang",
          jobTitle: "Consultant en Business Development & Transformation des Organisations",
          description: "Fondateur de JCBO-CONSEIL®. Auteur du Guide du Pouvoir Transformationnel Personnel.",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "87 Rue Achille Viadieu",
          postalCode: "31400",
          addressLocality: "Toulouse",
          addressRegion: "Occitanie",
          addressCountry: "FR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 43.6047,
          longitude: 1.4442,
        },
        areaServed: [
          { "@type": "City", name: "Toulouse" },
          { "@type": "AdministrativeArea", name: "Occitanie" },
          { "@type": "Country", name: "France" },
        ],
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "18:00",
          },
        ],
        sameAs: [
          "https://www.facebook.com/profile.php?id=61553882894803",
          "https://www.linkedin.com/in/jean-christophe-boyang-tsang-business-b16a08a6/",
        ],
        knowsAbout: [
          "Business Development",
          "Transformation des Organisations",
          "Stratégie commerciale",
          "Formation vente",
          "Coaching dirigeant",
          "Mindset entrepreneurial",
          "Guide du Pouvoir Transformationnel Personnel",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "JCBO Conseil",
        inLanguage: "fr-FR",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

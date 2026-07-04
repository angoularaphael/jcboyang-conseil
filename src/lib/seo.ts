/** Données structurées schema.org — SEO + référencement. */
import { founderProfile } from "../data/founder-profile";

export const SITE_URL = "https://www.jcbo-conseil.com";

export function getSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#founder`,
        name: "Jean-Christophe Boyang-Tsang",
        jobTitle: founderProfile.line2,
        description: `${founderProfile.line1}. ${founderProfile.line3}`,
        url: `${SITE_URL}/a-propos`,
        image: `${SITE_URL}/images/2022/IMG-20240503-WA0065.jpg`,
        worksFor: { "@id": `${SITE_URL}/#organization` },
        knowsAbout: [
          "Business Development",
          "Transformation des Organisations",
          founderProfile.line3,
        ],
        sameAs: [
          "https://www.linkedin.com/in/jean-christophe-boyang-tsang-business-b16a08a6/",
        ],
      },
      {
        "@type": ["ProfessionalService", "LocalBusiness"],
        "@id": `${SITE_URL}/#organization`,
        name: "JCBO Conseil",
        alternateName: "JCBO-CONSEIL®",
        description: founderProfile.seoDescription,
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo.png`,
        image: `${SITE_URL}/images/2022/IMG-20240503-WA0065.jpg`,
        telephone: "+33-6-15-63-09-38",
        email: "contact@jcbo-conseil.com",
        priceRange: "$$",
        founder: { "@id": `${SITE_URL}/#founder` },
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
          founderProfile.line3,
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "JCBO Conseil",
        description: founderProfile.seoDescription,
        inLanguage: "fr-FR",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

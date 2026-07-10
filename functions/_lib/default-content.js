export const DEFAULT_CONTENT = {
  version: 1,
  site: {
    artistName: "Lamawary",
    instagramUrl: "https://www.instagram.com/lamawary_/",
    commissionsOpen: true,
    commissionStatus: {
      "pt-BR": "Encomendas abertas",
      en: "Commissions open"
    }
  },
  about: {
    image: "",
    positionX: 50,
    positionY: 50,
    "pt-BR": {
      role: "Artista visual",
      kicker: "Sobre mim",
      quote: "Crio personagens e criaturas",
      highlight: "com foco em expressão e design.",
      bio: "Trabalho com ilustração digital e tradicional, em projetos autorais e encomendas.",
      photoAlt: "Foto ou arte de perfil da artista"
    },
    en: {
      role: "Visual artist",
      kicker: "About me",
      quote: "I create characters and creatures",
      highlight: "with a focus on expression and design.",
      bio: "I work with digital and traditional illustration across original projects and commissions.",
      photoAlt: "Artist profile photo or artwork"
    }
  },
  gallery: [
    {
      id: "characters",
      image: "",
      positionX: 50,
      positionY: 50,
      "pt-BR": { title: "Personagens", subtitle: "Trabalho autoral", alt: "Ilustração de personagem" },
      en: { title: "Characters", subtitle: "Original work", alt: "Character illustration" }
    },
    {
      id: "creatures",
      image: "",
      positionX: 50,
      positionY: 50,
      "pt-BR": { title: "Criaturas", subtitle: "Estudos e projetos", alt: "Ilustração de criatura" },
      en: { title: "Creatures", subtitle: "Studies and projects", alt: "Creature illustration" }
    },
    {
      id: "commissions",
      image: "",
      positionX: 50,
      positionY: 50,
      "pt-BR": { title: "Encomendas", subtitle: "Projetos personalizados", alt: "Arte feita sob encomenda" },
      en: { title: "Commissions", subtitle: "Custom projects", alt: "Commissioned artwork" }
    }
  ]
};

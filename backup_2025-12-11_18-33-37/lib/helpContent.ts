export interface HelpCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  category: string;
  content: {
    main: string;
    steps?: { title: string; desc: string }[];
    tips?: string[];
    warnings?: string[];
  };
}

export const helpContent: Record<string, HelpCard[]> = {
  dashboard: [
    {
      id: "quick-start",
      title: "Brzi početak",
      description: "Prvi koraci u korišćenju aplikacije",
      icon: "Rocket",
      color: "#C339B5",
      gradient: "from-[#D84CC8] to-[#AB2A9E]",
      category: "Početak",
      content: {
        main: "Domaćin je aplikacija za praćenje ličnih finansija. Omogućava jednostavno evidentiranje troškova i prihoda, automatsko skeniranje računa pomoću AI tehnologije, deljenje troškova kroz grupe, postavljanje budžeta i detaljnu analizu.",
        steps: [
          { title: "Dodajte prvi trošak", desc: "Kliknite na + dugme u donjem desnom uglu → Dodaj Trošak → Unesite iznos, opis i kategoriju" },
          { title: "Koristite OCR", desc: "Upload-ujte račun i OCR će automatski skenirati podatke" },
          { title: "Pratite statistike", desc: "Dashboard prikazuje troškove, prihode i bilans" }
        ],
        tips: [
          "OCR ima tačnost ~86%, uvek proverite podatke",
          "Redovno unosite troškove istog dana",
          "Koristite kategorije za lakšu analizu"
        ]
      }
    }
  ],
  
  groups: [
    {
      id: "create-group",
      title: "Kreiranje grupe",
      description: "Deljenje troškova sa drugima",
      icon: "UsersThree",
      color: "#4EC8E4",
      gradient: "from-[#5DD3EE] to-[#3DABC7]",
      category: "Grupe",
      content: {
        main: "Grupe omogućavaju automatsku podelu troškova između članova. Sistem računa ko kome duguje.",
        steps: [
          { title: "Nova grupa", desc: "Stranica Grupe → + Nova Grupa → Unesite naziv" },
          { title: "Pozovite članove", desc: "Kopirajte share link i pošaljite" },
          { title: "Dodajte troškove", desc: "Izaberite grupu pri dodavanju troška" }
        ],
        tips: [
          "Share link nikada ne ističe",
          "Samo admin može obrisati grupu",
          "Poravnanja se ažuriraju automatski"
        ]
      }
    },
    {
      id: "split-expenses",
      title: "Deljenje troškova",
      description: "Automatski izračun dugovanja",
      icon: "CurrencyCircleDollar",
      color: "#E6C14A",
      gradient: "from-[#F0CF5C] to-[#D4AD32]",
      category: "Grupe",
      content: {
        main: "Kada dodate trošak u grupu, sistem automatski deli iznos i računa dugove.",
        steps: [
          { title: "Dodaj grupni trošak", desc: "Izaberite grupu pri dodavanju troška" },
          { title: "Sistem deli", desc: "Iznos se deli na sve članove" },
          { title: "Prati dugove", desc: "Vidi ko kome duguje u Poravnanja sekciji" }
        ]
      }
    }
  ],
  
  expenses: [
    {
      id: "add-expense",
      title: "Dodavanje troška",
      description: "Evidentiranje troškova",
      icon: "Receipt",
      color: "#C339B5",
      gradient: "from-[#D84CC8] to-[#AB2A9E]",
      category: "Troškovi",
      content: {
        main: "Dva načina: OCR skeniranje računa ili ručno unošenje.",
        steps: [
          { title: "Klik + dugme", desc: "Floating button donje desno" },
          { title: "Dodaj Trošak", desc: "Izaberite opciju za dodavanje troška" },
          { title: "Unesite podatke", desc: "Iznos, opis, kategorija, datum" }
        ],
        tips: [
          "Koristite OCR za brzo dodavanje",
          "Izaberite odgovarajuću kategoriju",
          "Dodajte račun kao dokaz"
        ]
      }
    },
    {
      id: "edit-expense",
      title: "Izmena troška",
      description: "Promena postojećeg troška",
      icon: "PencilSimple",
      color: "#8A63D2",
      gradient: "from-[#9B7DE6] to-[#7555B8]",
      category: "Troškovi",
      content: {
        main: "Možete izmeniti sve podatke o trošku: iznos, datum, kategoriju, opis.",
        steps: [
          { title: "Pronađi trošak", desc: "U listi troškova" },
          { title: "Klik Edit", desc: "Pencil ikona pored troška" },
          { title: "Izmeni", desc: "Promenite podatke i sačuvajte" }
        ]
      }
    }
  ],
  
  incomes: [
    {
      id: "add-income",
      title: "Dodavanje prihoda",
      description: "Evidentiranje prihoda",
      icon: "TrendUp",
      color: "#1FBFA4",
      gradient: "from-[#2ED1B6] to-[#12A88E]",
      category: "Prihodi",
      content: {
        main: "Pratite sve izvore prihoda: plata, freelance, prodaja, investicije.",
        steps: [
          { title: "+ dugme", desc: "Kliknite na floating button" },
          { title: "Dodaj Prihod", desc: "Izaberite opciju za prihod" },
          { title: "Unesite podatke", desc: "Iznos, izvor, kategorija" }
        ],
        tips: [
          "Postavite platu kao ponavljajući prihod",
          "Koristite kategorije za različite izvore",
          "Pratite mesečni trend prihoda"
        ]
      }
    },
    {
      id: "income-categories",
      title: "Kategorije prihoda",
      description: "Organizacija izvora prihoda",
      icon: "TagSimple",
      color: "#4EC8E4",
      gradient: "from-[#5DD3EE] to-[#3DABC7]",
      category: "Prihodi",
      content: {
        main: "Kreirajte kategorije za različite izvore: plata, freelance, investicije.",
        steps: [
          { title: "Otvori kategorije", desc: "Dashboard → Brzi pristup → Tag ikona" },
          { title: "Nova kategorija", desc: "+ Nova kategorija prihoda" },
          { title: "Dodeli", desc: "Koristite pri dodavanju prihoda" }
        ]
      }
    }
  ],
  
  categories: [
    {
      id: "manage-categories",
      title: "Upravljanje kategorijama",
      description: "Organizacija troškova",
      icon: "Tag",
      color: "#8A63D2",
      gradient: "from-[#9B7DE6] to-[#7555B8]",
      category: "Kategorije",
      content: {
        main: "Kategorije pomažu da organizujete i analizirate troškove.",
        steps: [
          { title: "Klik Kategorije", desc: "U brzi pristup meniju" },
          { title: "Dodaj novu", desc: "+ Nova kategorija" },
          { title: "Personalizuj", desc: "Izaberite ikonu i boju" }
        ],
        tips: [
          "Ne pravite previše kategorija (8-12 je dovoljno)",
          "Koristite jasne nazive",
          "Različite boje za lakše razlikovanje"
        ]
      }
    },
    {
      id: "category-icons",
      title: "Ikone kategorija",
      description: "Vizuelna identifikacija",
      icon: "Palette",
      color: "#E6C14A",
      gradient: "from-[#F0CF5C] to-[#D4AD32]",
      category: "Kategorije",
      content: {
        main: "Svaka kategorija ima ikonu i boju za lakšu identifikaciju.",
        steps: [
          { title: "Izaberi ikonu", desc: "30+ Phosphor ikona dostupno" },
          { title: "Odaberi boju", desc: "Color picker sa preview" },
          { title: "Sačuvaj", desc: "Ikona se prikazuje svuda" }
        ]
      }
    }
  ],
  
  statistics: [
    {
      id: "read-charts",
      title: "Čitanje grafikona",
      description: "Razumevanje statistika",
      icon: "ChartLine",
      color: "#4EC8E4",
      gradient: "from-[#5DD3EE] to-[#3DABC7]",
      category: "Statistika",
      content: {
        main: "Grafikoni prikazuju trendove troškova i prihoda kroz vreme.",
        steps: [
          { title: "Line chart", desc: "Trend kroz mesece" },
          { title: "Pie chart", desc: "Raspodela po kategorijama" },
          { title: "Bar chart", desc: "Poređenje meseci" }
        ],
        tips: [
          "Hover preko grafikona za detalje",
          "Klik na legend za hide/show",
          "Export PDF za izveštaje"
        ]
      }
    },
    {
      id: "export-reports",
      title: "Export izveštaja",
      description: "PDF izveštaji",
      icon: "FilePdf",
      color: "#E6C14A",
      gradient: "from-[#F0CF5C] to-[#D4AD32]",
      category: "Statistika",
      content: {
        main: "Generiši PDF izveštaje sa grafikonima i statistikama.",
        steps: [
          { title: "Otvori Statistike", desc: "Iz brzi pristup menija" },
          { title: "Izaberi period", desc: "Mesec, kvartal, godina" },
          { title: "Export PDF", desc: "Automatski download" }
        ]
      }
    }
  ],
  
  profile: [
    {
      id: "profile-settings",
      title: "Podešavanja profila",
      description: "Personalizacija naloga",
      icon: "UserCircle",
      color: "#E6C14A",
      gradient: "from-[#F0CF5C] to-[#D4AD32]",
      category: "Profil",
      content: {
        main: "Izmeni lične podatke, podesi notifikacije i preferencije.",
        steps: [
          { title: "Otvori profil", desc: "Klik na avatar" },
          { title: "Izmeni podatke", desc: "Ime, email, slika" },
          { title: "Sačuvaj", desc: "Izmene se primenjuju odmah" }
        ],
        tips: [
          "Redovno ažurirajte email",
          "Postavite profilnu sliku",
          "Omogućite notifikacije"
        ]
      }
    },
    {
      id: "notifications",
      title: "Notifikacije",
      description: "Podsećanja i upozorenja",
      icon: "Bell",
      color: "#8A63D2",
      gradient: "from-[#9B7DE6] to-[#7555B8]",
      category: "Profil",
      content: {
        main: "Omogući notifikacije za ponavljajuće troškove i mesečne izveštaje.",
        steps: [
          { title: "Podešavanja", desc: "Profil → Notifikacije" },
          { title: "Omogući tipove", desc: "Ponavljajući, grupe, izveštaji" },
          { title: "Postavi vreme", desc: "Kada želiš da dobijaš" }
        ]
      }
    }
  ],
  
  budgets: [
    {
      id: "what-are-budgets",
      title: "Šta su budžeti?",
      description: "Kontrola mesečnih troškova",
      icon: "ChartBar",
      color: "#4EC8E4",
      gradient: "from-[#5DD3EE] to-[#3DABC7]",
      category: "Budžeti",
      content: {
        main: "Budžeti omogućavaju postavljanje limita potrošnje po kategorijama.",
        steps: [
          { title: "Odaberi kategoriju", desc: "Hrana, Transport, Zabava..." },
          { title: "Postavi limit", desc: "Mesečni maksimum" },
          { title: "Prati progress", desc: "Vidi koliko si potrošio" }
        ],
        tips: [
          "Počni sa realnim ciljevima",
          "Prati koje kategorije prelaziš",
          "Budžeti se resetuju svakog 1. u mesecu"
        ],
        warnings: [
          "Budžeti ne blokiraju dodavanje troškova",
          "Samo prate i upozoravaju"
        ]
      }
    },
    {
      id: "create-budget",
      title: "Kreiranje budžeta",
      description: "Postavljanje limita",
      icon: "Plus",
      color: "#8A63D2",
      gradient: "from-[#9B7DE6] to-[#7555B8]",
      category: "Budžeti",
      content: {
        main: "Kreiraj budžet za bilo koju kategoriju da kontrolišeš potrošnju.",
        steps: [
          { title: "+Novi Budžet", desc: "Gornji desni ugao" },
          { title: "Izaberi kategoriju", desc: "Dropdown lista" },
          { title: "Unesi limit", desc: "Maksimalan iznos" }
        ],
        tips: [
          "Jedan budžet po kategoriji",
          "Progress bar pokazuje napredak",
          "Boje: Zeleno < 80%, Žuto 80-100%, Crveno > 100%"
        ]
      }
    },
    {
      id: "budget-alerts",
      title: "Upozorenja",
      description: "Kada te aplikacija upozorava",
      icon: "Warning",
      color: "#E4586E",
      gradient: "from-[#E4586E] to-[#C44569]",
      category: "Budžeti",
      content: {
        main: "Aplikacija upozorava kada se približavaš ili prelaziš budžet.",
        steps: [
          { title: "80% limita", desc: "Žuto upozorenje" },
          { title: "90% limita", desc: "Narandžasto" },
          { title: "100% limita", desc: "Crveno - prekoračio si" }
        ],
        tips: [
          "Notifikacije za 80% i 100%",
          "Dashboard prikazuje status",
          "Možeš ignorisati upozorenja"
        ]
      }
    }
  ]
};

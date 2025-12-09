"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Question, X, Sparkle, MagnifyingGlass, Lightning, Rocket,
  Receipt, TrendUp, Users, Tag, ChartLine, Gear, BookOpen,
  Play, CheckCircle, Warning, Info, CaretRight, ArrowRight,
  PencilSimple, Funnel, FilePdf, Repeat, Lightbulb, CheckSquare
} from "@phosphor-icons/react";

interface HelpCard {
  id: string;
  title: string;
  description: string;
  icon: any;
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

interface ModernHelpModalProps {
  page: "dashboard" | "expenses" | "incomes" | "groups" | "categories" | "statistics" | "profile";
  isOpen: boolean;
  onClose: () => void;
}

const helpCards: Record<string, HelpCard[]> = {
  dashboard: [
    {
      id: "quick-start",
      title: "Brzi početak",
      description: "Osnovni koraci za efikasno korišćenje aplikacije",
      icon: Rocket,
      color: "#C339B5",
      gradient: "from-[#D84CC8] to-[#AB2A9E]",
      category: "Početak",
      content: {
        main: "Domaćin omogućava jednostavno praćenje troškova i prihoda. Počnite dodavanjem prvog troška ili prihoda.",
        steps: [
          { title: "Dodajte trošak", desc: "Kliknite na + dugme i izaberite 'Dodaj Trošak'" },
          { title: "Uploadujte račun", desc: "OCR automatski skenira i popunjava podatke" },
          { title: "Pregledajte statistike", desc: "Pratite svoj bilans i trendove na dashboardu" }
        ],
        tips: [
          "Koristite OCR za brzo dodavanje računa - tačnost 86%!",
          "Kategorije pomažu da vidite gde najviše trošite",
          "Postavite ponavljajuće troškove za automatske podsetnike"
        ]
      }
    },
    {
      id: "ocr-magic",
      title: "OCR skeniranje računa",
      description: "AI skenira vaše račune i automatski popunjava podatke",
      icon: Sparkle,
      color: "#8A63D2",
      gradient: "from-[#9B7DE6] to-[#7555B8]",
      category: "Tehnologija",
      content: {
        main: "OCR (Optical Character Recognition) koristi AI da automatski prepozna tekst sa slika računa. Tesseract engine sa podrškom za srpski i ćirilicu.",
        steps: [
          { title: "Upload sliku/PDF", desc: "Prevucite fajl ili kliknite za upload" },
          { title: "AI skenira dokument", desc: "Prepoznaje iznos, datum, kategoriju" },
          { title: "Proverite podatke", desc: "Korigujte ako je potrebno" },
          { title: "Sačuvajte trošak", desc: "Automatski se dodaje u vašu listu" }
        ],
        tips: [
          "Najbolji rezultati: dobro osvetljene, ravne slike",
          "Prepoznaje 30+ tipova računa (EPS, BVK, Telekom...)",
          "Podržani formati: PNG, JPG, JPEG, PDF (do 10MB)"
        ],
        warnings: [
          "Uvek proverite očitane podatke pre čuvanja",
          "Ne radi sa ručno pisanim računima"
        ]
      }
    },
    {
      id: "dashboard-stats",
      title: "Statistike i kartice",
      description: "Razumevanje finansijskih metrika na dashboardu",
      icon: ChartLine,
      color: "#1FBFA4",
      gradient: "from-[#2ED1B6] to-[#12A88E]",
      category: "Dashboard",
      content: {
        main: "Dashboard prikazuje tri glavne metrike: Ukupni troškovi, Ukupni prihodi i Bilans. Svaka kartica ima mesečni pregled.",
        steps: [
          { title: "Troškovi (magenta)", desc: "Ukupan iznos svih troškova" },
          { title: "Prihodi (teal)", desc: "Ukupan iznos svih prihoda" },
          { title: "Bilans (cyan)", desc: "Prihodi - Troškovi = Bilans" }
        ],
        tips: [
          "Pozitivan bilans (zeleno) = Štednja",
          "Negativan bilans (crveno) = Defisit",
          "Mesečni badge pokazuje samo trenutni mesec"
        ]
      }
    },
    {
      id: "quick-actions",
      title: "Brzi pristup & navigacija",
      description: "Ikone za brz pristup najvažnijim funkcijama",
      icon: Lightning,
      color: "#E6C14A",
      gradient: "from-[#F0CF5C] to-[#D4AD32]",
      category: "Dashboard",
      content: {
        main: "Sekcija 'Brzi pristup' sadrži 4 glavne ikone za navigaciju ka najvažnijim delovima aplikacije.",
        steps: [
          { title: "Statistike (ChartLine)", desc: "Detaljni grafikoni troškova i prihoda" },
          { title: "Grupe (Users)", desc: "Podela troškova sa drugima" },
          { title: "Kategorije (Tag)", desc: "Upravljanje kategorijama" },
          { title: "Podešavanja (Gear)", desc: "Profil i opcije" }
        ],
        tips: [
          "Ikone su responsive - menjaju boju na hover",
          "Svaka ikona ima tooltip sa nazivom",
          "Keyboard shortcuts: 'S' za statistike, 'G' za grupe"
        ]
      }
    },
    {
      id: "recurring-expenses",
      title: "Ponavljajući troškovi",
      description: "Automatski podsećaji za mesečne račune",
      icon: Repeat,
      color: "#8A63D2",
      gradient: "from-[#9B7DE6] to-[#7555B8]",
      category: "Tehnologija",
      content: {
        main: "Postavi troškove koji se ponavljaju svaki mesec - aplikacija će te automatski podsetiti.",
        steps: [
          { title: "Dodaj trošak", desc: "Normalno dodaj trošak kao i inače" },
          { title: "Omogući 'Ponavljajući'", desc: "Klikni na checkbox 'Ponavljajući trošak'" },
          { title: "Postavi datum", desc: "Izaberi dan u mesecu za podsećanje" },
          { title: "Primi notifikaciju", desc: "Svaki mesec dobijaš push notifikaciju" }
        ],
        tips: [
          "Idealno za račune: struja, voda, internet, kirija",
          "Možeš dodati note za specifične detalje",
          "Notifikacije dolaze 1 dan pre roka plaćanja"
        ],
        warnings: [
          "Ne kreira automatski troškove - samo te podseća"
        ]
      }
    }
  ],
  groups: [
    {
      id: "create-group",
      title: "Kreiranje grupe",
      description: "Podeli troškove sa cimerom, porodicom ili prijateljima",
      icon: Users,
      color: "#4EC8E4",
      gradient: "from-[#5DD3EE] to-[#3DABC7]",
      category: "Grupe",
      content: {
        main: "Grupe omogućavaju automatsku podelu troškova između članova. Sistem računa ko kome duguje.",
        steps: [
          { title: "Kliknite '+ Nova Grupa'", desc: "Na stranici Grupe, gornji desni ugao" },
          { title: "Unesite naziv", desc: "npr. 'Stan', 'Porodica', 'Putovanje'" },
          { title: "Pozovite članove", desc: "Kopirajte i pošaljite share link" },
          { title: "Dodajte troškove", desc: "Izaberite grupu pri dodavanju troška" }
        ],
        tips: [
          "Neograničen broj grupa i članova",
          "Share link nikada ne ističe",
          "Samo admin može obrisati grupu"
        ]
      }
    },
    {
      id: "split-expenses",
      title: "Deljenje troškova",
      description: "Automatski izračun ko kome duguje",
      icon: Receipt,
      color: "#E6C14A",
      gradient: "from-[#F0CF5C] to-[#D4AD32]",
      category: "Grupe",
      content: {
        main: "Kada dodate trošak u grupu, sistem automatski deli iznos i računa dugove između članova.",
        steps: [
          { title: "Dodaj trošak", desc: "Izaberi grupu pri dodavanju" },
          { title: "Sistem deli", desc: "Iznos ÷ broj članova" },
          { title: "Prati dugove", desc: "Vidi ko kome duguje u 'Poravnanja'" }
        ],
        tips: [
          "Podela je uvek jednaka između svih članova",
          "Možete označiti trošak kao 'Plaćen' kada se izmiri",
          "Poravnanja se ažuriraju u realnom vremenu"
        ]
      }
    },
    {
      id: "group-settlements",
      title: "Poravnanja i dugovanja",
      description: "Ko kome duguje koliko",
      icon: ChartLine,
      color: "#8A63D2",
      gradient: "from-[#9B7DE6] to-[#7555B8]",
      category: "Grupe",
      content: {
        main: "Sistem automatski računa ko kome duguje na osnovu svih troškova u grupi.",
        steps: [
          { title: "Otvori grupu", desc: "Klik na grupu iz liste" },
          { title: "Scroll do 'Poravnanja'", desc: "Sekcija na dnu" },
          { title: "Vidi dugove", desc: "Ko kome i koliko" },
          { title: "Označi kao plaćeno", desc: "Kada se izmiri dug" }
        ],
        tips: [
          "Zeleno = duguješ",
          "Crveno = neko tebi duguje",
          "Nula = sve poravnato",
          "Istorija svih transakcija dostupna"
        ]
      }
    },
    {
      id: "group-roles",
      title: "Uloge u grupi: Admin i Članovi",
      description: "Razlike između owner-a i običnih članova",
      icon: Users,
      color: "#C339B5",
      gradient: "from-[#D84CC8] to-[#AB2A9E]",
      category: "Grupe",
      content: {
        main: "Kreator grupe je automatski admin sa dodatnim permisijama.",
        steps: [
          { title: "Admin permisije", desc: "Brisanje grupe, izmena naziva" },
          { title: "Član permisije", desc: "Dodavanje troškova, vidi sve" },
          { title: "Owner badge", desc: "Žuti badge pored imena" }
        ],
        tips: [
          "Admin ne može biti uklonjen iz grupe",
          "Članovi mogu sami napustiti grupu",
          "Brisanje grupe briše SVE podatke"
        ],
        warnings: [
          "Samo admin može obrisati grupu",
          "Brisanje je nepovratno!"
        ]
      }
    },
    {
      id: "group-charts",
      title: "Grupne statistike",
      description: "Detaljni grafikoni troškova grupe",
      icon: ChartLine,
      color: "#1FBFA4",
      gradient: "from-[#2ED1B6] to-[#12A88E]",
      category: "Grupe",
      content: {
        main: "Svaka grupa ima svoje statistike: Line chart trendova, Pie chart kategorija, YoY/MoM poređenja.",
        steps: [
          { title: "Otvori grupu", desc: "Klik na grupu" },
          { title: "Scroll do grafikona", desc: "Ispod članova" },
          { title: "Analiziraj trendove", desc: "Vidi gde najviše trošite" }
        ],
        tips: [
          "Poređenje sa prošlim mesecom/godinom",
          "Vidi ko najviše troši",
          "Optimizuj grupne troškove"
        ]
      }
    }
  ],
  expenses: [
    {
      id: "add-expense",
      title: "Dodavanje troška",
      description: "Brzo i jednostavno evidentiranje troškova",
      icon: Receipt,
      color: "#C339B5",
      gradient: "from-[#D84CC8] to-[#AB2A9E]",
      category: "Troškovi",
      content: {
        main: "Dva načina: OCR skeniranje računa ili ručno unošenje. OCR je brži i automatski popunjava sve.",
        steps: [
          { title: "Klik na + dugme", desc: "Donje desno dugme na ekranu" },
          { title: "Izaberi 'Dodaj Trošak'", desc: "Otvara se modal za unos" },
          { title: "Upload račun ili unesi ručno", desc: "OCR prepoznaje podatke" },
          { title: "Sačuvaj", desc: "Trošak se dodaje u listu" }
        ]
      }
    },
    {
      id: "edit-expense",
      title: "Izmena troška",
      description: "Kako promeniti postojeći trošak",
      icon: PencilSimple,
      color: "#8A63D2",
      gradient: "from-[#9B7DE6] to-[#7555B8]",
      category: "Troškovi",
      content: {
        main: "Možete izmeniti sve podatke o trošku: iznos, datum, kategoriju, opis.",
        steps: [
          { title: "Pronađi trošak", desc: "U listi troškova" },
          { title: "Klik na 'Edit' ikonu", desc: "Pencil ikona pored troška" },
          { title: "Izmeni podatke", desc: "Promeni šta god trebaš" },
          { title: "Sačuvaj izmene", desc: "Klik na 'Ažuriraj'" }
        ],
        tips: [
          "Izmene se čuvaju odmah",
          "Možeš promeniti i kategoriju",
          "Ne možeš izmeniti OCR skeniran račun - samo podatke"
        ]
      }
    },
    {
      id: "expense-filters",
      title: "Filteri i pretraga",
      description: "Brzo pronalaženje troškova",
      icon: Funnel,
      color: "#4EC8E4",
      gradient: "from-[#5DD3EE] to-[#3DABC7]",
      category: "Troškovi",
      content: {
        main: "Filtriraj troškove po kategoriji, datumu, iznosu za brzu analizu.",
        steps: [
          { title: "Otvori filter", desc: "Klik na Funnel ikonu" },
          { title: "Izaberi kriterijume", desc: "Kategorija, datum range, iznos" },
          { title: "Primeni", desc: "Vidi filtrirane rezultate" },
          { title: "Resetuj", desc: "Vrati se na sve troškove" }
        ],
        tips: [
          "Možeš kombinovati više filtera",
          "Datum range za mesečne preglede",
          "Iznos filter za velike troškove"
        ]
      }
    },
    {
      id: "export-expenses",
      title: "Export u PDF",
      description: "Kreiraj izveštaj troškova za period",
      icon: FilePdf,
      color: "#E6C14A",
      gradient: "from-[#F0CF5C] to-[#D4AD32]",
      category: "Troškovi",
      content: {
        main: "Generiši profesionalni PDF izveštaj sa tabelom troškova, grafikonima i statistikama.",
        steps: [
          { title: "Izaberi period", desc: "Postavi datum range" },
          { title: "Klik na 'Export PDF'", desc: "Download ikona" },
          { title: "PDF se generiše", desc: "Automatski download" }
        ],
        tips: [
          "PDF sadrži grafikone po kategorijama",
          "Ukupni iznosi su na vrhu",
          "Idealno za book keeping"
        ]
      }
    }
  ],
  incomes: [
    {
      id: "add-income",
      title: "Dodavanje prihoda",
      description: "Evidentiraj plate, freelance, nagrade...",
      icon: TrendUp,
      color: "#1FBFA4",
      gradient: "from-[#2ED1B6] to-[#12A88E]",
      category: "Prihodi",
      content: {
        main: "Prati sve izvore prihoda: plata, freelance, nagrade, bonusi. Ručno unošenje ili OCR.",
        steps: [
          { title: "Klik na + dugme", desc: "Donje desno" },
          { title: "Izaberi 'Dodaj Prihod'", desc: "Modal za unos" },
          { title: "Unesi podatke", desc: "Iznos, datum, kategorija" },
          { title: "Sačuvaj", desc: "Prihod se dodaje" }
        ]
      }
    },
    {
      id: "income-categories",
      title: "Kategorije prihoda",
      description: "Organizuj izvore zarade",
      icon: Tag,
      color: "#4EC8E4",
      gradient: "from-[#5DD3EE] to-[#3DABC7]",
      category: "Prihodi",
      content: {
        main: "Kreiraj kategorije za različite izvore prihoda: plata, freelance, investicije, pasivni prihod.",
        steps: [
          { title: "Otvori kategorije", desc: "Iz brzi pristup menija" },
          { title: "Nova kategorija", desc: "+ Nova Kategorija Prihoda" },
          { title: "Unesi naziv i ikonu", desc: "npr. 'Freelance' sa Lightning" },
          { title: "Dodeli prihodima", desc: "Koristi pri dodavanju" }
        ],
        tips: [
          "Razdvoji glavne i dodatne prihode",
          "Vidi koji izvor najviše donosi",
          "Optimizuj vreme za najbolje kategorije"
        ]
      }
    },
    {
      id: "recurring-income",
      title: "Ponavljajući prihodi",
      description: "Plata i redovni mesečni prihodi",
      icon: Repeat,
      color: "#8A63D2",
      gradient: "from-[#9B7DE6] to-[#7555B8]",
      category: "Prihodi",
      content: {
        main: "Postavi platu i druge redovne prihode kao ponavljajuće - automatski se dodaju svaki mesec.",
        steps: [
          { title: "Dodaj prihod", desc: "Normalno kao i obično" },
          { title: "Omogući 'Ponavljajući'", desc: "Checkbox u modalu" },
          { title: "Postavi datum isplate", desc: "Dan u mesecu kada stiže" },
          { title: "Automatski unos", desc: "Svaki mesec se kreira novi" }
        ],
        tips: [
          "Idealno za platu, kiriju, pasivni prihod",
          "Možeš dodati različite izvore",
          "Svaki mesec možeš ručno korigovati iznos"
        ]
      }
    }
  ],
  categories: [
    {
      id: "manage-categories",
      title: "Upravljanje kategorijama",
      description: "Organizuj troškove po kategorijama",
      icon: Tag,
      color: "#8A63D2",
      gradient: "from-[#9B7DE6] to-[#7555B8]",
      category: "Kategorije",
      content: {
        main: "Kategorije pomažu da organizuješ i analiziraš troškove. Možeš kreirati custom kategorije.",
        steps: [
          { title: "Klik na 'Kategorije'", desc: "U brzi pristup meniju" },
          { title: "Dodaj novu", desc: "Klik na '+ Nova Kategorija'" },
          { title: "Izaberi ikonu i boju", desc: "Personalizuj kategoriju" },
          { title: "Dodeli troškovima", desc: "Koristi pri dodavanju troška" }
        ]
      }
    },
    {
      id: "category-icons",
      title: "Ikone i boje kategorija",
      description: "Vizuelna identifikacija kategorija",
      icon: Sparkle,
      color: "#E6C14A",
      gradient: "from-[#F0CF5C] to-[#D4AD32]",
      category: "Kategorije",
      content: {
        main: "Svaka kategorija ima svoju ikonu i boju za lakšu vizuelnu identifikaciju.",
        steps: [
          { title: "Izaberi ikonu", desc: "30+ Phosphor ikona dostupno" },
          { title: "Odaberi boju", desc: "Color picker sa preview" },
          { title: "Vidi u listama", desc: "Ikona se prikazuje svuda" }
        ],
        tips: [
          "Koristi različite boje za bolje razlikovanje",
          "Hrana → Hamburger, Transport → Car, itd.",
          "Konzistentne ikone pomažu navigaciju"
        ]
      }
    },
    {
      id: "default-categories",
      title: "Predefinisane kategorije",
      description: "Sistem kategorija za brzo pokretanje",
      icon: CheckCircle,
      color: "#1FBFA4",
      gradient: "from-[#2ED1B6] to-[#12A88E]",
      category: "Kategorije",
      content: {
        main: "Aplikacija dolazi sa osnovnim kategorijama: Hrana, Transport, Stan, Zabava, Računi...",
        tips: [
          "Možeš izmeniti sve predefinisane kategorije",
          "Dodaj svoje specifične potrebe",
          "Ne možeš obrisati kategoriju ako ima troškove"
        ],
        warnings: [
          "Brisanje kategorije briše sve vezane troškove!"
        ]
      }
    }
  ],
  statistics: [
    {
      id: "read-charts",
      title: "Čitanje grafikona",
      description: "Razumevanje statistika i trendova",
      icon: ChartLine,
      color: "#4EC8E4",
      gradient: "from-[#5DD3EE] to-[#3DABC7]",
      category: "Statistika",
      content: {
        main: "Grafikoni prikazuju trendove troškova i prihoda kroz vreme. Tri tipa: Line, Pie i Bar.",
        steps: [
          { title: "Line chart", desc: "Trend kroz mesece" },
          { title: "Pie chart", desc: "Raspodela po kategorijama" },
          { title: "Bar chart", desc: "Poređenje meseci" }
        ],
        tips: [
          "Hover preko grafikona za detalje",
          "Klik na legend za hide/show linija",
          "Export PDF za mesečne izveštaje"
        ]
      }
    },
    {
      id: "line-charts",
      title: "Line Chart - Mesečni trendovi",
      description: "Prati promene kroz vreme",
      icon: TrendUp,
      color: "#1FBFA4",
      gradient: "from-[#2ED1B6] to-[#12A88E]",
      category: "Statistika",
      content: {
        main: "Line chart prikazuje trendove troškova i prihoda kroz poslednih 6-12 meseci.",
        steps: [
          { title: "Magenta linija", desc: "Troškovi kroz mesece" },
          { title: "Teal linija", desc: "Prihodi kroz mesece" },
          { title: "Hover za detalje", desc: "Vidi tačan iznos za mesec" }
        ],
        tips: [
          "Rastući trend troškova = potrebna kontrola",
          "Rastući trend prihoda = rast zarade",
          "Uporedi sa prošlom godinom"
        ]
      }
    },
    {
      id: "pie-charts",
      title: "Pie Chart - Raspodela po kategorijama",
      description: "Vidi gde najviše trošiš",
      icon: ChartLine,
      color: "#C339B5",
      gradient: "from-[#D84CC8] to-[#AB2A9E]",
      category: "Statistika",
      content: {
        main: "Pie chart prikazuje procenat troškova po kategorijama - najbolje za analizu potrošnje.",
        steps: [
          { title: "Najveći sektor", desc: "Kategorija sa najviše troškova" },
          { title: "Boje kategorija", desc: "Svaka kategorija ima svoju boju" },
          { title: "Procenti", desc: "Tačan procenat od ukupnog" }
        ],
        tips: [
          "Velika hrana kategorija? Vreme za meal prep",
          "Veliki računi? Provjeri tarife",
          "Balansirana raspodela = dobro planiranje"
        ]
      }
    },
    {
      id: "export-reports",
      title: "Export statistika u PDF",
      description: "Profesionalni mesečni izveštaji",
      icon: FilePdf,
      color: "#E6C14A",
      gradient: "from-[#F0CF5C] to-[#D4AD32]",
      category: "Statistika",
      content: {
        main: "Generiši kompletne PDF izveštaje sa svim grafikonima i statistikama.",
        steps: [
          { title: "Otvori Statistike", desc: "Iz brzi pristup menija" },
          { title: "Izaberi period", desc: "Mesec, kvartal, godina" },
          { title: "Klik 'Export PDF'", desc: "Automatski download" }
        ],
        tips: [
          "Idealno za book keeping",
          "Podeli sa accountant-om",
          "Arhiviraj za buduće poređenje"
        ]
      }
    }
  ],
  profile: [
    {
      id: "profile-settings",
      title: "Podešavanja profila",
      description: "Personalizuj svoj nalog",
      icon: Gear,
      color: "#E6C14A",
      gradient: "from-[#F0CF5C] to-[#D4AD32]",
      category: "Profil",
      content: {
        main: "Izmeni lične podatke, podesi notifikacije i preferencije.",
        steps: [
          { title: "Otvori profil", desc: "Klik na avatar" },
          { title: "Izmeni podatke", desc: "Ime, email, slika" },
          { title: "Podesi notifikacije", desc: "Email/push podsetnike" },
          { title: "Sačuvaj", desc: "Izmene se primenjuju odmah" }
        ]
      }
    },
    {
      id: "notifications",
      title: "Notifikacije i podsećanja",
      description: "Ne propusti važne datume",
      icon: Lightning,
      color: "#8A63D2",
      gradient: "from-[#9B7DE6] to-[#7555B8]",
      category: "Profil",
      content: {
        main: "Omogući notifikacije za ponavljajuće troškove, grupne podsetnike i mesečne izveštaje.",
        steps: [
          { title: "Otvori podešavanja", desc: "Profil → Notifikacije" },
          { title: "Omogući tipove", desc: "Ponavljajući, grupe, izveštaji" },
          { title: "Postavi vreme", desc: "Kada želiš da dobijaš" },
          { title: "Test notifikacija", desc: "Proveri da rade" }
        ],
        tips: [
          "Push notifikacije za mobilni",
          "Email digest jednom dnevno",
          "Ne propusti rokove plaćanja"
        ]
      }
    },
    {
      id: "security",
      title: "Bezbednost naloga",
      description: "Zaštiti svoje finansijske podatke",
      icon: CheckCircle,
      color: "#1FBFA4",
      gradient: "from-[#2ED1B6] to-[#12A88E]",
      category: "Profil",
      content: {
        main: "Postavi jaku lozinku, omogući two-factor authentication i pregledaj aktivnost naloga.",
        steps: [
          { title: "Promeni lozinku", desc: "Koristi generator lozinki" },
          { title: "Omogući 2FA", desc: "Extra layer bezbednosti" },
          { title: "Pregledaj aktivnost", desc: "Vidi kada i odakle si se loginovao" }
        ],
        warnings: [
          "Nikada ne deli lozinku",
          "Izloguj se sa javnih računara",
          "Nemoj čuvati lozinku u browseru"
        ]
      }
    }
  ]
};

export default function ModernHelpModal({ page, isOpen, onClose }: ModernHelpModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Sve");

  const currentCards = helpCards[page] || [];

  const categories = useMemo(() => {
    const cats = new Set<string>(["Sve"]);
    currentCards.forEach(card => cats.add(card.category));
    return Array.from(cats);
  }, [currentCards]);

  const filteredCards = useMemo(() => {
    return currentCards.filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           card.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "Sve" || card.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [currentCards, searchQuery, activeCategory]);

  const selectedCardData = selectedCard 
    ? currentCards.find(c => c.id === selectedCard)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden"
            style={{ 
              background: "linear-gradient(145deg, #1E1B2A 0%, #14121C 100%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10" />
              <div className="relative px-8 py-6 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <Question size={24} weight="bold" style={{ color: "#C339B5" }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Pomoć & Tutorijali</h2>
                    <p className="text-sm text-white/50">Brze i jednostavne smernice</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={24} weight="bold" style={{ color: "rgba(255,255,255,0.7)" }} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 100px)" }}>
              {!selectedCard ? (
                <div className="p-8">
                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <MagnifyingGlass 
                        size={20} 
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                        weight="bold"
                      />
                      <input
                        type="text"
                        placeholder="Pretraži pomoć..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Category Filters */}
                  <div className="mb-8 flex gap-3 flex-wrap">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                          activeCategory === cat
                            ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/40 text-white"
                            : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Help Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCards.map((card) => (
                      <motion.button
                        key={card.id}
                        onClick={() => setSelectedCard(card.id)}
                        className="relative group text-left overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Gradient Background */}
                        <div 
                          className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                        />
                        
                        <div className="relative p-6">
                          {/* Icon */}
                          <div 
                            className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
                            style={{ 
                              background: `linear-gradient(135deg, ${card.color}20, ${card.color}10)`,
                              border: `1px solid ${card.color}30`
                            }}
                          >
                            <card.icon size={28} weight="bold" style={{ color: card.color }} />
                          </div>

                          {/* Content */}
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                            {card.title}
                          </h3>
                          <p className="text-sm text-white/60 mb-4 line-clamp-2">
                            {card.description}
                          </p>

                          {/* Category Badge */}
                          <div className="flex items-center justify-between">
                            <span 
                              className="px-3 py-1 rounded-lg text-xs font-semibold"
                              style={{ 
                                background: `${card.color}20`,
                                color: card.color,
                                border: `1px solid ${card.color}30`
                              }}
                            >
                              {card.category}
                            </span>
                            <ArrowRight 
                              size={18} 
                              weight="bold" 
                              className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all"
                            />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* No Results */}
                  {filteredCards.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                        <MagnifyingGlass size={32} weight="bold" className="text-white/30" />
                      </div>
                      <p className="text-white/50 text-lg">Nema rezultata pretrage</p>
                      <p className="text-white/30 text-sm mt-2">Pokušajte sa drugačijim ključnim rečima</p>
                    </div>
                  )}

                  {/* Quick Tips Section */}
                  <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Lightning size={24} weight="fill" style={{ color: "#1FBFA4" }} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg mb-2">💡 Brzi savet</h4>
                        <p className="text-white/70">
                          {page === "dashboard" && "Koristite OCR za brzo dodavanje računa - jednostavno uploadujte sliku i sistem sve sam popuni!"}
                          {page === "expenses" && "Postavite ponavljajuće troškove za račune koji dolaze svaki mesec - aplikacija će vas podsetiti!"}
                          {page === "incomes" && "Redovno ažurirajte prihode za tačnu sliku budžeta i finansijskog zdravlja."}
                          {page === "groups" && "Kreirajte grupu za automatsku podelu troškova - fer i bez komplikacija!"}
                          {page === "categories" && "Kategorije vam pomažu da vidite gde najviše trošite - prvi korak ka boljoj kontroli!"}
                          {page === "statistics" && "Pratite trendove na grafikonima da identifikujete oblasti za uštedu."}
                          {page === "profile" && "Omogućite notifikacije da ne propustite važne podsetnike!"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8">
                  {/* Back Button */}
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
                  >
                    <CaretRight size={20} weight="bold" className="rotate-180" />
                    <span className="font-semibold">Nazad</span>
                  </button>

                  {/* Card Detail */}
                  {selectedCardData && (
                    <div>
                      {/* Header */}
                      <div className="flex items-start gap-6 mb-8">
                        <div 
                          className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0"
                          style={{ 
                            background: `linear-gradient(135deg, ${selectedCardData.color}30, ${selectedCardData.color}10)`,
                            border: `2px solid ${selectedCardData.color}40`
                          }}
                        >
                          <selectedCardData.icon size={40} weight="bold" style={{ color: selectedCardData.color }} />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold text-white mb-3">
                            {selectedCardData.title}
                          </h2>
                          <p className="text-white/60 text-lg">
                            {selectedCardData.description}
                          </p>
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-white/80 leading-relaxed text-lg">
                          {selectedCardData.content.main}
                        </p>
                      </div>

                      {/* Steps */}
                      {selectedCardData.content.steps && (
                        <div className="mb-8">
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <CheckSquare size={24} weight="bold" style={{ color: selectedCardData.color }} />
                            Koraci
                          </h3>
                          <div className="space-y-3">
                            {selectedCardData.content.steps.map((step, idx) => (
                              <div
                                key={idx}
                                className="flex gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
                              >
                                <div 
                                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0"
                                  style={{ background: selectedCardData.color }}
                                >
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-white mb-1">
                                    {step.title}
                                  </div>
                                  <div className="text-white/60 text-sm">
                                    {step.desc}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tips */}
                      {selectedCardData.content.tips && selectedCardData.content.tips.length > 0 && (
                        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Lightbulb size={24} weight="fill" style={{ color: "#1FBFA4" }} />
                            Saveti
                          </h3>
                          <ul className="space-y-3">
                            {selectedCardData.content.tips.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-white/70">
                                <CheckCircle size={20} weight="fill" className="flex-shrink-0 mt-0.5" style={{ color: "#1FBFA4" }} />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Warnings */}
                      {selectedCardData.content.warnings && selectedCardData.content.warnings.length > 0 && (
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Warning size={24} weight="fill" style={{ color: "#F97316" }} />
                            Upozorenja
                          </h3>
                          <ul className="space-y-3">
                            {selectedCardData.content.warnings.map((warning, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-orange-200">
                                <Info size={20} weight="fill" className="flex-shrink-0 mt-0.5" style={{ color: "#F97316" }} />
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

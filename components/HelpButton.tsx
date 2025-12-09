"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Question, X, Lightbulb, CheckCircle, MagnifyingGlass, BookOpen, 
  VideoCamera, CaretRight, Image as ImageIcon, Sparkle, Rocket,
  ChartLine, Users, Tag, Gear, Receipt, TrendUp, Lightning,
  Info, Warning, Play, CheckSquare
} from "@phosphor-icons/react";
import Image from "next/image";

interface HelpItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: any;
  color: string;
  steps?: string[];
  tips?: string[];
  warnings?: string[];
  videoUrl?: string;
  relatedTopics?: string[];
  screenshots?: string[];
}

interface HelpButtonProps {
  page: "dashboard" | "expenses" | "incomes" | "groups" | "categories" | "statistics" | "profile";
}

const helpContent: Record<string, HelpItem[]> = {
  dashboard: [
    {
      id: "add-expense",
      category: "Troškovi",
      question: "Kako da dodam novi trošak?",
      answer: "Postoje dva načina za dodavanje troškova: brzo pomoću OCR skeniranja računa ili ručno unošenje podataka. OCR metod je brži i automatski prepoznaje iznos, datum i kategoriju.",
      steps: [
        "Kliknite na zeleno + (plus) dugme u donjem desnom uglu ekrana",
        "Izaberite 'Dodaj Trošak' iz menija",
        "Za OCR metod: Kliknite na dugme 'Upload račun' ili prevucite sliku/PDF direktno u upload zonu",
        "Sistem će automatski skenirati račun i popuniti sva polja (iznos, datum, kategorija)",
        "Pregledajte očitane podatke u preview modalу - proverite da li su svi podaci tačni",
        "Ako je potrebno, ručno korigujte bilo koje polje (iznos, datum, kategoriju, opis)",
        "Dodajte napomenu ako želite (opcionalno)",
        "Ako je trošak ponavljajući (npr. račun za struju svaki mesec), označite opciju 'Ponavlja se'",
        "Izaberite grupu ako želite da podelite trošak sa drugim članovima",
        "Kliknite 'Sačuvaj' - trošak će biti odmah prikazan na vašem dashboardu",
        "Za ručno unošenje: Popunite sva obavezna polja (iznos, datum, kategorija, opis) i kliknite 'Sačuvaj'"
      ],
      tips: [
        "💡 Najbolji rezultati OCR-a su sa dobro osvetljenim slikama računa",
        "💡 PDF računi se takođe mogu skenirati - samo uploadujte kao i sliku",
        "💡 Sistem automatski prepoznaje 30+ različitih tipova računa (EPS, BVK, Telekom, itd.)",
        "💡 Možete fotografisati račun direktno telefonom i uploadovati",
        "💡 Podržani formati: PNG, JPG, JPEG, PDF (do 10MB)"
      ],
      warnings: [
        "⚠️ Uvek proverite očitane podatke pre nego što sačuvate - OCR može pogriješiti sa lošim slikama",
        "⚠️ Za skenirane PDF-e, prvo napravite screenshot ili fotografiju"
      ],
      relatedTopics: ["ocr-how-it-works", "recurring-expenses", "expense-categories"]
    },
    {
      id: "ocr-how-it-works",
      category: "OCR Tehnologija",
      question: "Šta je OCR i kako precizno radi?",
      answer: "OCR (Optical Character Recognition) je AI tehnologija koja automatski čita tekst sa slika. Naš sistem koristi napredni Tesseract OCR engine sa podrškom za srpski jezik i ćirilicu.",
      steps: [
        "Uploadujete sliku ili PDF računa",
        "Sistem konvertuje sliku u optimalni format za skeniranje (povećava rezoluciju, poboljšava kontrast)",
        "Tesseract OCR engine skenira dokument red po redu i prepoznaje tekstualne karaktere",
        "AI algoritam traži specifične pattern-e: iznose sa 'RSD', 'din', datume, nazive kategorija",
        "Sistem ima 30+ unapred programiranih pattern-a za različite tipove računa (EPS, BVK, Yettel, A1, itd.)",
        "Prepoznati tekst se parsira i ekstrahuje se: iznos (sa 3-pass algoritmom), datum, kategorija, stavke",
        "Podaci se prikazuju u preview modalу sa confidence score-om (procenat pouzdanosti)",
        "Vi pregledate i potvrdite ili korigujete podatke"
      ],
      tips: [
        "💡 OCR radi najbolje sa: dobro osvetljenim slikama, ravnim (ne zakrivljenim) računima, čistim pozadinama",
        "💡 Prosečna tačnost našeg OCR-a je 86% za račune na srpskom jeziku",
        "💡 Sistem prepoznaje i ćirilicu i latinicu",
        "💡 OCR automatski detektuje i nazive kompanija (EPS → Električna energija, BVK → Voda i kanalizacija)"
      ],
      warnings: [
        "⚠️ OCR ne radi sa ručno pisanim računima - samo sa štampanim tekstom",
        "⚠️ Veoma stari ili izblijedeli računi mogu imati lošiju tačnost prepoznavanja"
      ],
      relatedTopics: ["add-expense", "supported-formats", "upload-issues"]
    },
    {
      id: "dashboard-stats",
      category: "Dashboard",
      question: "Šta znače statistike na kartama i kako se računaju?",
      answer: "Dashboard prikazuje 3 glavne karte sa finansijskim metrikama: Ukupni troškovi, Ukupni prihodi i Bilans. Svaka kartica ima i mesečni badge sa podacima za trenutni mesec.",
      steps: [
        "Ukupni troškovi (crvena kartica sa TrendDown ikonom): Zbir svih vaših troškova od početka korišćenja aplikacije",
        "Mesečni badge: Prikazuje troškove samo za trenutni mesec (npr. Novembar 2025)",
        "Ukupni prihodi (zelena kartica sa TrendUp ikonom): Zbir svih vaših prihoda",
        "Mesečni badge: Prikazuje prihode samo za trenutni mesec",
        "Bilans (ljubičasta kartica sa Wallet ikonom): Razlika između ukupnih prihoda i troškova",
        "Bilans se računa kao: Ukupni prihodi - Ukupni troškovi",
        "Pozitivan bilans (zeleno) znači da imate više prihoda nego troškova",
        "Negativan bilans (crveno) znači da trošite više nego što zarađujete",
        "Kliknite na bilo koju karticu da vidite detaljnu listu transakcija",
        "Brojevi se animiraju (CountUp animacija) svaki put kada osvežite podatke"
      ],
      tips: [
        "💡 Brojevi se automatski formatiraju sa hiljadama separatorima (tačka) za lakše čitanje",
        "💡 Valuta (RSD/EUR/USD) se automatski prikazuje pored iznosa",
        "💡 Mesečni badge se automatski ažurira kada pređete u novi mesec",
        "💡 Hover preko kartica za efekat glow-a i animaciju"
      ],
      relatedTopics: ["monthly-reports", "balance-calculation"]
    },
    {
      id: "create-group",
      category: "Grupe",
      question: "Kako da kreiram grupu za deljenje troškova?",
      answer: "Grupe omogućavaju deljenje troškova sa cimerom, porodicom ili prijateljima. Svi članovi grupe vide sve troškove i automatski se računa ko kome duguje.",
      steps: [
        "Kliknite na 'Grupe' dugme u sekciji 'Brzi pristup' na dashboardu",
        "Kliknite na '+ Nova Grupa' dugme (gornji desni ugao)",
        "Unesite naziv grupe (npr. 'Stan', 'Porodica', 'Putovanje')",
        "Opciono dodajte opis grupe",
        "Kliknite 'Kreiraj Grupu'",
        "Grupa je kreirana! Sada pozovite članove:",
        "Kliknite na 'Pozovi članove' dugme",
        "Kopirajte share link (automatski se kreira jedinstveni link za vašu grupu)",
        "Pošaljite link članovima putem WhatsApp-a, email-a ili bilo koje aplikacije",
        "Kada članovi kliknu na link, automatski se pridružuju grupi",
        "Počnite dodavati troškove i izaberite grupu pri dodavanju - troškovi će biti automatski podeljeni!"
      ],
      tips: [
        "💡 Možete kreirati neograničen broj grupa",
        "💡 Isti trošak može biti dodeljen samo jednoj grupi",
        "💡 Share link nikada ne ističe - možete ga slati u bilo kom momentu",
        "💡 Možete videti ko je član grupe u 'Članovi' sekciji",
        "💡 Admin grupe može izbaciti članove ili obrisati grupu"
      ],
      warnings: [
        "⚠️ Brisanje grupe je trajno - svi troškovi ostaju, ali podela se gubi",
        "⚠️ Samo kreator grupe može obrisati grupu"
      ],
      relatedTopics: ["invite-members", "split-expenses", "group-balance"]
    },
    {
      id: "recurring-expenses",
      category: "Ponavljajući troškovi",
      question: "Kako funkcionišu ponavljajući troškovi i podsetnici?",
      answer: "Ponavljajući troškovi su računi koji dolaze periodično (npr. struja, voda, kirija). Sistem vas automatski podseti kada dođe vreme za sledeće plaćanje.",
      steps: [
        "Pri dodavanju troška, označite checkbox 'Ponavlja se'",
        "Izaberite period ponavljanja: Mesečno, Nedeljno ili Godišnje",
        "Postavite datum sledećeg ponavljanja (kada očekujete sledeći račun)",
        "Sačuvajte trošak - sistem će zapamtiti da je ponavljajući",
        "Kada dođe datum ponavljanja, dobićete podsetnik modal na dashboardu",
        "U podsetnik modalu imate 3 opcije:",
        "• 'Sačuvaj' - Automatski kreira novi trošak sa istim podacima (možete promeniti iznos)",
        "• 'Odloži' - Pomera datum ponavljanja za sledeći period",
        "• 'Otkaži jednom' - Preskače ovaj ciklus, ali zadržava ponavljanje za buduće",
        "• 'Isključi ponavljanje' - Trajno isključuje ponavljanje za ovaj trošak",
        "Sistem automatski računa sledeći datum na osnovu period a (mesečno = +1 mesec, itd.)"
      ],
      tips: [
        "💡 Idealno za račune: struja, voda, internet, telefon, kirija, osiguranje",
        "💡 Možete imati različite periode za različite troškove",
        "💡 Sistem će vas podsetiti čak i ako niste otvorili aplikaciju - čim se prijavite",
        "💡 U listi troškova, ponavljajući troškovi imaju ikonu Repeat"
      ],
      warnings: [
        "⚠️ Datum ponavljanja se automatski ne ažurira ako ručno kreirate trošak - koristite 'Sačuvaj' u podsetnik modalu",
        "⚠️ Ako isključite ponavljanje, ne možete ga kasnije ponovo uključiti - morate kreirati novi ponavljajući trošak"
      ],
      relatedTopics: ["add-expense", "edit-expense", "notifications"]
    }
  ],
  expenses: [
    {
      id: "filter-expenses",
      category: "Filteri",
      question: "Kako da filtriram i pretražujem troškove?",
      answer: "Postoji više načina za filtriranje troškova: po datumu (mesec/godina), po kategoriji, po grupi, ili tekstualna pretraga.",
      steps: [
        "Na vrhu stranice imate filter opcije:",
        "• Mesec dropdown - Izaberite mesec (Januar - Decembar)",
        "• Godina dropdown - Izaberite godinu",
        "• Kategorija dropdown - Filter po tipu troška (Hrana, Transport, Računi, itd.)",
        "• Search polje - Unesite ključnu reč za pretragu (pretraga po opisu troška)",
        "Filteri se mogu kombinovati: npr. 'Novembar 2025' + 'Hrana' + search 'pekara'",
        "Rezultati se automatski ažuriraju kada promenite bilo koji filter",
        "Ukupan iznos filtriranih troškova se prikazuje na vrhu",
        "Za resetovanje svih filtera - osvežite stranicu ili izaberite 'Svi' u dropdownima"
      ],
      tips: [
        "💡 Search radi sa delimičnim match-evima - npr. 'pilar' će naći 'Pekara Pilar'",
        "💡 Možete pretraživati i po iznosu - npr. '500' će naći sve troškove sa 500 RSD",
        "💡 Filteri se čuvaju dok ste na stranici - ne morate ih ponovo postavljati",
        "💡 Koristite sort opcije (klik na header kolone) za sortiranje po datumu ili iznosu"
      ],
      relatedTopics: ["sort-expenses", "export-data"]
    },
    {
      id: "edit-expense",
      category: "Izmena",
      question: "Kako da izmenim ili obrišem postojeći trošak?",
      answer: "Možete editovati sve podatke o trošku (iznos, datum, kategoriju, opis) ili potpuno obrisati trošak ako je pogrešno unet.",
      steps: [
        "Pronađite trošak u listi koji želite da izmenite",
        "Kliknite na ikonu olovke (PencilSimple) pored troška",
        "Otvoriće se edit modal sa svim podacima troška",
        "Izmenite bilo koje polje: iznos, datum, kategoriju, opis, napomenu",
        "Ako je trošak ponavljajući, možete promeniti period i sledeći datum",
        "Možete promeniti i grupu (dodati ili ukloniti iz grupe)",
        "Kliknite 'Sačuvaj izmene' - promene će biti odmah vidljive",
        "Za brisanje troška:",
        "• Kliknite na ikonu kante za smeće (Trash) pored troška",
        "• Pojaviće se konfirmacioni modal - 'Da li ste sigurni?'",
        "• Kliknite 'Obriši' za potvrdu ili 'Otkaži' da odustanete",
        "• Trošak će biti trajno obrisan (ne može se vratiti!)"
      ],
      tips: [
        "💡 Izmene troška se odražavaju i na statistike i bilans",
        "💡 Ako trošak pripada grupi, izmene vide svi članovi",
        "💡 Možete editovati i ponavljajuće troškove - ali to ne menja već kreirane instance",
        "💡 Pre brisanja troška, proverite da li je to ispravna odluka - brisanje je trajno"
      ],
      warnings: [
        "⚠️ Obrisani troškovi NE mogu se vratiti - nema 'Undo' opcije",
        "⚠️ Brisanje ponavljajućeg troška ne briše već kreirane instance - samo zaustavlja ponavljanje",
        "⚠️ Ako obrišete trošak koji je deljen u grupi, utiče na bilans svih članova"
      ],
      relatedTopics: ["add-expense", "recurring-expenses", "group-expenses"]
    }
  ],
  incomes: [
    {
      id: "add-income",
      category: "Prihodi",
      question: "Kako da dodam prihod i praćenje izvora zarade?",
      answer: "Dodavanje prihoda je slično kao troškovi - možete koristiti OCR za skeniranje uplatnica ili ručno uneti podatke.",
      steps: [
        "Kliknite na zeleno + (plus) dugme u donjem desnom uglu",
        "Izaberite 'Dodaj Prihod' iz menija",
        "Unesite iznos prihoda (obavezno polje)",
        "Dodajte opis (npr. 'Plata Novembar', 'Freelance projekat', 'Poklon')",
        "Izaberite kategoriju prihoda: Plata, Freelance, Biznis, Investicije, Poklon, Povraćaj, Ostalo",
        "Izaberite datum kada ste primili prihod",
        "Opciono: Dodajte napomenu (npr. 'Klijent: XYZ Firma')",
        "SPECIJALNO: Ako je prihod otplata zajma, popunite polje 'Otplata zajma' sa imenom osobe",
        "Ako želite uploadovati potvrdu o prihodu (uplatnicu, izvod): kliknite 'Upload dokument'",
        "Možete postaviti ponavljanje ako je prihod redovan (npr. plata svaki mesec)",
        "Kliknite 'Sačuvaj' - prihod će biti prikazan na dashboardu i u listi prihoda"
      ],
      tips: [
        "💡 Označite prihode kao ponavljajuće za redovnu platu - automatski će se dodavati svaki mesec",
        "💡 'Otplata zajma' polje je korisno za praćenje ko vam je vratio dug",
        "💡 OCR može skenirati i uplatnice - uploadujte sliku kao kod troškova",
        "💡 Koristite kategoriju 'Povraćaj' za refunde i povraćaj novca"
      ],
      relatedTopics: ["loan-repayment", "income-categories", "recurring-income"]
    },
    {
      id: "loan-repayment",
      category: "Otplate zajma",
      question: "Kako da pratim ko mi duguje i otplate zajmova?",
      answer: "Polje 'Otplata zajma' omogućava praćenje međusobnih dugova. Kada neko vrati dug, zabeležite kao prihod sa imenom osobe.",
      steps: [
        "Kada vam neko vrati dug, dodajte prihod (kao što biste dodali bilo koji prihod)",
        "U polju 'Otplata zajma' unesite ime osobe koja vam je vratila novac",
        "Sistem će označiti ovaj prihod kao 'Otplata zajma od [Ime]'",
        "U listi prihoda, videćete posebnu ikonu za otplate zajma",
        "Možete filtrirati prihode da vidite sve otplate zajma",
        "Za praćenje ko vam duguje:",
        "• Kreirajte Excel/Google Sheets listu sa imenima i iznosima dugova",
        "• Ili koristite napomenu pri dodavanju zajma",
        "• Kada osoba vrati dug, zabeležite kao prihod sa 'Otplata zajma'",
        "Budući update će dodati dedikovan modul za praćenje zajmova (ko kome duguje)"
      ],
      tips: [
        "💡 Koristite jasna imena u polju 'Otplata zajma' (npr. 'Marko Petrović')",
        "💡 Možete dodati napomenu sa detaljima (npr. 'Zajam od 15. oktobra')",
        "💡 Kategorija se automatski postavlja na 'Povraćaj' za otplate zajma"
      ],
      relatedTopics: ["add-income", "track-debts"]
    }
  ],
  groups: [
    {
      id: "invite-members",
      category: "Članovi",
      question: "Kako da pozovem članove u grupu i šta oni vide?",
      answer: "Pozivanje članova je jednostavno preko share linka. Kada se pridruže, vide sve troškove grupe i mogu dodavati svoje troškove.",
      steps: [
        "Otvorite grupu u koju želite da pozovete članove",
        "Kliknite na dugme 'Pozovi članove' (ili ikonu 'Users' ako već postoje članovi)",
        "Sistem automatski generiše jedinstveni invite link za vašu grupu",
        "Imate nekoliko načina da podelite link:",
        "• 'Kopiraj link' - Kopira link u clipboard, možete ga nalepiti bilo gde",
        "• 'QR kod' - Generiše QR kod koji drugi mogu skenirati telefonom (budući feature)",
        "• Direktno share preko WhatsApp, Email, Messenger, itd.",
        "Kada član klikne na link:",
        "• Ako ima nalog: Automatski se dodaje u grupu",
        "• Ako nema nalog: Mora da se registruje, pa se automatski pridružuje",
        "Nakon što se pridruže, članovi mogu:",
        "• Videti SVE troškove i prihode grupe",
        "• Dodavati svoje troškove (koji se automatski dele)",
        "• Videti ko kome duguje u 'Poravnanje' sekciji",
        "• Dobijati notifikacije o novim troškovima u grupi"
      ],
      tips: [
        "💡 Share link nikada ne ističe - možete ga slati u bilo kom momentu",
        "💡 Možete imati neograničen broj članova u grupi",
        "💡 Svi članovi imaju ista prava - mogu dodavati, editovati i brisati troškove",
        "💡 Ako neko slučajno klikne na link dva puta, neće biti duplo dodat",
        "💡 Možete poslati link i ljudima koji još nemaju nalog - oni će se registrovati i automatski ući u grupu"
      ],
      warnings: [
        "⚠️ Share link je PUBLIC - svako ko ima link može se pridružiti grupi",
        "⚠️ Ne delite link javno ako ne želite da nepoznati ljudi uđu u grupu",
        "⚠️ Admin može izbaciti članove, ali član ne može sam sebe izbaciti"
      ],
      relatedTopics: ["create-group", "remove-members", "group-permissions"]
    },
    {
      id: "split-expenses",
      category: "Podela troškova",
      question: "Kako funkcioniše automatska podela troškova u grupi?",
      answer: "Troškovi se AUTOMATSKI dele jednako među svim članovima grupe. Sistem prati ko je platio šta i računa ko kome duguje.",
      steps: [
        "Kada dodajete trošak, izaberite grupu iz dropdown menija",
        "Trošak se automatski deli jednako među svim članovima",
        "Primer: Trošak od 3000 RSD u grupi sa 3 člana = 1000 RSD po članu",
        "Sistem beleži ko je fizički platio trošak (vi ako ste vi dodali)",
        "U 'Poravnanje' sekciji grupe vidite:",
        "• Ko je platio koliko ukupno",
        "• Ko treba da plati koliko (jednaka podela)",
        "• Ko kome duguje i koliko tačno",
        "Primer bilansa:",
        "• Marko je platio 5000 RSD",
        "• Ana je platila 2000 RSD",
        "• Luka je platio 1000 RSD",
        "• Ukupno 8000 RSD / 3 = 2667 RSD po osobi",
        "• Rezultat: Luka duguje Marku 1667 RSD, Ana duguje Marku 667 RSD",
        "Algoritam automatski optimizuje transakcije (minimalan broj plaćanja)"
      ],
      tips: [
        "💡 Sistem automatski ažurira bilans kada bilo ko doda novi trošak",
        "💡 Možete videti istoriju svih transakcija u grupi",
        "💡 Svaki član vidi isti bilans - potpuna transparentnost",
        "💡 Možete exportovati izveštaj sa svim transakcijama (Excel/CSV)",
        "💡 Mesečni pregledi pokazuju trend troškova po članovima"
      ],
      warnings: [
        "⚠️ Trenutno se troškovi dele JEDNAKO - customizovana podela (70/30, itd.) dolazi u budućem update-u",
        "⚠️ Ako neko izbriše svoj trošak, bilans se automatski prepravlja"
      ],
      relatedTopics: ["group-balance", "settlement-payments", "monthly-group-report"]
    },
    {
      id: "group-balance",
      category: "Bilans grupe",
      question: "Kako da vidim ko kome duguje u grupi i kako to funkcioniše?",
      answer: "Sekcija 'Poravnanje' u grupi prikazuje ko kome duguje. Sistem koristi optimizovan algoritam da minimizuje broj transakcija.",
      steps: [
        "Otvorite grupu i skrolujte do sekcije 'Poravnanje' (Settlement)",
        "Videćete listu sa 3 kolone:",
        "• Ko duguje (Debtor)",
        "• Kome duguje (Creditor)",
        "• Koliko duguje (Amount)",
        "Primer prikaza: 'Ana → Marko: 1500 RSD' znači Ana duguje Marku 1500 dinara",
        "Sistem koristi 'minimum cash flow' algoritam:",
        "• Računa ko je neto dužnik (platio manje od jednake podele)",
        "• Računa ko je neto poverilac (platio više od jednake podele)",
        "• Optimizuje ko kome treba da plati (minimalan broj transakcija)",
        "Kada neko vrati dug:",
        "• Označite plaćanje kao izvršeno (budući feature)",
        "• Ili ručno dodajte prihod sa 'Otplata zajma'",
        "Mesečni pregled (Monthly Breakdown) pokazuje:",
        "• Troškove po članu za svaki mesec",
        "• Prihode po članu",
        "• Bilans za svaki mesec"
      ],
      tips: [
        "💡 Snapshot funkcija vam omogućava da 'zamrznete' trenutno stanje dugova",
        "💡 Možete exportovati dugovanja u Excel za offlajn praćenje",
        "💡 Grafikon pokazuje vizuelno ko najviše troši u grupi",
        "💡 Filter po datumu vam omogućava da vidite bilans samo za određeni period"
      ],
      relatedTopics: ["split-expenses", "mark-as-paid", "export-settlement"]
    }
  ],
  categories: [
    {
      id: "category-list",
      category: "Kategorije",
      question: "Koja kategorija je za šta i kako izabrati pravu kategoriju?",
      answer: "Kategorije vam pomažu da organizujete troškove po tipu. Postoji 30+ predefinisanih kategorija organizovanih po oblastima.",
      steps: [
        "RAČUNI (Utilities):",
        "• Električna energija - EPS, račun za struju",
        "• Voda i kanalizacija - BVK, vodovod",
        "• Gas - Srbijagas, gradsko grejanje",
        "• Telefon - Yettel, A1, Telekom mobilni računi",
        "• Internet - SBB, Telekom internet paketi",
        "• Kablovski TV - televizija, streaming servisi",
        "HRANA (Food & Dining):",
        "• Hrana - kupovina u supermarketu, pijaca",
        "• Restoran - ručkovi i večere u restoranima",
        "• Fast Food - brza hrana, dostava",
        "• Kafa/Bar - kafići, barovi, pub-ovi",
        "• Pekara - hleb, pecivo, pekarski proizvodi",
        "TRANSPORT (Transportation):",
        "• Gorivo - benzin, dizel za automobil",
        "• Javni prevoz - autobus, tramvaj, metro",
        "• Parking - plaćeno parkiranje",
        "• Taxi/CarGo - taxi službe, CarGo, Bolt",
        "• Održavanje vozila - servis, gume, registracija",
        "ZDRAVLJE (Health & Fitness):",
        "• Lekovi - apoteke, lekovi",
        "• Lekar - pregledi, konsultacije",
        "• Fitnes/Teretana - članarina, personalni trener",
        "• Osiguranje - zdravstveno osiguranje",
        "ZABAVA (Entertainment):",
        "• Bioskop/Pozorište - ulaznice",
        "• Koncert/Događaj - koncerti, festivali",
        "• Hobiji - oprema, materijali",
        "• Putovanje - letovanje, izleti",
        "OSTALO:",
        "• Odeća/Obuća",
        "• Kozmetika/Higijena",
        "• Kućanski aparati",
        "• Školarina/Edukacija",
        "• Pokloni",
        "• Donacija",
        "• Ostalo - sve što ne spada u gore navedeno"
      ],
      tips: [
        "💡 Doslednost je ključna - uvek koristite istu kategoriju za isti tip troška",
        "💡 OCR automatski prepoznaje kategoriju sa računa",
        "💡 Statistike su preciznije ako koristite pravilne kategorije",
        "💡 Možete filtrirati troškove po kategoriji za detaljan uvid"
      ],
      relatedTopics: ["custom-categories", "ocr-categories"]
    }
  ],
  statistics: [
    {
      id: "read-charts",
      category: "Grafikoni",
      question: "Kako da čitam i razumem grafikone i statistike?",
      answer: "Stranica sa statistikama prikazuje vaše finansije kroz različite vizualizacije - line chart, pie chart, bar chart. Svaki grafikon ima specifičnu svrhu.",
      steps: [
        "LINE CHART (Trend Through Time):",
        "• Prikazuje kako se vaši troškovi i prihodi menjaju tokom vremena",
        "• Horizontalna osa (X): Meseci ili nedelje",
        "• Vertikalna osa (Y): Iznos u valuti (RSD)",
        "• Crvena linija = Troškovi, Zelena linija = Prihodi",
        "• Hover preko tačke da vidite tačan iznos za taj datum",
        "• Rastuća linija = povećanje troškova/prihoda, opadajuća = smanjenje",
        "PIE CHART (Category Breakdown):",
        "• Pokazuje raspodelu troškova po kategorijama",
        "• Svaka sekcija (slice) predstavlja jednu kategoriju",
        "• Veća sekcija = više novca potrošeno u toj kategoriji",
        "• Boje odgovaraju bojama kategorija u aplikaciji",
        "• Hover preko sekcije da vidite procenat i tačan iznos",
        "• Koristan za identifikovanje gde najviše trošite",
        "BAR CHART (Comparison):",
        "• Uporedna analiza troškova i prihoda po mesecima",
        "• Svaki mesec ima dva bara: crveni (troškovi) i zeleni (prihodi)",
        "• Visina bara = iznos",
        "• Ako je zeleni bar viši od crvenog = višak (profitabilnost)",
        "• Ako je crveni viši = deficit (trošite više nego zarađujete)",
        "• Klik na bar za detaljan uvid u taj mesec"
      ],
      tips: [
        "💡 Redovno pregledajte trendove - identifikujte neobične skokove u troškovima",
        "💡 Koristite filter po datumu da uporedite različite periode",
        "💡 Pie chart vam odmah pokazuje vašu 'najveću rupu u budžetu'",
        "💡 Exportujte grafikone kao PNG sliku za izveštaje"
      ],
      warnings: [
        "⚠️ Grafikoni prikazuju samo podatke koje ste uneli - nepotpuni unosi = neprecizne statistike",
        "⚠️ Prvi mesec korišćenja može imati manje tačne statistike jer nedostaje istorija"
      ],
      relatedTopics: ["yoy-mom", "export-charts", "filter-stats"]
    },
    {
      id: "yoy-mom",
      category: "Metriki",
      question: "Šta znače YoY, MoM i drugi metriki?",
      answer: "YoY (Year over Year) i MoM (Month over Month) su metrike koje porede vaše troškove sa prethodnim periodima.",
      steps: [
        "YoY (Year over Year) - Godišnja promena:",
        "• Poredi trenutni mesec sa istim mesecom prošle godine",
        "• Formula: ((Ovaj Novembar - Prošli Novembar) / Prošli Novembar) × 100",
        "• Primer: Novembar 2025 troškovi = 50,000 RSD, Novembar 2024 = 40,000 RSD",
        "• YoY = +25% (troškovi su porasli za 25% u odnosu na prošlu godinu)",
        "• Zelena strelica gore = povećanje, Crvena strelica dole = smanjenje",
        "MoM (Month over Month) - Mesečna promena:",
        "• Poredi trenutni mesec sa prethodnim mesecom",
        "• Formula: ((Ovaj mesec - Prošli mesec) / Prošli mesec) × 100",
        "• Primer: Novembar = 50,000 RSD, Oktobar = 45,000 RSD",
        "• MoM = +11.1% (troškovi su porasli za 11% u odnosu na prošli mesec)",
        "• Koristi se za identifikovanje kratkoročnih trendova",
        "AVERAGE MONTHLY (Prosečni mesečni):",
        "• Prosek svih vaših mesečnih troškova od početka korišćenja",
        "• Formula: Ukupni troškovi / Broj meseci",
        "• Pomaže da vidite 'normalan' nivo troškova",
        "SAVINGS RATE (Stopa štednje):",
        "• Procenat prihoda koji ne potrošite",
        "• Formula: ((Prihodi - Troškovi) / Prihodi) × 100",
        "• Primer: Prihodi = 100,000 RSD, Troškovi = 70,000 RSD",
        "• Savings Rate = 30% (štedite 30% prihoda)"
      ],
      tips: [
        "💡 YoY metrika je najkorisnija za poređenje sezonskih trendova",
        "💡 MoM vam pokazuje trenutne promene u trošenju",
        "💡 Ciljna stopa štednje za zdravu finansijsku situaciju je 20-30%",
        "💡 Ako je YoY negativan za troškove - bravo, trošite manje!"
      ],
      relatedTopics: ["read-charts", "budget-planning"]
    },
    {
      id: "export-data",
      category: "Export & Backup",
      question: "Kako da exportujem podatke i kreiram backup?",
      answer: "Možete exportovati sve vaše podatke u Excel (XLSX) ili CSV format za offlajn analizu ili backup.",
      steps: [
        "Kliknite na 'Export' dugme (obično u gornjem desnom uglu)",
        "Izaberite format:",
        "• XLSX (Excel) - Formatiran, sa stilizacijom, preporučeno za analizu",
        "• CSV (Comma Separated Values) - Jednostavan, kompatibilan sa svim programima",
        "Izaberite šta želite da exportujete:",
        "• Troškovi - Sve transakcije troškova",
        "• Prihodi - Sve transakcije prihoda",
        "• Sve zajedno - Kompletna istorija",
        "• Statistike - Agregirani podaci i izveštaji",
        "Izaberite period (opciono):",
        "• Sve vreme - Kompletna istorija od početka",
        "• Ovaj mesec - Samo trenutni mesec",
        "• Custom range - Izaberite početni i krajnji datum",
        "Kliknite 'Preuzmi' - fajl će se automatski downloadovati",
        "Excel fajl uključuje:",
        "• List 'Troškovi' sa svim podacima (datum, iznos, kategorija, opis, napomena)",
        "• List 'Prihodi' sa svim prihodima",
        "• List 'Summary' sa statistikama i grafovima",
        "• List 'Groups' sa detaljna podelom grupnih troškova"
      ],
      tips: [
        "💡 Exportujte podatke mesečno kao backup",
        "💡 Koristite Excel pivot tables za naprednu analizu exportovanih podataka",
        "💡 CSV format je kompatibilan sa Google Sheets, Numbers, itd.",
        "💡 Možete importovati exportovan fajl u druge budžet aplikacije"
      ],
      warnings: [
        "⚠️ Exportovani fajl sadrži sve vaše finansijske podatke - čuvajte ga na sigurnom mestu",
        "⚠️ Ne delite fajl preko nezaštićenih kanala (email bez enkripcije, javni cloud, itd.)"
      ],
      relatedTopics: ["data-security", "import-data"]
    }
  ],
  profile: [
    {
      id: "change-password",
      category: "Sigurnost",
      question: "Kako da promenim lozinku i osiguram nalog?",
      answer: "Redovna promena lozinke je dobra praksa za sigurnost naloga. Domaćin koristi enkripciju i moderne sigurnosne standarde.",
      steps: [
        "Kliknite na vaš avatar ili ime u gornjem desnom uglu",
        "Izaberite 'Profil' ili 'Podešavanja' iz dropdown menija",
        "Kliknite na tab 'Sigurnost'",
        "U sekciji 'Promena lozinke':",
        "• Unesite trenutnu lozinku (za verifikaciju)",
        "• Unesite novu lozinku (minimum 8 karaktera)",
        "• Potvrdite novu lozinku (unesite ponovo)",
        "Kliknite 'Sačuvaj izmene'",
        "Sistem će validirati:",
        "• Da li je stara lozinka tačna",
        "• Da li nova lozinka ispunjava uslove (dužina, kompleksnost)",
        "• Da li se nova lozinka i potvrda poklapaju",
        "Nakon uspešne promene:",
        "• Dobićete potvrdu (toast notifikacija)",
        "• Bićete automatski odjavljeni sa svih drugih uređaja (sigurnosna mera)",
        "• Moraćete da se prijavite ponovo sa novom lozinkom",
        "DODATNE SIGURNOSNE MERE:",
        "• Omogućite Two-Factor Authentication (2FA) u istom tabu",
        "• Pregledajte 'Aktivne sesije' da vidite gde ste prijavljeni",
        "• Kliknite 'Odjavi sa svih uređaja' ako sumnjate na neovlašćeni pristup"
      ],
      tips: [
        "💡 Koristite jaku lozinku: kombinacija velikih/malih slova, brojeva i simbola",
        "💡 Ne koristite istu lozinku kao na drugim sajtovima",
        "💡 Password manager aplikacije (LastPass, 1Password, Bitwarden) mogu generisati i čuvati jake lozinke",
        "💡 Promenite lozinku odmah ako sumnjate da je kompromitovana",
        "💡 Omogućite 2FA za dodatni sloj zaštite"
      ],
      warnings: [
        "⚠️ Nikada ne delite lozinku sa drugima - čak ni članovima porodice",
        "⚠️ Ako zaboravite lozinku, koristite 'Zaboravili ste lozinku?' link - NEMA drugog načina za povraćaj",
        "⚠️ Domaćin nikada neće tražiti vašu lozinku preko email-a ili telefona"
      ],
      relatedTopics: ["enable-2fa", "account-security", "active-sessions"]
    },
    {
      id: "notifications",
      category: "Notifikacije",
      question: "Kako da podesim notifikacije i podsetnik e?",
      answer: "Možete prilagoditi koje notifikacije želite da primate - za ponavljajuće troškove, grupne transakcije, i više.",
      steps: [
        "Idite na 'Profil' → 'Podešavanja' → 'Notifikacije'",
        "Videćete listu svih tipova notifikacija:",
        "NOTIFIKACIJE ZA PONAVLJAJUĆE TROŠKOVE:",
        "• 'Podseti me 3 dana pre roka' - Dobićete notifikaciju 3 dana pre sledećeg plaćanja",
        "• 'Podseti me na dan roka' - Notifikacija na dan kada trošak treba da se plati",
        "• 'Podseti me ako prođe rok' - Ako zaboravite da platite, podsetnik nakon roka",
        "NOTIFIKACIJE ZA GRUPE:",
        "• 'Novi trošak u grupi' - Kada član doda trošak u grupu",
        "• 'Neko te je dodao u grupu' - Kada te neko pozove u grupu",
        "• 'Dug je označen kao plaćen' - Kada neko plati dug u grupi",
        "NOTIFIKACIJE ZA BUDŽET:",
        "• 'Prekoračen mesečni budžet' - Ako potrošite više od planiranog",
        "• 'Blizu limita kategorije' - Ako trošite previše u jednoj kategoriji",
        "EMAIL vs PUSH NOTIFIKACIJE:",
        "• Email - Dobijate email na registrovanu adresu",
        "• Push - Notifikacija direktno u browseru (morate dozvoliti u browseru)",
        "• Oba - Dobijate i email i push notifikaciju",
        "Izaberite preference za svaki tip notifikacije",
        "Kliknite 'Sačuvaj podešavanja'"
      ],
      tips: [
        "💡 Omogućite push notifikacije u browseru za instant podsetnik e",
        "💡 Ako ne želite da budete ometani, isključite sve osim kritičnih notifikacija",
        "💡 Email notifikacije su korisne ako ne proveravate aplikaciju često",
        "💡 Možete privremeno isključiti sve notifikacije ('Do Not Disturb' režim)"
      ],
      warnings: [
        "⚠️ Ako isključite sve notifikacije, možete propustiti važne podsetnik e o računima",
        "⚠️ Push notifikacije rade samo ako imate aplikaciju otvorenu u tabu browsera (ili PWA instaliranu)"
      ],
      relatedTopics: ["recurring-expenses", "budget-limits"]
    },
    {
      id: "delete-account",
      category: "Brisanje naloga",
      question: "Kako da obrišem nalog i šta se dešava sa podacima?",
      answer: "Brisanje naloga je TRAJNO i NEPOVRATNO. Svi vaši podaci, troškovi, prihodi, grupe - sve će biti obrisano zauvek.",
      steps: [
        "⚠️ PAŽNJA: Ova akcija je TRAJNA - NE može se poništiti!",
        "Pre nego što nastavite, razmislite:",
        "• Da li ste exportovali sve podatke kao backup?",
        "• Da li ste zatvorili sve dugove u grupama?",
        "• Da li ste sigurni da više ne želite koristiti aplikaciju?",
        "Idite na 'Profil' → 'Podešavanja' → 'Opasna zona' (crvena sekcija na dnu)",
        "Kliknite na crveno dugme 'Obriši nalog'",
        "Pojaviće se konfirmacioni modal sa upozorenjem",
        "Morate RUČNO UKUCATI 'OBRIŠI' u polje za potvrdu",
        "Unesite vašu lozinku za finalnu verifikaciju",
        "Kliknite 'Trajno obriši nalog'",
        "ŠTA SE BRIŠE:",
        "• Svi vaši troškovi i prihodi (sve transakcije)",
        "• Sve grupe koje ste kreirali (članovi ostaju, ali gube pristup grupi)",
        "• Svi uploadovani računi i dokumenti",
        "• Sva podešavanja i preference",
        "• Vaš profil, email, lozinka - sve informacije",
        "• Istorija aktivnosti i statistike",
        "NAKON BRISANJA:",
        "• Automatski ćete biti odjavljeni",
        "• Ne možete se više prijaviti sa tim email-om",
        "• Email adresa postaje dostupna za registraciju novog naloga (ali BEZ starih podataka)",
        "• Primićete email potvrdu o brisanju naloga"
      ],
      tips: [
        "💡 Pre brisanja, exportujte SVE podatke (troškovi, prihodi, grupe) kao backup",
        "💡 Ako samo želite pauzu, razmislite o deaktivaciji umesto brisanja",
        "💡 Ako imate problema sa aplikacijom, kontaktirajte podršku - možda možemo pomoći"
      ],
      warnings: [
        "⚠️ BRISANJE JE TRAJNO - čak ni admin ne može vratiti obrisane podatke",
        "⚠️ Ako ste admin grupe, svi članovi će izgubiti pristup grupi",
        "⚠️ Nema 'grace period' - nalog se briše ODMAH nakon potvrde",
        "⚠️ Ne možete vratiti podatke nakon brisanja - čak ni ako se odmah registrujete ponovo"
      ],
      relatedTopics: ["export-data", "deactivate-account", "contact-support"]
    },
    {
      id: "edit-profile",
      category: "Profil",
      question: "Kako da promenim ime, email, sliku profila i druge lične podatke?",
      answer: "Možete editovati sve lične informacije u sekciji 'Profil'. Promene se primenjuju odmah nakon čuvanja.",
      steps: [
        "Kliknite na vaš avatar u gornjem desnom uglu",
        "Izaberite 'Profil'",
        "U tabu 'Osnovni podaci':",
        "• Ime i prezime - Kliknite na polje i unesite novo ime",
        "• Email adresa - Ako želite da promenite email:",
        "  → Unesite novu email adresu",
        "  → Dobićete verifikacioni link na NOVU adresu",
        "  → Kliknite na link da potvrdite promenu",
        "  → Stara adresa će biti zamenjenja novom",
        "• Profilna slika - Kliknite na trenutnu sliku ili placeholder:",
        "  → Upload novu sliku (PNG, JPG, max 2MB)",
        "  → Crop/resize alat će se otvoriti - podesite kako želite",
        "  → Kliknite 'Sačuvaj' - slika će se odmah primeniti",
        "• Valuta - Izaberite primarnu valutu (RSD, EUR, USD, itd.)",
        "  → Svi iznosi će biti prikazani u izabranoj valuti",
        "  → Možete promeniti valutu u bilo kom momentu",
        "• Jezik - Izaberite jezik interfejsa (trenutno: Srpski)",
        "  → Budući: Engleski, Bosanski, Hrvatski",
        "Kliknite 'Sačuvaj izmene' na dnu stranice"
      ],
      tips: [
        "💡 Profilna slika se prikazuje u grupama - pomoć članovima da vas prepoznaju",
        "💡 Promena email-a zahteva verifikaciju - proverite inbox i spam folder",
        "💡 Možete koristiti emoji u imenu za personalizaciju 😊",
        "💡 Valuta se može menjati koliko god puta želite - stari podaci ostaju nepromenjeni"
      ],
      warnings: [
        "⚠️ Promena email-a ne menja vašu prijavu dok ne potvrdite novi email",
        "⚠️ Ako ne potvrdite novi email u roku od 24h, promena će biti otkazana"
      ],
      relatedTopics: ["change-password", "currency-settings"]
    }
  ]
};

export default function HelpButton({ page }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const content = helpContent[page] || [];

  return (
    <>
      {/* Floating Help Button - Top Right */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed top-8 right-8 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg group"
        style={{
          background: "linear-gradient(135deg, #8B5CF6, #6B46C1)",
          boxShadow: "0 2px 8px rgba(139, 92, 246, 0.15)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Question size={24} weight="bold" className="text-white" />
        
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 px-3 py-2 bg-[#1a1b23] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 shadow-xl">
          Pomoć & Tutorijali
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1a1b23]"></div>
        </div>
      </motion.button>

      {/* Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-3xl max-h-[80vh] bg-gradient-to-br from-[#1a1b23] to-[#0f1015] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 border-b border-white/10">
                <div 
                  className="absolute top-0 left-0 right-0 h-32 opacity-20"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #6B46C1)" }}
                />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #8B5CF6, #6B46C1)",
                        boxShadow: "0 4px 12px rgba(139, 92, 246, 0.2)",
                      }}
                    >
                      <Lightbulb size={32} weight="fill" className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Pomoć & Tutorijali</h2>
                      <p className="text-gray-400 mt-1">
                        {page === "dashboard" && "Početna stranica"}
                        {page === "expenses" && "Troškovi"}
                        {page === "incomes" && "Prihodi"}
                        {page === "groups" && "Grupe"}
                        {page === "categories" && "Kategorije"}
                        {page === "statistics" && "Statistika"}
                        {page === "profile" && "Profil"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2"
                  >
                    <X size={28} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)] custom-scrollbar">
                <div className="space-y-4">
                  {content.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all"
                    >
                      <button
                        onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                        className="w-full p-5 flex items-center justify-between text-left group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Question size={18} weight="bold" className="text-purple-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                            {item.question}
                          </h3>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedItem === index ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-gray-400"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {expandedItem === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 space-y-4">
                              <p className="text-gray-300">{item.answer}</p>
                              
                              {item.steps && (
                                <div className="space-y-3">
                                  {item.steps.map((step, stepIndex) => (
                                    <motion.div
                                      key={stepIndex}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: stepIndex * 0.05 }}
                                      className="flex items-start gap-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-3 border border-purple-500/20"
                                    >
                                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs font-bold">{stepIndex + 1}</span>
                                      </div>
                                      <p className="text-sm text-gray-300 flex-1">{step}</p>
                                    </motion.div>
                                  ))}
                                </div>
                              )}

                              {/* Visual Illustrations */}
                              {item.id === "add-expense" && (
                                <div className="mt-6 space-y-4">
                                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-emerald-500/20">
                                    <div className="flex items-center gap-2 mb-4">
                                      <ImageIcon size={20} className="text-emerald-400" />
                                      <h4 className="text-white font-semibold">Vizualni prikaz OCR procesa</h4>
                                    </div>
                                    <svg viewBox="0 0 800 400" className="w-full h-auto">
                                      {/* Upload Icon */}
                                      <rect x="50" y="150" width="120" height="100" rx="10" fill="#7B5CFF" opacity="0.2" stroke="#7B5CFF" strokeWidth="2"/>
                                      <text x="110" y="200" textAnchor="middle" fill="#7B5CFF" fontSize="14" fontWeight="bold">📄 Upload</text>
                                      <text x="110" y="220" textAnchor="middle" fill="#9CA3AF" fontSize="11">Račun</text>
                                      
                                      {/* Arrow 1 */}
                                      <line x1="170" y1="200" x2="230" y2="200" stroke="#7B5CFF" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                                      
                                      {/* OCR Processing */}
                                      <rect x="230" y="150" width="140" height="100" rx="10" fill="#4DB5FF" opacity="0.2" stroke="#4DB5FF" strokeWidth="2"/>
                                      <text x="300" y="195" textAnchor="middle" fill="#4DB5FF" fontSize="14" fontWeight="bold">🔍 OCR Skeniranje</text>
                                      <text x="300" y="215" textAnchor="middle" fill="#9CA3AF" fontSize="10">Tesseract Engine</text>
                                      <text x="300" y="230" textAnchor="middle" fill="#9CA3AF" fontSize="10">Detektovanje teksta</text>
                                      
                                      {/* Arrow 2 */}
                                      <line x1="370" y1="200" x2="430" y2="200" stroke="#4DB5FF" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                                      
                                      {/* Data Extraction */}
                                      <rect x="430" y="150" width="140" height="100" rx="10" fill="#45D38A" opacity="0.2" stroke="#45D38A" strokeWidth="2"/>
                                      <text x="500" y="190" textAnchor="middle" fill="#45D38A" fontSize="14" fontWeight="bold">✨ Ekstrakcija</text>
                                      <text x="500" y="210" textAnchor="middle" fill="#9CA3AF" fontSize="10">Iznos: 2.345 RSD</text>
                                      <text x="500" y="225" textAnchor="middle" fill="#9CA3AF" fontSize="10">Datum: 29.11.2025</text>
                                      <text x="500" y="240" textAnchor="middle" fill="#9CA3AF" fontSize="10">Kat: Električna en.</text>
                                      
                                      {/* Arrow 3 */}
                                      <line x1="570" y1="200" x2="630" y2="200" stroke="#45D38A" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                                      
                                      {/* Preview Modal */}
                                      <rect x="630" y="150" width="120" height="100" rx="10" fill="#E4586E" opacity="0.2" stroke="#E4586E" strokeWidth="2"/>
                                      <text x="690" y="195" textAnchor="middle" fill="#E4586E" fontSize="14" fontWeight="bold">👁️ Pregled</text>
                                      <text x="690" y="215" textAnchor="middle" fill="#9CA3AF" fontSize="10">Potvrdi ili</text>
                                      <text x="690" y="230" textAnchor="middle" fill="#9CA3AF" fontSize="10">koriguj podatke</text>
                                      
                                      {/* Arrow definitions */}
                                      <defs>
                                        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                          <polygon points="0 0, 10 3, 0 6" fill="#7B5CFF"/>
                                        </marker>
                                      </defs>
                                    </svg>
                                  </div>
                                </div>
                              )}

                              {item.id === "ocr-how-it-works" && (
                                <div className="mt-6 space-y-4">
                                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
                                    <h4 className="text-white font-semibold mb-4">📊 Tačnost OCR-a po tipu računa</h4>
                                    <div className="space-y-3">
                                      {[
                                        { name: "EPS (Električna energija)", accuracy: 92, color: "#45D38A" },
                                        { name: "BVK (Voda i kanalizacija)", accuracy: 89, color: "#4DB5FF" },
                                        { name: "Telekom (Internet/TV)", accuracy: 88, color: "#7B5CFF" },
                                        { name: "Yettel/A1 (Mobilni)", accuracy: 85, color: "#E4586E" },
                                        { name: "Supermarket računi", accuracy: 78, color: "#FFA500" },
                                        { name: "Restorani i kafići", accuracy: 72, color: "#FF6B6B" }
                                      ].map((item, idx) => (
                                        <div key={idx} className="space-y-1">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-300">{item.name}</span>
                                            <span className="text-white font-semibold">{item.accuracy}%</span>
                                          </div>
                                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: `${item.accuracy}%` }}
                                              transition={{ duration: 1, delay: idx * 0.1 }}
                                              className="h-full rounded-full"
                                              style={{ backgroundColor: item.color }}
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4 text-center">
                                      * Prosečna tačnost: <span className="text-emerald-400 font-bold">86%</span> na testnom setu od 500+ računa
                                    </p>
                                  </div>
                                </div>
                              )}

                              {item.id === "dashboard-stats" && (
                                <div className="mt-6 space-y-4">
                                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
                                    <h4 className="text-white font-semibold mb-4">💳 Primer Dashboard kartica</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {/* Troškovi Card */}
                                      <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl p-4 border border-red-500/30">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs text-red-300">Ukupni troškovi</span>
                                          <div className="w-6 h-6 bg-red-500/30 rounded-lg flex items-center justify-center">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                              <path d="M12 6L8 10L4 6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                          </div>
                                        </div>
                                        <div className="text-2xl font-bold text-white mb-1">87.450 RSD</div>
                                        <div className="text-xs text-gray-400 bg-red-500/20 rounded-md px-2 py-1 inline-block">
                                          Novembar: 12.300 RSD
                                        </div>
                                      </div>
                                      
                                      {/* Prihodi Card */}
                                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs text-green-300">Ukupni prihodi</span>
                                          <div className="w-6 h-6 bg-green-500/30 rounded-lg flex items-center justify-center">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                              <path d="M4 10L8 6L12 10" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                          </div>
                                        </div>
                                        <div className="text-2xl font-bold text-white mb-1">125.000 RSD</div>
                                        <div className="text-xs text-gray-400 bg-green-500/20 rounded-md px-2 py-1 inline-block">
                                          Novembar: 50.000 RSD
                                        </div>
                                      </div>
                                      
                                      {/* Bilans Card */}
                                      <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs text-purple-300">Bilans</span>
                                          <div className="w-6 h-6 bg-purple-500/30 rounded-lg flex items-center justify-center">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                              <rect x="3" y="7" width="10" height="2" rx="1" fill="#A78BFA"/>
                                            </svg>
                                          </div>
                                        </div>
                                        <div className="text-2xl font-bold text-green-400 mb-1">+37.550 RSD</div>
                                        <div className="text-xs text-gray-400">
                                          <span className="text-emerald-400">✓</span> Pozitivan bilans
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {item.id === "split-expenses" && (
                                <div className="mt-6 space-y-4">
                                  <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-2xl p-6 border border-teal-500/20">
                                    <h4 className="text-white font-semibold mb-4">🧮 Primer automatske podele</h4>
                                    <div className="space-y-4">
                                      <div className="bg-white/5 rounded-xl p-4">
                                        <div className="text-sm text-gray-400 mb-2">Scenario:</div>
                                        <div className="text-white">Grupa "Stan" - 3 člana (Marko, Ana, Luka)</div>
                                        <div className="text-white">Ukupni troškovi: 8.000 RSD</div>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/30">
                                          <div className="text-xs text-blue-300 mb-1">Marko platio</div>
                                          <div className="text-lg font-bold text-white">5.000 RSD</div>
                                        </div>
                                        <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/30">
                                          <div className="text-xs text-purple-300 mb-1">Ana platila</div>
                                          <div className="text-lg font-bold text-white">2.000 RSD</div>
                                        </div>
                                        <div className="bg-pink-500/10 rounded-xl p-3 border border-pink-500/30">
                                          <div className="text-xs text-pink-300 mb-1">Luka platio</div>
                                          <div className="text-lg font-bold text-white">1.000 RSD</div>
                                        </div>
                                      </div>
                                      
                                      <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                                        <div className="text-sm text-emerald-300 font-semibold mb-2">📊 Jednaka podela:</div>
                                        <div className="text-white">8.000 RSD ÷ 3 = <span className="text-emerald-400 font-bold">2.667 RSD</span> po osobi</div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <div className="text-sm text-gray-300 font-semibold">💰 Ko kome duguje:</div>
                                        <div className="flex items-center gap-2 bg-orange-500/10 rounded-lg p-3 border border-orange-500/30">
                                          <span className="text-orange-300">Luka →</span>
                                          <span className="text-white">Marko:</span>
                                          <span className="text-orange-400 font-bold ml-auto">1.667 RSD</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/30">
                                          <span className="text-yellow-300">Ana →</span>
                                          <span className="text-white">Marko:</span>
                                          <span className="text-yellow-400 font-bold ml-auto">667 RSD</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {item.id === "read-charts" && (
                                <div className="mt-6 space-y-4">
                                  <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-indigo-500/20">
                                    <h4 className="text-white font-semibold mb-4">📈 Tipovi grafikona</h4>
                                    
                                    {/* Line Chart Example */}
                                    <div className="mb-6 bg-white/5 rounded-xl p-4">
                                      <div className="text-sm text-indigo-300 font-semibold mb-3">LINE CHART - Trend kroz vreme</div>
                                      <svg viewBox="0 0 400 150" className="w-full h-auto">
                                        {/* Grid */}
                                        <line x1="40" y1="130" x2="380" y2="130" stroke="#374151" strokeWidth="1"/>
                                        <line x1="40" y1="100" x2="380" y2="100" stroke="#374151" strokeWidth="1" strokeDasharray="2,2"/>
                                        <line x1="40" y1="70" x2="380" y2="70" stroke="#374151" strokeWidth="1" strokeDasharray="2,2"/>
                                        <line x1="40" y1="40" x2="380" y2="40" stroke="#374151" strokeWidth="1" strokeDasharray="2,2"/>
                                        
                                        {/* Axes */}
                                        <line x1="40" y1="10" x2="40" y2="130" stroke="#6B7280" strokeWidth="2"/>
                                        <line x1="40" y1="130" x2="380" y2="130" stroke="#6B7280" strokeWidth="2"/>
                                        
                                        {/* Expenses Line (Red) */}
                                        <polyline
                                          points="60,110 120,95 180,100 240,85 300,90 360,80"
                                          fill="none"
                                          stroke="#EF4444"
                                          strokeWidth="3"
                                          strokeLinecap="round"
                                        />
                                        
                                        {/* Incomes Line (Green) */}
                                        <polyline
                                          points="60,100 120,80 180,85 240,70 300,75 360,60"
                                          fill="none"
                                          stroke="#10B981"
                                          strokeWidth="3"
                                          strokeLinecap="round"
                                        />
                                        
                                        {/* Labels */}
                                        <text x="50" y="145" fill="#9CA3AF" fontSize="10">Jan</text>
                                        <text x="110" y="145" fill="#9CA3AF" fontSize="10">Feb</text>
                                        <text x="170" y="145" fill="#9CA3AF" fontSize="10">Mar</text>
                                        <text x="230" y="145" fill="#9CA3AF" fontSize="10">Apr</text>
                                        <text x="290" y="145" fill="#9CA3AF" fontSize="10">Maj</text>
                                        <text x="350" y="145" fill="#9CA3AF" fontSize="10">Jun</text>
                                        
                                        {/* Legend */}
                                        <circle cx="290" cy="20" r="4" fill="#EF4444"/>
                                        <text x="300" y="23" fill="#EF4444" fontSize="10">Troškovi</text>
                                        <circle cx="290" cy="35" r="4" fill="#10B981"/>
                                        <text x="300" y="38" fill="#10B981" fontSize="10">Prihodi</text>
                                      </svg>
                                    </div>
                                    
                                    {/* Pie Chart Example */}
                                    <div className="mb-6 bg-white/5 rounded-xl p-4">
                                      <div className="text-sm text-purple-300 font-semibold mb-3">PIE CHART - Raspodela po kategorijama</div>
                                      <svg viewBox="0 0 250 180" className="w-full h-auto">
                                        {/* Pie slices */}
                                        <path d="M 125 90 L 125 30 A 60 60 0 0 1 185 90 Z" fill="#EF4444" opacity="0.8"/>
                                        <path d="M 125 90 L 185 90 A 60 60 0 0 1 155 140 Z" fill="#F59E0B" opacity="0.8"/>
                                        <path d="M 125 90 L 155 140 A 60 60 0 0 1 95 140 Z" fill="#10B981" opacity="0.8"/>
                                        <path d="M 125 90 L 95 140 A 60 60 0 0 1 65 90 Z" fill="#3B82F6" opacity="0.8"/>
                                        <path d="M 125 90 L 65 90 A 60 60 0 0 1 125 30 Z" fill="#8B5CF6" opacity="0.8"/>
                                        
                                        {/* Labels */}
                                        <text x="10" y="30" fill="#EF4444" fontSize="10">Hrana 30%</text>
                                        <text x="10" y="50" fill="#F59E0B" fontSize="10">Transport 20%</text>
                                        <text x="10" y="70" fill="#10B981" fontSize="10">Računi 25%</text>
                                        <text x="10" y="90" fill="#3B82F6" fontSize="10">Zabava 15%</text>
                                        <text x="10" y="110" fill="#8B5CF6" fontSize="10">Ostalo 10%</text>
                                      </svg>
                                    </div>
                                    
                                    {/* Bar Chart Example */}
                                    <div className="bg-white/5 rounded-xl p-4">
                                      <div className="text-sm text-pink-300 font-semibold mb-3">BAR CHART - Poređenje po mesecima</div>
                                      <svg viewBox="0 0 350 150" className="w-full h-auto">
                                        {/* Grid */}
                                        <line x1="40" y1="130" x2="340" y2="130" stroke="#6B7280" strokeWidth="2"/>
                                        
                                        {/* Bars - Month 1 */}
                                        <rect x="60" y="70" width="20" height="60" fill="#10B981" opacity="0.8"/>
                                        <rect x="85" y="80" width="20" height="50" fill="#EF4444" opacity="0.8"/>
                                        
                                        {/* Bars - Month 2 */}
                                        <rect x="125" y="60" width="20" height="70" fill="#10B981" opacity="0.8"/>
                                        <rect x="150" y="75" width="20" height="55" fill="#EF4444" opacity="0.8"/>
                                        
                                        {/* Bars - Month 3 */}
                                        <rect x="190" y="50" width="20" height="80" fill="#10B981" opacity="0.8"/>
                                        <rect x="215" y="70" width="20" height="60" fill="#EF4444" opacity="0.8"/>
                                        
                                        {/* Bars - Month 4 */}
                                        <rect x="255" y="55" width="20" height="75" fill="#10B981" opacity="0.8"/>
                                        <rect x="280" y="65" width="20" height="65" fill="#EF4444" opacity="0.8"/>
                                        
                                        {/* Labels */}
                                        <text x="65" y="145" fill="#9CA3AF" fontSize="10">Jan</text>
                                        <text x="130" y="145" fill="#9CA3AF" fontSize="10">Feb</text>
                                        <text x="195" y="145" fill="#9CA3AF" fontSize="10">Mar</text>
                                        <text x="260" y="145" fill="#9CA3AF" fontSize="10">Apr</text>
                                        
                                        {/* Legend */}
                                        <rect x="250" y="15" width="12" height="12" fill="#10B981"/>
                                        <text x="265" y="24" fill="#10B981" fontSize="10">Prihodi</text>
                                        <rect x="250" y="30" width="12" height="12" fill="#EF4444"/>
                                        <text x="265" y="39" fill="#EF4444" fontSize="10">Troškovi</text>
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {item.id === "yoy-mom" && (
                                <div className="mt-6 space-y-4">
                                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl p-6 border border-cyan-500/20">
                                    <h4 className="text-white font-semibold mb-4">📊 YoY i MoM vizuelno objašnjenje</h4>
                                    
                                    {/* YoY Visualization */}
                                    <div className="mb-6 bg-white/5 rounded-xl p-4">
                                      <div className="text-sm text-cyan-300 font-semibold mb-3">YoY (Year over Year) - Godišnja promena</div>
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="text-center flex-1">
                                          <div className="text-xs text-gray-400 mb-2">Novembar 2024</div>
                                          <div className="bg-blue-500/20 rounded-xl p-3 border border-blue-500/30">
                                            <div className="text-2xl font-bold text-white">40.000</div>
                                            <div className="text-xs text-gray-400">RSD troškovi</div>
                                          </div>
                                        </div>
                                        
                                        <div className="px-4">
                                          <svg width="40" height="40" viewBox="0 0 40 40">
                                            <path d="M10 20 L30 20 M30 20 L25 15 M30 20 L25 25" stroke="#06B6D4" strokeWidth="2" fill="none"/>
                                          </svg>
                                        </div>
                                        
                                        <div className="text-center flex-1">
                                          <div className="text-xs text-gray-400 mb-2">Novembar 2025</div>
                                          <div className="bg-emerald-500/20 rounded-xl p-3 border border-emerald-500/30">
                                            <div className="text-2xl font-bold text-white">50.000</div>
                                            <div className="text-xs text-gray-400">RSD troškovi</div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-3 border border-orange-500/30">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="text-xs text-orange-300">YoY promena</div>
                                            <div className="text-white font-semibold">+25%</div>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-xs text-gray-400">Povećanje</div>
                                            <div className="text-orange-400 font-bold">+10.000 RSD</div>
                                          </div>
                                          <svg width="24" height="24" viewBox="0 0 24 24">
                                            <path d="M12 19V5 M12 5L5 12 M12 5L19 12" stroke="#F97316" strokeWidth="2" fill="none" strokeLinecap="round"/>
                                          </svg>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* MoM Visualization */}
                                    <div className="bg-white/5 rounded-xl p-4">
                                      <div className="text-sm text-blue-300 font-semibold mb-3">MoM (Month over Month) - Mesečna promena</div>
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="text-center flex-1">
                                          <div className="text-xs text-gray-400 mb-2">Oktobar 2025</div>
                                          <div className="bg-purple-500/20 rounded-xl p-3 border border-purple-500/30">
                                            <div className="text-2xl font-bold text-white">45.000</div>
                                            <div className="text-xs text-gray-400">RSD troškovi</div>
                                          </div>
                                        </div>
                                        
                                        <div className="px-4">
                                          <svg width="40" height="40" viewBox="0 0 40 40">
                                            <path d="M10 20 L30 20 M30 20 L25 15 M30 20 L25 25" stroke="#3B82F6" strokeWidth="2" fill="none"/>
                                          </svg>
                                        </div>
                                        
                                        <div className="text-center flex-1">
                                          <div className="text-xs text-gray-400 mb-2">Novembar 2025</div>
                                          <div className="bg-pink-500/20 rounded-xl p-3 border border-pink-500/30">
                                            <div className="text-2xl font-bold text-white">50.000</div>
                                            <div className="text-xs text-gray-400">RSD troškovi</div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-3 border border-yellow-500/30">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="text-xs text-yellow-300">MoM promena</div>
                                            <div className="text-white font-semibold">+11.1%</div>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-xs text-gray-400">Povećanje</div>
                                            <div className="text-yellow-400 font-bold">+5.000 RSD</div>
                                          </div>
                                          <svg width="24" height="24" viewBox="0 0 24 24">
                                            <path d="M12 19V5 M12 5L5 12 M12 5L19 12" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round"/>
                                          </svg>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Tips Section */}
                              {item.tips && item.tips.length > 0 && (
                                <div className="mt-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-500/20">
                                  <div className="flex items-start gap-3">
                                    <Lightbulb size={20} weight="fill" className="text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <h4 className="text-emerald-300 font-semibold mb-2">Saveti</h4>
                                      <ul className="space-y-2">
                                        {item.tips.map((tip, tipIdx) => (
                                          <li key={tipIdx} className="text-sm text-gray-300">{tip}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Warnings Section */}
                              {item.warnings && item.warnings.length > 0 && (
                                <div className="mt-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
                                  <div className="flex items-start gap-3">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-0.5">
                                      <path d="M10 6V11M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    <div className="flex-1">
                                      <h4 className="text-orange-300 font-semibold mb-2">Upozorenja</h4>
                                      <ul className="space-y-2">
                                        {item.warnings.map((warning, warnIdx) => (
                                          <li key={warnIdx} className="text-sm text-gray-300">{warning}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Video Tutorial Link */}
                              {item.videoUrl && (
                                <div className="mt-4">
                                  <a
                                    href={item.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl p-4 border border-red-500/20 hover:border-red-500/40 transition-all group"
                                  >
                                    <VideoCamera size={24} weight="fill" className="text-red-400" />
                                    <div className="flex-1">
                                      <div className="text-white font-semibold group-hover:text-red-400 transition-colors">Video Tutorial</div>
                                      <div className="text-xs text-gray-400">Pogledajte detaljno objašnjenje</div>
                                    </div>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-red-400">
                                      <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </a>
                                </div>
                              )}

                              {/* Related Topics */}
                              {item.relatedTopics && item.relatedTopics.length > 0 && (
                                <div className="mt-4">
                                  <div className="text-sm text-gray-400 mb-2">📚 Povezane teme:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {item.relatedTopics.map((topic, topicIdx) => (
                                      <button
                                        key={topicIdx}
                                        className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs text-purple-300 hover:bg-purple-500/20 transition-all"
                                      >
                                        {topic}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Tips */}
                <div className="mt-8 p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={24} weight="fill" className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold mb-2">💡 Brzi Savet</h4>
                      <p className="text-sm text-gray-300">
                        {page === "dashboard" && "Koristite OCR za brzo dodavanje troškova - jednostavno uploadujte račun i sistem će sve sam popuniti!"}
                        {page === "expenses" && "Postavite ponavljajuće troškove za račune koji dolaze svaki mesec - aplikacija će vas podsetiti!"}
                        {page === "incomes" && "Redovno ažurirajte prihode da biste imali tačnu sliku svog budžeta."}
                        {page === "groups" && "Kreirajte grupu sa cimerom ili porodicom da automatski podelite troškove - fer i bez cimanja!"}
                        {page === "categories" && "Kategorije vam pomažu da vidite gde najviše trošite - to je prvi korak ka boljoj kontroli budžeta!"}
                        {page === "statistics" && "Redovno pregledajte grafikone da identifikujete trendove u trošenju."}
                        {page === "profile" && "Omogućite notifikacije da ne propustite važne podsetnik e o ponavljajućim troškovima!"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

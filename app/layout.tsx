import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Spline_Sans_Mono } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/lib/themeScript";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-spline",
});

const FAVICON =
  "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 30 30%22><circle cx=%2215%22 cy=%2215%22 r=%2213%22 fill=%22none%22 stroke=%22%23629FAD%22 stroke-width=%222.4%22/><path d=%22M15 6.5 L18 15 L15 23.5 L12 15 Z%22 fill=%22%23629FAD%22/><circle cx=%2215%22 cy=%2215%22 r=%222.2%22 fill=%22%23EDEDCE%22/></svg>";
  
export const metadata: Metadata = {
  title: "Rumbo — Test vocacional para jóvenes",
  description:
    "Descubre qué carrera va contigo: test vocacional RIASEC de 48 preguntas con tu código Holland, carreras afines, universidades por departamento y becas en Colombia.",
  authors: [{ name: "Franck E. Peñaloza" }],
  openGraph: {
    title: "Rumbo — Test vocacional",
    description:
      "Descubre qué carrera va contigo: test RIASEC con universidades y becas en Colombia. Gratis, 6-8 minutos.",
    type: "website",
    locale: "es_CO",
  },
  icons: { icon: FAVICON },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E7C66",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${instrument.variable} ${splineMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

import "./styles.css";

export const metadata = {
  title: "Discovery Sprint 3",
  description: "Stewardship engine"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

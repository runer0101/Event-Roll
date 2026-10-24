import { ScrollReveal } from "@/components/motion/scroll-reveal";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollReveal />
      <div className="page-enter">{children}</div>
    </>
  );
}

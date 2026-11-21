import { cn } from '../../lib/utils';
import Container from './Container';

const tones = {
  paper: 'bg-ed-paper',
  tint: 'bg-ed-paper-2',
  navy: 'bg-ed-navy-2 text-white',
};

export default function Section({
  children,
  className,
  id,
  tone = 'paper',
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  tone?: keyof typeof tones;
}) {
  return (
    <section className={cn('py-12 md:py-16', tones[tone], className)} id={id}>
      <Container>{children}</Container>
    </section>
  );
}

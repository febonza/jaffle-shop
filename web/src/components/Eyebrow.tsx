interface Props {
  number?: string;
  children: string;
}

export default function Eyebrow({ number, children }: Props) {
  return (
    <div className="eyebrow">
      {number ? <>{number} / </> : null}
      {children}
    </div>
  );
}

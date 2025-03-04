const FormSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );